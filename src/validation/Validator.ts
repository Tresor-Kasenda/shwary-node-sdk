import type { CountryMetadata } from '../enums/Country';
import { ValidationError } from '../errors/ValidationError';
import type { PaymentRequestData } from '../types/PaymentRequest';

/**
 * Payment request validator
 */
export class Validator {
  /**
   * Validate payment amount for a country
   * @param amount - Amount to validate
   * @param country - Country metadata
   * @throws ValidationError if amount is invalid
   */
  static validateAmount(amount: number, country: CountryMetadata): void {
    if (typeof amount !== 'number' || amount <= 0) {
      throw ValidationError.invalidAmount(amount, country);
    }

    if (amount < country.minimumAmount) {
      throw ValidationError.invalidAmount(amount, country);
    }
  }

  /**
   * Validate phone number for a country
   * @param phone - Phone number to validate
   * @param country - Country metadata
   * @throws ValidationError if phone is invalid
   */
  static validatePhoneNumber(phone: string, country: CountryMetadata): void {
    if (typeof phone !== 'string' || !phone) {
      throw ValidationError.invalidPhoneNumber(phone || '', country);
    }

    // Check E.164 format and dial code
    if (!this.isValidPhoneFormat(phone, country.dialCode)) {
      throw ValidationError.invalidPhoneNumber(phone, country);
    }
  }

  /**
   * Validate callback URL
   * @param url - URL to validate
   * @throws ValidationError if URL is invalid
   */
  static validateCallbackUrl(url?: string): void {
    if (!url) {
      return; // Optional field
    }

    if (typeof url !== 'string') {
      throw ValidationError.invalidCallbackUrl(String(url));
    }

    if (!this.isValidHttpsUrl(url)) {
      throw ValidationError.invalidCallbackUrl(url);
    }
  }

  /**
   * Validate complete payment request
   * @param request - Payment request data
   * @throws ValidationError if request is invalid
   */
  static validatePaymentRequest(request: PaymentRequestData): void {
    // Validate required fields
    if (!request.amount) {
      throw ValidationError.missingRequiredField('amount');
    }

    if (!request.clientPhoneNumber) {
      throw ValidationError.missingRequiredField('clientPhoneNumber');
    }

    if (!request.country) {
      throw ValidationError.missingRequiredField('country');
    }

    // Validate each field
    this.validateAmount(request.amount, request.country);
    this.validatePhoneNumber(request.clientPhoneNumber, request.country);
    this.validateCallbackUrl(request.callbackUrl);
  }

  /**
   * Check if phone number is in valid E.164 format with correct dial code
   */
  private static isValidPhoneFormat(phone: string, dialCode: string): boolean {
    // E.164 format: +country code + number, starting with +
    const e164Regex = /^\+\d{1,15}$/;

    if (!e164Regex.test(phone)) {
      return false;
    }

    // Check if it starts with the correct dial code
    if (!phone.startsWith(dialCode)) {
      return false;
    }

    return true;
  }

  /**
   * Check if URL is a valid HTTPS URL
   */
  private static isValidHttpsUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }
}
