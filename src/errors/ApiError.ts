import { ShwaryError } from './ShwaryError';

/**
 * Error thrown when API requests fail
 */
export class ApiError extends ShwaryError {
  /**
   * HTTP response object (if available)
   */
  readonly response?: Response;

  constructor(
    message: string,
    code: number = 0,
    context: Record<string, unknown> = {},
    response?: Response,
  ) {
    super(message, code, context);
    this.response = response;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /**
   * Create API error from HTTP response
   * @param response - The HTTP response
   * @param body - Parsed response body
   */
  static async fromResponse(
    response: Response,
    body: unknown,
  ): Promise<ApiError> {
    const context: Record<string, unknown> = {
      status: response.status,
      statusText: response.statusText,
    };

    if (body && typeof body === 'object') {
      context.body = body;
    }

    const message = this.getMessageForStatus(response.status, body);

    return new ApiError(message, response.status, context, response);
  }

  /**
   * Create network error
   * @param message - Error message
   * @param cause - Original error
   */
  static networkError(message: string, cause?: Error): ApiError {
    const context: Record<string, unknown> = {
      reason: 'network_error',
    };

    if (cause) {
      context.cause = cause.message;
    }

    return new ApiError(message, 0, context);
  }

  /**
   * Create bad gateway error
   * @param message - Optional custom message
   */
  static badGateway(message?: string): ApiError {
    return new ApiError(
      message || 'Bad Gateway: Failed to reach payment provider',
      502,
      {
        reason: 'bad_gateway',
      },
    );
  }

  /**
   * Create client not found error
   * @param phone - The client phone number that was not found
   */
  static clientNotFound(phone: string): ApiError {
    return new ApiError(
      `Client not found: ${phone}`,
      404,
      {
        reason: 'client_not_found',
        phone,
      },
    );
  }

  /**
   * Get error message based on HTTP status code
   */
  private static getMessageForStatus(
    status: number,
    body: unknown,
  ): string {
    if (body && typeof body === 'object' && 'message' in body) {
      return String(body.message);
    }

    switch (status) {
      case 400:
        return 'Bad Request: Invalid payment parameters';
      case 401:
        return 'Unauthorized: Invalid merchant credentials';
      case 404:
        return 'Not Found: Client or merchant not found';
      case 502:
        return 'Bad Gateway: Payment provider unavailable';
      default:
        return `API Error: ${status}`;
    }
  }
}
