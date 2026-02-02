/**
 * Configuration options for ShwaryClient
 */
export interface ConfigOptions {
  /** Merchant ID (UUID) from Shwary dashboard */
  merchantId: string;
  /** Merchant secret key from Shwary dashboard */
  merchantKey: string;
  /** Base API URL (default: https://api.shwary.com) */
  baseUrl?: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Enable sandbox mode for testing (default: false) */
  sandbox?: boolean;
}

/**
 * Immutable configuration class for Shwary SDK
 */
export class Config {
  /** Default API base URL */
  static readonly DEFAULT_BASE_URL = 'https://api.shwary.com';

  /** Default timeout in milliseconds */
  static readonly DEFAULT_TIMEOUT = 30000;

  /** API version */
  static readonly API_VERSION = 'v1';

  /** Merchant ID */
  readonly merchantId: string;

  /** Merchant secret key */
  readonly merchantKey: string;

  /** Base API URL */
  readonly baseUrl: string;

  /** Request timeout in milliseconds */
  readonly timeout: number;

  /** Sandbox mode flag */
  readonly sandbox: boolean;

  /**
   * Create a new Config instance
   * @param options - Configuration options
   * @throws Error if required fields are missing or invalid
   */
  constructor(options: ConfigOptions) {
    const {
      merchantId,
      merchantKey,
      baseUrl = Config.DEFAULT_BASE_URL,
      timeout = Config.DEFAULT_TIMEOUT,
      sandbox = false,
    } = options;

    this.merchantId = merchantId;
    this.merchantKey = merchantKey;
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.timeout = timeout;
    this.sandbox = sandbox;

    this.validate();
  }

  /**
   * Create config from environment variables
   *
   * Reads from:
   * - SHWARY_MERCHANT_ID (required)
   * - SHWARY_MERCHANT_KEY (required)
   * - SHWARY_BASE_URL (optional)
   * - SHWARY_TIMEOUT (optional)
   * - SHWARY_SANDBOX (optional)
   *
   * @param env - Environment variables object (default: process.env)
   * @returns Config instance
   * @throws Error if required env vars are missing
   */
  static fromEnvironment(env: NodeJS.ProcessEnv = process.env): Config {
    return new Config({
      merchantId: env.SHWARY_MERCHANT_ID || '',
      merchantKey: env.SHWARY_MERCHANT_KEY || '',
      baseUrl: env.SHWARY_BASE_URL || Config.DEFAULT_BASE_URL,
      timeout: env.SHWARY_TIMEOUT
        ? parseInt(env.SHWARY_TIMEOUT, 10)
        : Config.DEFAULT_TIMEOUT,
      sandbox:
        env.SHWARY_SANDBOX === 'true' ||
        env.SHWARY_SANDBOX === '1' ||
        env.SHWARY_SANDBOX === 'yes',
    });
  }

  /**
   * Create config from a plain object
   * @param obj - Configuration object
   * @returns Config instance
   * @throws Error if required fields are missing
   */
  static fromObject(obj: Record<string, unknown>): Config {
    return new Config({
      merchantId: String(obj.merchantId || obj.merchant_id || ''),
      merchantKey: String(obj.merchantKey || obj.merchant_key || ''),
      baseUrl: String(obj.baseUrl || obj.base_url || Config.DEFAULT_BASE_URL),
      timeout: Number(obj.timeout || Config.DEFAULT_TIMEOUT),
      sandbox: Boolean(obj.sandbox || false),
    });
  }

  /**
   * Get the full API URL (base + version)
   */
  getApiUrl(): string {
    return `${this.baseUrl}/api/${Config.API_VERSION}`;
  }

  /**
   * Check if sandbox mode is enabled
   */
  isSandbox(): boolean {
    return this.sandbox;
  }

  /**
   * Validate configuration
   * @throws Error if configuration is invalid
   */
  private validate(): void {
    if (!this.merchantId || typeof this.merchantId !== 'string') {
      throw new Error('Merchant ID is required and must be a string');
    }

    if (!this.merchantKey || typeof this.merchantKey !== 'string') {
      throw new Error('Merchant Key is required and must be a string');
    }

    if (this.timeout < 1000) {
      throw new Error('Timeout must be at least 1000 milliseconds');
    }

    // Validate URL format
    try {
      new URL(this.baseUrl);
    } catch {
      throw new Error(`Invalid base URL: ${this.baseUrl}`);
    }
  }
}
