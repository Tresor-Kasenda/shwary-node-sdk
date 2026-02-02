import { Config } from './Config';
import type { Logger } from './utils/logger';
import { HttpClient } from './http/HttpClient';
import { WebhookHandler } from './webhook/WebhookHandler';
import { PaymentRequest } from './types/PaymentRequest';
import { Transaction } from './types/Transaction';
import type { CountryMetadata } from './enums/Country';

/**
 * Main Shwary SDK client for interacting with the payment API
 *
 * @example
 * ```typescript
 * import { ShwaryClient, Config } from '@shwary/node-sdk';
 *
 * const config = Config.fromEnvironment();
 * const client = new ShwaryClient(config);
 *
 * const transaction = await client.payDRC(5000, '+243812345678');
 * console.log(transaction.status);
 * ```
 */
export class ShwaryClient {
  private readonly config: Config;
  private readonly http: HttpClient;
  private readonly webhookHandler: WebhookHandler;

  /**
   * Create a new ShwaryClient
   * @param config - Configuration instance
   * @param logger - Optional logger instance
   */
  constructor(config: Config, logger?: Logger) {
    this.config = config;
    this.http = new HttpClient(config, logger);
    this.webhookHandler = new WebhookHandler();
  }

  /**
   * Create a client from environment variables
   *
   * Reads from:
   * - SHWARY_MERCHANT_ID
   * - SHWARY_MERCHANT_KEY
   * - SHWARY_SANDBOX
   * - SHWARY_BASE_URL
   * - SHWARY_TIMEOUT
   *
   * @param logger - Optional logger instance
   * @returns ShwaryClient instance
   */
  static fromEnvironment(logger?: Logger): ShwaryClient {
    return new ShwaryClient(Config.fromEnvironment(), logger);
  }

  /**
   * Create a client from a configuration object
   * @param config - Configuration object
   * @param logger - Optional logger instance
   * @returns ShwaryClient instance
   */
  static fromObject(
    config: Record<string, unknown>,
    logger?: Logger,
  ): ShwaryClient {
    return new ShwaryClient(Config.fromObject(config), logger);
  }

  /**
   * Create a payment transaction
   *
   * @param request - PaymentRequest object
   * @returns Transaction result
   *
   * @example
   * ```typescript
   * const request = PaymentRequest.create(
   *   5000,
   *   '+243812345678',
   *   Country.DRC,
   *   'https://myapp.com/webhook'
   * );
   * const transaction = await client.createPayment(request);
   * ```
   */
  async createPayment(request: PaymentRequest): Promise<Transaction> {
    const endpoint = this.getPaymentEndpoint(request.country);
    const response = await this.http.post<Record<string, unknown>>(
      endpoint,
      request.toApiPayload(),
    );
    return Transaction.fromApiResponse(response);
  }

  /**
   * Create a payment with explicit parameters
   *
   * @param amount - Payment amount in local currency
   * @param phone - Customer phone number in E.164 format
   * @param country - Country metadata
   * @param callbackUrl - Optional webhook URL for status updates
   * @returns Transaction result
   *
   * @example
   * ```typescript
   * const transaction = await client.pay(
   *   5000,
   *   '+243812345678',
   *   Country.DRC,
   *   'https://myapp.com/webhook'
   * );
   * ```
   */
  async pay(
    amount: number,
    phone: string,
    country: CountryMetadata,
    callbackUrl?: string,
  ): Promise<Transaction> {
    const request = PaymentRequest.create(amount, phone, country, callbackUrl);
    return this.createPayment(request);
  }

  /**
   * Create a payment for Democratic Republic of Congo (DRC)
   *
   * Convenience method that automatically uses DRC country configuration.
   *
   * @param amount - Payment amount in CDF (must be > 2900)
   * @param phone - Customer phone number (must start with +243)
   * @param callbackUrl - Optional webhook URL
   * @returns Transaction result
   *
   * @throws ValidationError if amount < 2900 or phone format is invalid
   * @throws AuthenticationError if credentials are invalid
   * @throws ApiError for other API errors
   *
   * @example
   * ```typescript
   * const transaction = await client.payDRC(5000, '+243812345678');
   * ```
   */
  async payDRC(
    amount: number,
    phone: string,
    callbackUrl?: string,
  ): Promise<Transaction> {
    const { Country } = await import('./enums/Country');
    return this.pay(amount, phone, Country.DRC, callbackUrl);
  }

  /**
   * Create a payment for Kenya
   *
   * @param amount - Payment amount in KES
   * @param phone - Customer phone number (must start with +254)
   * @param callbackUrl - Optional webhook URL
   * @returns Transaction result
   */
  async payKenya(
    amount: number,
    phone: string,
    callbackUrl?: string,
  ): Promise<Transaction> {
    const { Country } = await import('./enums/Country');
    return this.pay(amount, phone, Country.KENYA, callbackUrl);
  }

  /**
   * Create a payment for Uganda
   *
   * @param amount - Payment amount in UGX
   * @param phone - Customer phone number (must start with +256)
   * @param callbackUrl - Optional webhook URL
   * @returns Transaction result
   */
  async payUganda(
    amount: number,
    phone: string,
    callbackUrl?: string,
  ): Promise<Transaction> {
    const { Country } = await import('./enums/Country');
    return this.pay(amount, phone, Country.UGANDA, callbackUrl);
  }

  /**
   * Create a sandbox (test) payment transaction
   *
   * Sandbox payments complete immediately without calling mobile money providers.
   * Useful for testing your integration before going live.
   *
   * @param request - PaymentRequest object
   * @returns Transaction result (always in completed state)
   *
   * @example
   * ```typescript
   * const request = PaymentRequest.create(5000, '+243812345678', Country.DRC);
   * const transaction = await client.createSandboxPayment(request);
   * console.log(transaction.status); // 'completed'
   * ```
   */
  async createSandboxPayment(request: PaymentRequest): Promise<Transaction> {
    const endpoint = this.getSandboxPaymentEndpoint(request.country);
    const response = await this.http.post<Record<string, unknown>>(
      endpoint,
      request.toApiPayload(),
    );
    return Transaction.fromApiResponse(response);
  }

  /**
   * Create a sandbox payment with explicit parameters
   *
   * @param amount - Payment amount
   * @param phone - Customer phone number in E.164 format
   * @param country - Country metadata
   * @param callbackUrl - Optional webhook URL
   * @returns Transaction result (always in completed state)
   *
   * @example
   * ```typescript
   * const transaction = await client.sandboxPay(
   *   5000,
   *   '+243812345678',
   *   Country.DRC
   * );
   * ```
   */
  async sandboxPay(
    amount: number,
    phone: string,
    country: CountryMetadata,
    callbackUrl?: string,
  ): Promise<Transaction> {
    const request = PaymentRequest.create(amount, phone, country, callbackUrl);
    return this.createSandboxPayment(request);
  }

  /**
   * Retrieve a transaction by ID
   *
   * @param id - Transaction ID (UUID)
   * @returns Transaction details
   *
   * @example
   * ```typescript
   * const transaction = await client.getTransaction('c0fdfe50-24be-4de1-9f66-84608fd45a5f');
   * console.log(transaction.status);
   * ```
   */
  async getTransaction(id: string): Promise<Transaction> {
    const endpoint = `merchants/transactions/${id}`;
    const response = await this.http.get<Record<string, unknown>>(endpoint);
    return Transaction.fromApiResponse(response);
  }

  /**
   * Get the webhook handler
   */
  webhook(): WebhookHandler {
    return this.webhookHandler;
  }

  /**
   * Parse a webhook payload
   *
   * @param payload - JSON string from webhook
   * @returns Parsed transaction
   *
   * @example
   * ```typescript
   * app.post('/webhooks/shwary', (req, res) => {
   *   const transaction = client.parseWebhook(JSON.stringify(req.body));
   *   // Handle transaction update
   * });
   * ```
   */
  parseWebhook(payload: string): Transaction {
    return this.webhookHandler.parsePayload(payload);
  }

  /**
   * Check if client is in sandbox mode
   */
  isSandbox(): boolean {
    return this.config.isSandbox();
  }

  /**
   * Get the current configuration
   */
  getConfig(): Config {
    return this.config;
  }

  /**
   * Get payment endpoint for a country
   */
  private getPaymentEndpoint(country: CountryMetadata): string {
    if (this.config.isSandbox()) {
      return this.getSandboxPaymentEndpoint(country);
    }

    return `merchants/payment/${country.code}`;
  }

  /**
   * Get sandbox payment endpoint for a country
   */
  private getSandboxPaymentEndpoint(country: CountryMetadata): string {
    return `merchants/payment/sandbox/${country.code}`;
  }
}
