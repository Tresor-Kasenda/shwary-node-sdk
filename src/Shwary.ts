import { ShwaryClient } from './ShwaryClient';
import { Config } from './Config';
import type { Logger } from './utils/logger';
import { PaymentRequest } from './types/PaymentRequest';
import { Transaction } from './types/Transaction';
import { WebhookHandler } from './webhook/WebhookHandler';
import type { CountryMetadata } from './enums/Country';

/**
 * Facade class for simplified Shwary SDK usage
 *
 * Initialize once with your credentials, then use static methods throughout your application.
 *
 * @example
 * ```typescript
 * // Initialize from environment variables
 * Shwary.initFromEnvironment();
 *
 * // Make payments
 * const transaction = await Shwary.payDRC(5000, '+243812345678');
 * ```
 */
export class Shwary {
  private static instance: ShwaryClient | null = null;

  /**
   * Initialize the SDK with a Config instance
   *
   * @param config - Configuration object
   * @param logger - Optional logger instance
   *
   * @example
   * ```typescript
   * const config = new Config({
   *   merchantId: 'your-id',
   *   merchantKey: 'your-key'
   * });
   * Shwary.init(config);
   * ```
   */
  static init(config: Config, logger?: Logger): void {
    Shwary.instance = new ShwaryClient(config, logger);
  }

  /**
   * Initialize from environment variables
   *
   * Reads from:
   * - SHWARY_MERCHANT_ID
   * - SHWARY_MERCHANT_KEY
   * - SHWARY_SANDBOX (optional)
   * - SHWARY_BASE_URL (optional)
   * - SHWARY_TIMEOUT (optional)
   *
   * @param logger - Optional logger instance
   *
   * @example
   * ```typescript
   * Shwary.initFromEnvironment();
   * ```
   */
  static initFromEnvironment(logger?: Logger): void {
    Shwary.instance = ShwaryClient.fromEnvironment(logger);
  }

  /**
   * Initialize from a configuration object
   *
   * @param config - Configuration object
   * @param logger - Optional logger instance
   *
   * @example
   * ```typescript
   * Shwary.initFromObject({
   *   merchantId: 'your-id',
   *   merchantKey: 'your-key',
   *   sandbox: true
   * });
   * ```
   */
  static initFromObject(
    config: Record<string, unknown>,
    logger?: Logger,
  ): void {
    Shwary.instance = ShwaryClient.fromObject(config, logger);
  }

  /**
   * Get the ShwaryClient instance
   *
   * @returns The client instance
   * @throws Error if SDK has not been initialized
   *
   * @example
   * ```typescript
   * const client = Shwary.client();
   * ```
   */
  static client(): ShwaryClient {
    if (!Shwary.instance) {
      throw new Error(
        'Shwary SDK not initialized. Call Shwary.init(), Shwary.initFromEnvironment(), or Shwary.initFromObject() first.',
      );
    }
    return Shwary.instance;
  }

  /**
   * Reset the instance (useful for testing)
   *
   * @example
   * ```typescript
   * Shwary.reset();
   * ```
   */
  static reset(): void {
    Shwary.instance = null;
  }

  /**
   * Create a payment transaction
   * @see ShwaryClient.createPayment
   */
  static async createPayment(request: PaymentRequest): Promise<Transaction> {
    return Shwary.client().createPayment(request);
  }

  /**
   * Create a payment with explicit parameters
   * @see ShwaryClient.pay
   */
  static async pay(
    amount: number,
    phone: string,
    country: CountryMetadata,
    callbackUrl?: string,
  ): Promise<Transaction> {
    return Shwary.client().pay(amount, phone, country, callbackUrl);
  }

  /**
   * Create a payment for Democratic Republic of Congo
   * @see ShwaryClient.payDRC
   */
  static async payDRC(
    amount: number,
    phone: string,
    callbackUrl?: string,
  ): Promise<Transaction> {
    return Shwary.client().payDRC(amount, phone, callbackUrl);
  }

  /**
   * Create a payment for Kenya
   * @see ShwaryClient.payKenya
   */
  static async payKenya(
    amount: number,
    phone: string,
    callbackUrl?: string,
  ): Promise<Transaction> {
    return Shwary.client().payKenya(amount, phone, callbackUrl);
  }

  /**
   * Create a payment for Uganda
   * @see ShwaryClient.payUganda
   */
  static async payUganda(
    amount: number,
    phone: string,
    callbackUrl?: string,
  ): Promise<Transaction> {
    return Shwary.client().payUganda(amount, phone, callbackUrl);
  }

  /**
   * Create a sandbox (test) payment
   * @see ShwaryClient.createSandboxPayment
   */
  static async createSandboxPayment(request: PaymentRequest): Promise<Transaction> {
    return Shwary.client().createSandboxPayment(request);
  }

  /**
   * Create a sandbox payment with explicit parameters
   * @see ShwaryClient.sandboxPay
   */
  static async sandboxPay(
    amount: number,
    phone: string,
    country: CountryMetadata,
    callbackUrl?: string,
  ): Promise<Transaction> {
    return Shwary.client().sandboxPay(amount, phone, country, callbackUrl);
  }

  /**
   * Retrieve a transaction by ID
   * @see ShwaryClient.getTransaction
   */
  static async getTransaction(id: string): Promise<Transaction> {
    return Shwary.client().getTransaction(id);
  }

  /**
   * Get the webhook handler
   * @see ShwaryClient.webhook
   */
  static webhook(): WebhookHandler {
    return Shwary.client().webhook();
  }

  /**
   * Parse a webhook payload
   * @see ShwaryClient.parseWebhook
   */
  static parseWebhook(payload: string): Transaction {
    return Shwary.client().parseWebhook(payload);
  }

  /**
   * Check if client is in sandbox mode
   * @see ShwaryClient.isSandbox
   */
  static isSandbox(): boolean {
    return Shwary.client().isSandbox();
  }

  /**
   * Get the current configuration
   * @see ShwaryClient.getConfig
   */
  static getConfig(): Config {
    return Shwary.client().getConfig();
  }
}
