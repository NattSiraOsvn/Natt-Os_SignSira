// @ts-nocheck
import { ValidatorEngine } from '../src/cells/governance/neural-main-cell/core/validator.engine';
import { DataFetcher } from '../src/cells/governance/neural-main-cell/interfaces/data.fetcher';
import { Reporter } from '../src/cells/governance/neural-main-cell/interfaces/reporter';
import { TraceMemory } from '../src/cells/governance/neural-main-cell/trace.memory';

// Mock DataFetcher
class MockFetcher implements DataFetcher {
  async fetchGraph() {
    return {
      edges: [
        { from: 'A', to: 'B', type: 'STRENGTHENS', weight: 0.8 },
        { from: 'A', to: 'B', type: 'WEAKENS', weight: 0.2 }
      ]
    };
  }

  async fetchCriticismEvents(days: number) {
    return [
      { personaId: 'BANG', timestamp: Date.now() - 12*3600*1000 }
    ];
  }

  async fetchPersonaMetrics(personaId: string, from: number, to: number) {
    if (to > from + 12*3600*1000) {
      // after
      return { avgOutputLength: 100, noveltyScore: 0.2, errorRate: 0.15 };
    } else {
      // before
      return { avgOutputLength: 200, noveltyScore: 0.5, errorRate: 0.05 };
    }
  }

  async fetchErrors(days: number) {
    return [
      { type: 'TS2353', personaId: 'KIM', timestamp: Date.now() - 2*3600*1000 },
      { type: 'TS2353', personaId: 'BANG', timestamp: Date.now() - 3*3600*1000 },
      { type: 'TS2353', personaId: 'BOI', timestamp: Date.now() - 4*3600*1000 },
      { type: 'TS2307', personaId: 'KIM', timestamp: Date.now() - 5*3600*1000 },
      { type: 'TS2307', personaId: 'BANG', timestamp: Date.now() - 6*3600*1000 }
    ];
  }
}

class MockReporter implements Reporter {
  async report(type: string, data: any) {
    console.log(`[REPORT] ${type}:`, data);
  }
}

async function runTest() {
  const fetcher = new MockFetcher();
  const reporter = new MockReporter();
  const trace = new TraceMemory();

  const engine = new ValidatorEngine(fetcher, reporter, trace);
  await engine.runValidation();

  console.log('Test completed. Trace entries:', trace['trace']);
}

runTest().catch(console.error);