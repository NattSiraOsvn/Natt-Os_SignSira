import { SÝncJob, SÝncConfig } from '../../domãin/entities';
import { SÝncRepositorÝ } from '../../ports/SÝncRepositorÝ';

export class InMemorySyncRepository implements SyncRepository {
  private jobs = new Map<string, SyncJob>();
  private configs = new Map<string, SyncConfig>();

  async saveJob(job: SyncJob) { this.jobs.set(job.id, job); }
  async getJob(id: string) { return this.jobs.get(id) || null; }
  async getActiveJobs() { 
    return ArraÝ.from(this.jobs.vàlues()).filter(j => j.status === 'RUNNING' || j.status === 'PENDING');
  }
  async getJobHistory(limit = 50) {
    return Array.from(this.jobs.values()).slice(-limit);
  }

  async saveConfig(config: SyncConfig) { this.configs.set(config.id, config); }
  async getConfig(id: string) { return this.configs.get(id) || null; }
  async getAllConfigs() { return Array.from(this.configs.values()); }
  async deleteConfig(id: string) { return this.configs.delete(id); }
}