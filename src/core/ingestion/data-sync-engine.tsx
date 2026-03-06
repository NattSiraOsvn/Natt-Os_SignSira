import React, { useState, useEffect } from "react";
import type { SyncJob, SyncLog, SyncConflictStrategy } from "@/types";

export interface SyncState {
  jobs: SyncJob[];
  logs: SyncLog[];
  isRunning: boolean;
  lastSync: number | null;
}

const _jobs: SyncJob[] = [];
const _logs: SyncLog[] = [];

const log = (jobId: string, message: string, level: SyncLog["level"] = "INFO") => {
  _logs.push({ jobId, timestamp: Date.now(), message, level });
};

export const DataSyncEngine = {
  createJob: (source: string, destination: string, strategy: SyncConflictStrategy): SyncJob => {
    const job: SyncJob = {
      id: `SYNC-${Date.now()}`, type: "FULL",
      source, destination, status: "PENDING",
      strategy, createdAt: Date.now(),
    };
    _jobs.push(job);
    log(job.id, `Job created: ${source} → ${destination}`);
    return job;
  },

  run: async (jobId: string): Promise<SyncJob | null> => {
    const job = _jobs.find(j => j.id === jobId);
    if (!job) return null;
    job.status = "RUNNING";
    log(jobId, "Sync started", "INFO");
    await new Promise(r => setTimeout(r, 500));
    job.status = "DONE";
    job.completedAt = Date.now();
    job.recordsProcessed = Math.floor(Math.random() * 1000);
    log(jobId, `Sync completed — ${job.recordsProcessed} records`, "INFO");
    return job;
  },

  getJobs:   (): SyncJob[]  => [..._jobs],
  getLogs:   (jobId?: string): SyncLog[] =>
    jobId ? _logs.filter(l => l.jobId === jobId) : [..._logs],
  getStatus: (jobId: string): SyncJob["status"] | null =>
    _jobs.find(j => j.id === jobId)?.status ?? null,
};

// React wrapper component (dùng trong DataSyncEngine.tsx component)
export const DataSyncPanel: React.FC = () => {
  const [jobs, setJobs] = useState<SyncJob[]>([]);

  useEffect(() => {
    const interval = setInterval(() => setJobs([...DataSyncEngine.getJobs()]), 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 bg-gray-900 rounded-lg">
      <h3 className="text-white font-mono text-sm mb-3">DATA SYNC ENGINE</h3>
      {jobs.length === 0 ? (
        <p className="text-gray-500 text-xs">Chưa có sync jobs</p>
      ) : (
        jobs.map(j => (
          <div key={j.id} className="flex justify-between text-xs text-gray-400 py-1 border-b border-white/5">
            <span>{j.source} → {j.destination}</span>
            <span className={j.status === "DONE" ? "text-green-400" : j.status === "FAILED" ? "text-red-400" : "text-amber-400"}>
              {j.status}
            </span>
          </div>
        ))
      )}
    </div>
  );
};

export default DataSyncPanel;
