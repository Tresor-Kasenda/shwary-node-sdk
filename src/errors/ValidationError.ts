import { ShwaryError } from './ShwaryError';
import type { CountryMetadata } from '../enums/Country';

/**
 * Error thrown when input validation fails
 */
export class ValidationError extends ShwaryError {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super(message, 400, context);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  /**
   * Create validation error for invalid amount
   * @param amount - The invalid amount
   * @param country - The country metadata
   */
  static invalidAmount(amount: number, country: CountryMetadata): ValidationError {
    return new ValidationError(
      `Amount must be greater than ${country.minimumAmount} ${country.currency}`,
      {
        field: 'amount',
        value: amount,
        minimum: country.minimumAmount,
        currency: country.currency,
      },
    );
  }

  /**
   * Create validation error for invalid phone number
   * @param phone - The invalid phone number
   * @param country - The country metadata
   */
  static invalidPhoneNumber(
    phone: string,
    country: CountryMetadata,
  ): ValidationError {
    return new ValidationError(
      `Phone number must start with ${country.dialCode} in E.164 format`,
      {
        field: 'clientPhoneNumber',
        value: phone,
        expected: `${country.dialCode}XXXXXXXXX`,
        dialCode: country.dialCode,
      },
    );
  }

  /**
   * Create validation error for invalid callback URL
   * @param url - The invalid callback URL
   */
  static invalidCallbackUrl(url: string): ValidationError {
    return new ValidationError(
      'Callback URL must be a valid HTTPS URL',
      {
        field: 'callbackUrl',
        value: url,
        expected: 'https://...',
      },
    );
  }

  /**
   * Create validation error for missing required field
   * @param field - The missing field name
   */
  static missingRequiredField(field: string): ValidationError {
    return new ValidationError(
      `Required field missing: ${field}`,
      {
        field,
      },
    );
  }
}
