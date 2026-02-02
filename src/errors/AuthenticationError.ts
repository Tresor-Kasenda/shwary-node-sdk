import { ShwaryError } from './ShwaryError';

/**
 * Error thrown when authentication fails
 */
export class AuthenticationError extends ShwaryError {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super(message, 401, context);
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }

  /**
   * Create authentication error for invalid credentials
   */
  static invalidCredentials(): AuthenticationError {
    return new AuthenticationError(
      'Invalid merchant credentials. Please check your merchant ID and key.',
      {
        reason: 'invalid_credentials',
      },
    );
  }
}
