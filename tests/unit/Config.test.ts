import { describe, it, expect, beforeEach } from 'vitest';
import { Config } from '../../src/Config';

describe('Config', () => {
  describe('constructor', () => {
    it('should create config with required fields', () => {
      const config = new Config({
        merchantId: 'test-id',
        merchantKey: 'test-key',
      });

      expect(config.merchantId).toBe('test-id');
      expect(config.merchantKey).toBe('test-key');
      expect(config.sandbox).toBe(false);
      expect(config.baseUrl).toBe(Config.DEFAULT_BASE_URL);
      expect(config.timeout).toBe(Config.DEFAULT_TIMEOUT);
    });

    it('should accept optional fields', () => {
      const config = new Config({
        merchantId: 'test-id',
        merchantKey: 'test-key',
        sandbox: true,
        timeout: 60000,
        baseUrl: 'https://custom.api.com',
      });

      expect(config.sandbox).toBe(true);
      expect(config.timeout).toBe(60000);
      expect(config.baseUrl).toBe('https://custom.api.com');
    });

    it('should throw error if merchantId is missing', () => {
      expect(() => {
        new Config({
          merchantId: '',
          merchantKey: 'test-key',
        });
      }).toThrow();
    });

    it('should throw error if merchantKey is missing', () => {
      expect(() => {
        new Config({
          merchantId: 'test-id',
          merchantKey: '',
        });
      }).toThrow();
    });

    it('should throw error if timeout is less than 1000ms', () => {
      expect(() => {
        new Config({
          merchantId: 'test-id',
          merchantKey: 'test-key',
          timeout: 500,
        });
      }).toThrow();
    });

    it('should strip trailing slash from baseUrl', () => {
      const config = new Config({
        merchantId: 'test-id',
        merchantKey: 'test-key',
        baseUrl: 'https://api.example.com/',
      });

      expect(config.baseUrl).toBe('https://api.example.com');
    });
  });

  describe('getApiUrl', () => {
    it('should return correct API URL', () => {
      const config = new Config({
        merchantId: 'test-id',
        merchantKey: 'test-key',
      });

      expect(config.getApiUrl()).toBe('https://api.shwary.com/api/v1');
    });

    it('should use custom baseUrl', () => {
      const config = new Config({
        merchantId: 'test-id',
        merchantKey: 'test-key',
        baseUrl: 'https://custom.api.com',
      });

      expect(config.getApiUrl()).toBe('https://custom.api.com/api/v1');
    });
  });

  describe('isSandbox', () => {
    it('should return sandbox flag', () => {
      const liveConfig = new Config({
        merchantId: 'test-id',
        merchantKey: 'test-key',
        sandbox: false,
      });

      const sandboxConfig = new Config({
        merchantId: 'test-id',
        merchantKey: 'test-key',
        sandbox: true,
      });

      expect(liveConfig.isSandbox()).toBe(false);
      expect(sandboxConfig.isSandbox()).toBe(true);
    });
  });

  describe('fromEnvironment', () => {
    it('should create config from environment variables', () => {
      const config = Config.fromEnvironment({
        SHWARY_MERCHANT_ID: 'env-id',
        SHWARY_MERCHANT_KEY: 'env-key',
        SHWARY_SANDBOX: 'true',
      });

      expect(config.merchantId).toBe('env-id');
      expect(config.merchantKey).toBe('env-key');
      expect(config.sandbox).toBe(true);
    });

    it('should use defaults for missing optional env vars', () => {
      const config = Config.fromEnvironment({
        SHWARY_MERCHANT_ID: 'env-id',
        SHWARY_MERCHANT_KEY: 'env-key',
      });

      expect(config.baseUrl).toBe(Config.DEFAULT_BASE_URL);
      expect(config.timeout).toBe(Config.DEFAULT_TIMEOUT);
      expect(config.sandbox).toBe(false);
    });

    it('should parse SHWARY_TIMEOUT as integer', () => {
      const config = Config.fromEnvironment({
        SHWARY_MERCHANT_ID: 'env-id',
        SHWARY_MERCHANT_KEY: 'env-key',
        SHWARY_TIMEOUT: '60000',
      });

      expect(config.timeout).toBe(60000);
    });

    it('should parse SHWARY_SANDBOX correctly', () => {
      const trueVariants = ['true', '1', 'yes'];

      trueVariants.forEach((variant) => {
        const config = Config.fromEnvironment({
          SHWARY_MERCHANT_ID: 'env-id',
          SHWARY_MERCHANT_KEY: 'env-key',
          SHWARY_SANDBOX: variant,
        });
        expect(config.sandbox).toBe(true);
      });

      const config = Config.fromEnvironment({
        SHWARY_MERCHANT_ID: 'env-id',
        SHWARY_MERCHANT_KEY: 'env-key',
        SHWARY_SANDBOX: 'false',
      });
      expect(config.sandbox).toBe(false);
    });
  });

  describe('fromObject', () => {
    it('should create config from plain object', () => {
      const config = Config.fromObject({
        merchantId: 'obj-id',
        merchantKey: 'obj-key',
      });

      expect(config.merchantId).toBe('obj-id');
      expect(config.merchantKey).toBe('obj-key');
    });

    it('should accept snake_case keys', () => {
      const config = Config.fromObject({
        merchant_id: 'obj-id',
        merchant_key: 'obj-key',
      });

      expect(config.merchantId).toBe('obj-id');
      expect(config.merchantKey).toBe('obj-key');
    });
  });
});
