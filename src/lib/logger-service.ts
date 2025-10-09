/**
 * Logger Service for Bali Report
 * Centralized logging with environment-aware levels and structured output
 */

import { env } from './env';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  data?: any;
  context?: string;
  stack?: string;
}

class Logger {
  private minLevel: LogLevel;
  private context: string;

  constructor(context: string = 'App', minLevel?: LogLevel) {
    this.context = context;
    this.minLevel = minLevel ?? this.getDefaultLogLevel();
  }

  /**
   * Get default log level based on environment
   */
  private getDefaultLogLevel(): LogLevel {
    if (env.nodeEnv === 'production') {
      return LogLevel.WARN;
    }
    if (env.nodeEnv === 'test') {
      return LogLevel.ERROR;
    }
    return env.debug ? LogLevel.DEBUG : LogLevel.INFO;
  }

  /**
   * Should log based on current level
   */
  private shouldLog(level: LogLevel): boolean {
    return level <= this.minLevel;
  }

  /**
   * Format log entry
   */
  private formatLogEntry(
    level: string,
    message: string,
    data?: any,
    error?: Error
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      context: this.context,
      stack: error?.stack,
    };
  }

  /**
   * Get emoji for log level
   */
  private getEmoji(level: string): string {
    switch (level) {
      case 'ERROR':
        return '❌';
      case 'WARN':
        return '⚠️';
      case 'INFO':
        return 'ℹ️';
      case 'DEBUG':
        return '🔍';
      default:
        return '📝';
    }
  }

  /**
   * Output log to console (development) or external service (production)
   */
  private output(entry: LogEntry): void {
    const { level, message, data, context, stack } = entry;
    const emoji = this.getEmoji(level);
    const prefix = `${emoji} [${context}]`;

    if (env.nodeEnv === 'production') {
      // In production, send to external logging service (e.g., Sentry, LogRocket)
      // For now, still log errors to console
      if (level === 'ERROR') {
        console.error(prefix, message, data, stack);
      }
      // TODO: Send to external logging service
      return;
    }

    // Development logging with colors
    const styles = {
      ERROR: 'color: #ff4444; font-weight: bold',
      WARN: 'color: #ffaa00; font-weight: bold',
      INFO: 'color: #44aaff; font-weight: bold',
      DEBUG: 'color: #888888',
    };

    if (typeof window !== 'undefined') {
      // Browser console with styling
      console.log(`%c${prefix} ${message}`, styles[level as keyof typeof styles] || '', data || '');
    } else {
      // Node.js console (no styling)
      console.log(prefix, message, data || '');
    }

    if (stack && level === 'ERROR') {
      console.error(stack);
    }
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | any, data?: any): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;

    const entry = this.formatLogEntry('ERROR', message, data, error);
    this.output(entry);
  }

  /**
   * Log warning message
   */
  warn(message: string, data?: any): void {
    if (!this.shouldLog(LogLevel.WARN)) return;

    const entry = this.formatLogEntry('WARN', message, data);
    this.output(entry);
  }

  /**
   * Log info message
   */
  info(message: string, data?: any): void {
    if (!this.shouldLog(LogLevel.INFO)) return;

    const entry = this.formatLogEntry('INFO', message, data);
    this.output(entry);
  }

  /**
   * Log debug message
   */
  debug(message: string, data?: any): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;

    const entry = this.formatLogEntry('DEBUG', message, data);
    this.output(entry);
  }

  /**
   * Create child logger with specific context
   */
  child(context: string): Logger {
    return new Logger(`${this.context}:${context}`, this.minLevel);
  }

  /**
   * Set minimum log level
   */
  setLevel(level: LogLevel): void {
    this.minLevel = level;
  }
}

/**
 * Create logger instance
 */
export function createLogger(context: string, level?: LogLevel): Logger {
  return new Logger(context, level);
}

/**
 * Default logger instance
 */
export const logger = new Logger('BaliReport');

/**
 * Specialized loggers for different modules
 */
export const loggers = {
  rss: createLogger('RSS'),
  api: createLogger('API'),
  auth: createLogger('Auth'),
  db: createLogger('Database'),
  cache: createLogger('Cache'),
  websocket: createLogger('WebSocket'),
  newsletter: createLogger('Newsletter'),
  payment: createLogger('Payment'),
  analytics: createLogger('Analytics'),
  moderation: createLogger('Moderation'),
};

/**
 * Helper function to replace console.log calls
 * Usage: log('Message', { data: 'value' });
 */
export function log(message: string, data?: any): void {
  logger.info(message, data);
}

/**
 * Helper function to log errors
 * Usage: logError('Error message', error);
 */
export function logError(message: string, error?: Error | any, data?: any): void {
  logger.error(message, error, data);
}

/**
 * Helper function to log warnings
 * Usage: logWarn('Warning message', { data: 'value' });
 */
export function logWarn(message: string, data?: any): void {
  logger.warn(message, data);
}

/**
 * Helper function to log debug info
 * Usage: logDebug('Debug message', { data: 'value' });
 */
export function logDebug(message: string, data?: any): void {
  logger.debug(message, data);
}

export default logger;
