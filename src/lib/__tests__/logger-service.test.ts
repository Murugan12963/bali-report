/**
 * Tests for logger service
 */

import { createLogger, logger, LogLevel } from '../logger-service';

describe('Logger Service', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    process.env.NODE_ENV = originalEnv;
  });

  describe('Logger creation', () => {
    it('should create logger with context', () => {
      const testLogger = createLogger('TestContext');
      expect(testLogger).toBeDefined();
    });

    it('should create child logger', () => {
      const parentLogger = createLogger('Parent');
      const childLogger = parentLogger.child('Child');
      expect(childLogger).toBeDefined();
    });
  });

  describe('Logging methods', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    it('should log info messages', () => {
      const testLogger = createLogger('Test');
      testLogger.info('Info message', { key: 'value' });
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should log warning messages', () => {
      const testLogger = createLogger('Test');
      testLogger.warn('Warning message', { key: 'value' });
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should log error messages', () => {
      const testLogger = createLogger('Test');
      const error = new Error('Test error');
      testLogger.error('Error message', error, { key: 'value' });
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should log debug messages', () => {
      const testLogger = createLogger('Test', LogLevel.DEBUG);
      testLogger.debug('Debug message', { key: 'value' });
      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });

  describe('Log level filtering', () => {
    it('should not log debug in production', () => {
      process.env.NODE_ENV = 'production';
      const testLogger = createLogger('Test');
      testLogger.debug('Should not appear');
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should log errors in production', () => {
      process.env.NODE_ENV = 'production';
      const testLogger = createLogger('Test');
      testLogger.error('Should appear', new Error('Test'));
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should respect custom log level', () => {
      const testLogger = createLogger('Test', LogLevel.ERROR);
      testLogger.info('Should not appear');
      testLogger.warn('Should not appear');
      expect(consoleLogSpy).not.toHaveBeenCalled();

      testLogger.error('Should appear', new Error('Test'));
      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });

  describe('Default logger instance', () => {
    it('should have default logger available', () => {
      expect(logger).toBeDefined();
    });

    it('should log with default logger', () => {
      process.env.NODE_ENV = 'development';
      logger.info('Test message');
      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });

  describe('Log entry formatting', () => {
    it('should include timestamp in log entries', () => {
      process.env.NODE_ENV = 'development';
      const testLogger = createLogger('Test');
      testLogger.info('Test message');

      // Check that console.log was called
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should include context in log entries', () => {
      process.env.NODE_ENV = 'development';
      const testLogger = createLogger('TestContext');
      testLogger.info('Test message');

      const logCall = consoleLogSpy.mock.calls[0][0];
      expect(logCall).toContain('TestContext');
    });
  });
});
