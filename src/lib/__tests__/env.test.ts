/**
 * Tests for environment variable helper
 */

import {
  getEnv,
  getRequiredEnv,
  getBooleanEnv,
  getNumberEnv,
  getBaseUrl,
  isProduction,
  isDevelopment,
  validateEnv
} from '../env';

describe('Environment Helper', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('getEnv', () => {
    it('should return environment variable value', () => {
      process.env.TEST_VAR = 'test-value';
      expect(getEnv('TEST_VAR')).toBe('test-value');
    });

    it('should return fallback when variable not set', () => {
      delete process.env.TEST_VAR;
      expect(getEnv('TEST_VAR', 'fallback')).toBe('fallback');
    });

    it('should return empty string when no fallback provided', () => {
      delete process.env.TEST_VAR;
      expect(getEnv('TEST_VAR')).toBe('');
    });
  });

  describe('getRequiredEnv', () => {
    it('should return value when variable is set', () => {
      process.env.REQUIRED_VAR = 'required-value';
      expect(getRequiredEnv('REQUIRED_VAR')).toBe('required-value');
    });

    it('should throw error when variable not set', () => {
      delete process.env.REQUIRED_VAR;
      expect(() => getRequiredEnv('REQUIRED_VAR')).toThrow(
        'Missing required environment variable: REQUIRED_VAR'
      );
    });
  });

  describe('getBooleanEnv', () => {
    it('should return true for "true"', () => {
      process.env.BOOL_VAR = 'true';
      expect(getBooleanEnv('BOOL_VAR')).toBe(true);
    });

    it('should return true for "1"', () => {
      process.env.BOOL_VAR = '1';
      expect(getBooleanEnv('BOOL_VAR')).toBe(true);
    });

    it('should return false for "false"', () => {
      process.env.BOOL_VAR = 'false';
      expect(getBooleanEnv('BOOL_VAR')).toBe(false);
    });

    it('should return fallback when variable not set', () => {
      delete process.env.BOOL_VAR;
      expect(getBooleanEnv('BOOL_VAR', true)).toBe(true);
      expect(getBooleanEnv('BOOL_VAR', false)).toBe(false);
    });
  });

  describe('getNumberEnv', () => {
    it('should return parsed number', () => {
      process.env.NUMBER_VAR = '42';
      expect(getNumberEnv('NUMBER_VAR')).toBe(42);
    });

    it('should return fallback for invalid number', () => {
      process.env.NUMBER_VAR = 'not-a-number';
      expect(getNumberEnv('NUMBER_VAR', 10)).toBe(10);
    });

    it('should return fallback when variable not set', () => {
      delete process.env.NUMBER_VAR;
      expect(getNumberEnv('NUMBER_VAR', 99)).toBe(99);
    });
  });

  describe('getBaseUrl', () => {
    it('should return NEXT_PUBLIC_SITE_URL when set', () => {
      process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com';
      expect(getBaseUrl()).toBe('https://example.com');
    });

    it('should return localhost in development', () => {
      delete process.env.NEXT_PUBLIC_SITE_URL;
      delete process.env.VERCEL_URL;
      expect(getBaseUrl()).toBe('http://localhost:3000');
    });
  });

  describe('environment checks', () => {
    it('should detect production environment', () => {
      process.env.NODE_ENV = 'production';
      expect(isProduction()).toBe(true);
      expect(isDevelopment()).toBe(false);
    });

    it('should detect development environment', () => {
      process.env.NODE_ENV = 'development';
      expect(isProduction()).toBe(false);
      expect(isDevelopment()).toBe(true);
    });
  });

  describe('validateEnv', () => {
    it('should pass validation when all required vars present', () => {
      process.env.DATABASE_URL = 'postgresql://test';
      process.env.NEXTAUTH_SECRET = 'secret';
      process.env.NEXTAUTH_URL = 'http://localhost:3000';

      const result = validateEnv();
      expect(result.isValid).toBe(true);
      expect(result.missing).toEqual([]);
    });

    it('should fail validation when vars missing', () => {
      delete process.env.DATABASE_URL;
      delete process.env.NEXTAUTH_SECRET;
      delete process.env.NEXTAUTH_URL;

      const result = validateEnv();
      expect(result.isValid).toBe(false);
      expect(result.missing.length).toBeGreaterThan(0);
    });
  });
});
