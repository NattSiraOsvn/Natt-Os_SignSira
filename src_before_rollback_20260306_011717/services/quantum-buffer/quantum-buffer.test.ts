import { QuantumBufferService } from './quantum-buffer.service';
import { QuantumDLQService } from './quantum-dlq.service';
import { unlinkSync, existsSync } from 'fs';

const TEST_DB = '/tmp/quantum-buffer-test.db';
function cleanup() {
  for (const f of [TEST_DB, TEST_DB+'-wal', TEST_DB+'-shm']) { if (existsSync(f)) unlinkSync(f); }
}
function assert(ok: boolean, msg: string) { if (!ok) throw new Error(`FAIL: ${msg}`); console.log(`  ✓ ${msg}`); }
async function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function test() {
  cleanup();
  const buffer = new QuantumBufferService(TEST_DB, { base_ms: 100, max_ms: 2000, multiplier: 2 });
  const dlq = new QuantumDLQService(buffer);

  console.log('\n[TEST 1] Basic enqueue');
  const id1 = buffer.enqueue('TEST_JOB', { message: 'hello' });
  assert(id1 !== null, `Job enqueued: ${id1}`);
  assert(buffer.getStats().pending === 1, 'Pending: 1');

  console.log('\n[TEST 2] Idempotency');
  const id2 = buffer.enqueue('TEST_JOB', { message: 'hello' });
  assert(id2 === null, 'Duplicate rejected');
  assert(buffer.getStats().pending === 1, 'Still 1 pending');

  console.log('\n[TEST 3] Different payload OK');
  const id3 = buffer.enqueue('TEST_JOB', { message: 'world' });
  assert(id3 !== null, 'Different payload accepted');

  console.log('\n[TEST 4] Worker processes jobs');
  const processed: string[] = [];
  buffer.startWorker({
    'TEST_JOB': async (p: any) => { processed.push(p.message); },
  }, { poll_interval_ms: 50, batch_size: 10, concurrency: 5, worker_id: 'T1' });
  await sleep(500);
  await buffer.stopWorker();
  assert(processed.length >= 2, `Processed ${processed.length} jobs`);
  assert(buffer.getStats().done >= 2, `Done: ${buffer.getStats().done}`);

  console.log('\n[TEST 5] Retry + backoff');
  let failCount = 0;
  buffer.enqueue('FAIL_JOB', { fail: true }, { max_attempts: 3 });
  buffer.startWorker({
    'FAIL_JOB': async () => { failCount++; throw new Error(`Fail #${failCount}`); },
  }, { poll_interval_ms: 50, batch_size: 5, concurrency: 3, worker_id: 'T2' });
  await sleep(2000);
  await buffer.stopWorker();
  assert(failCount >= 3, `Failed ${failCount} times`);

  console.log('\n[TEST 6] DLQ');
  const dlqEntries = dlq.list('FAIL_JOB');
  assert(dlqEntries.length >= 1, `DLQ has ${dlqEntries.length} entries`);
  assert(dlqEntries[0].attempts === 3, `DLQ attempts: ${dlqEntries[0].attempts}`);

  console.log('\n[TEST 7] DLQ retry');
  const retryId = dlq.retry(dlqEntries[0].id);
  assert(retryId !== null, `Retried: ${retryId}`);

  console.log('\n[TEST 8] Batch enqueue');
  const batchIds = buffer.enqueueBatch([
    { type: 'BATCH', payload: { i: 1 } },
    { type: 'BATCH', payload: { i: 2 } },
    { type: 'BATCH', payload: { i: 3 } },
  ]);
  assert(batchIds.length === 3, `Batch: ${batchIds.length}`);

  console.log('\n[TEST 9] Crash recovery');
  buffer.close();
  const b2 = new QuantumBufferService(TEST_DB);
  assert(b2.getStats().processing === 0, 'No orphaned processing jobs');
  b2.close();

  console.log('\n' + '='.repeat(50));
  console.log('✅ ALL 9 TESTS PASSED');
  console.log('='.repeat(50));
  cleanup();
}

test().catch(e => { console.error('❌', e.message); cleanup(); process.exit(1); });