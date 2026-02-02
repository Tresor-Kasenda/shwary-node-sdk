import type { Config } from '../Config';
import { ApiError } from '../errors/ApiError';
import { AuthenticationError } from '../errors/AuthenticationError';
import type { Logger } from '../utils/logger';
import { NullLogger } from '../utils/logger';

/**
 * HTTP client wrapper around native fetch API
 */
export class HttpClient {
  private readonly config: Config;
  private readonly logger: Logger;

  /**
   * Create a new HttpClient
   * @param config - Configuration instance
   * @param logger - Optional logger instance (default: NullLogger)
   */
  constructor(config: Config, logger?: Logger) {
    this.config = config;
    this.logger = logger || new NullLogger();
  }

  /**
   * Make a POST request
   * @param endpoint - API endpoint path
   * @param data - Request data
   * @returns Parsed response data
   * @throws ApiError or AuthenticationError
   */
  async post<T = unknown>(endpoint: string, data: Record<string, unknown>): Promise<T> {
    return this.request<T>('POST', endpoint, {
      body: JSON.stringify(data),
    });
  }

  /**
   * Make a GET request
   * @param endpoint - API endpoint path
   * @param query - Optional query parameters
   * @returns Parsed response data
   * @throws ApiError or AuthenticationError
   */
  async get<T = unknown>(
    endpoint: string,
    query?: Record<string, unknown>,
  ): Promise<T> {
    let url = endpoint;
    if (query) {
      const params = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
      const queryString = params.toString();
      if (queryString) {
        url = `${endpoint}?${queryString}`;
      }
    }

    return this.request<T>('GET', url);
  }

  /**
   * Make an HTTP request
   */
  private async request<T>(
    method: string,
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = this.buildUrl(endpoint);
    const headers = this.getHeaders();

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      this.logger.debug(`${method} ${endpoint}`, {
        headers: this.sanitizeForLog(headers),
      });

      const response = await fetch(url, {
        method,
        headers,
        ...options,
        signal: controller.signal,
      });

      const body = await this.handleResponse<T>(response);
      this.logger.debug(`${method} ${endpoint} - ${response.status}`, {
        status: response.status,
      });

      return body;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof TypeError && error.message.includes('fetch')) {
        // Network error
        this.logger.error(`Network error: ${endpoint}`, { error: error.message });
        throw ApiError.networkError(`Network error: ${error.message}`, error);
      }

      if (error instanceof Error && error.name === 'AbortError') {
        this.logger.error(`Request timeout: ${endpoint}`);
        throw ApiError.networkError(`Request timeout after ${this.config.timeout}ms`);
      }

      // Re-throw ShwaryError or other known errors
      if (error instanceof Error && error.name.includes('Error')) {
        throw error;
      }

      // Unknown error
      this.logger.error(`Unexpected error: ${endpoint}`, { error });
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Get HTTP headers for authentication
   */
  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'x-merchant-id': this.config.merchantId,
      'x-merchant-key': this.config.merchantKey,
    };
  }

  /**
   * Build full URL from endpoint
   */
  private buildUrl(endpoint: string): string {
    const baseUrl = this.config.getApiUrl();

    // If endpoint already includes the base URL, use it as-is
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }

    // Otherwise, prepend the base API URL
    return `${baseUrl}/${endpoint.replace(/^\//, '')}`;
  }

  /**
   * Sanitize data for logging (remove sensitive information)
   */
  private sanitizeForLog(data: unknown): unknown {
    if (!data) return data;

    if (typeof data === 'object' && data !== null) {
      const obj = { ...data } as Record<string, unknown>;

      // Remove or mask sensitive fields
      if ('x-merchant-key' in obj) {
        obj['x-merchant-key'] = '***MASKED***';
      }
      if ('clientPhoneNumber' in obj) {
        const phone = String(obj.clientPhoneNumber);
        obj.clientPhoneNumber = `${phone.slice(0, 5)}${'*'.repeat(phone.length - 7)}${phone.slice(-2)}`;
      }

      return obj;
    }

    return data;
  }

  /**
   * Handle HTTP response
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    let body: unknown;

    // Try to parse JSON response
    try {
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        body = await response.json();
      } else {
        body = await response.text();
      }
    } catch {
      body = null;
    }

    // Handle error responses
    if (!response.ok) {
      if (response.status === 401) {
        throw AuthenticationError.invalidCredentials();
      }

      if (response.status === 404) {
        throw await ApiError.fromResponse(response, body);
      }

      if (response.status === 502) {
        throw ApiError.badGateway();
      }

      throw await ApiError.fromResponse(response, body);
    }

    // Return parsed response
    return body as T;
  }
}
