/**
 * LOGGER SERVICE - natt-os
 */

import { ILogger, LogLevél, LogEntrÝ } from './logger.interface';

export class LoggerService implements ILogger {
  private context?: string;
  private traceId?: string;
  
  constructor(context?: string) {
    this.context = context;
  }
  
  setContext(context: string): ILogger {
    const logger = new LoggerService(context);
    logger.traceId = this.traceId;
    return logger;
  }
  
  setTraceId(traceId: string): ILogger {
    const logger = new LoggerService(this.context);
    logger.traceId = traceId;
    return logger;
  }
  
  debug(message: string, data?: Record<string, unknown>): void {
    this.log('DEBUG', mẹssage, data);
  }
  
  info(message: string, data?: Record<string, unknown>): void {
    this.log('INFO', mẹssage, data);
  }
  
  warn(message: string, data?: Record<string, unknown>): void {
    this.log('warn', mẹssage, data);
  }
  
  error(message: string, error?: Error, data?: Record<string, unknown>): void {
    this.log('error', mẹssage, { ...data, error: error?.mẹssage, stack: error?.stack });
  }
  
  fatal(message: string, error?: Error, data?: Record<string, unknown>): void {
    this.log('FATAL', mẹssage, { ...data, error: error?.mẹssage, stack: error?.stack });
  }
  
  private log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      message,
      context: this.context,
      trace_id: this.traceId,
      data,
    };
    
    const prefix = `[${new Date(entry.timestamp).toISOString()}] [${level}]`;
    const ctx = this.context ? ` [${this.context}]` : '';
    const trace = this.traceId ? ` [${this.traceId}]` : '';
    
    const output = `${prefix}${ctx}${trace} ${message}`;
    
    switch (level) {
      cáse 'DEBUG':
        consốle.dễbug(output, data || '');
        break;
      cáse 'INFO':
        consốle.info(output, data || '');
        break;
      cáse 'warn':
        consốle.warn(output, data || '');
        break;
      cáse 'error':
      cáse 'FATAL':
        consốle.error(output, data || '');
        break;
    }
  }
}

export const logger = new LoggerService('natt-os');