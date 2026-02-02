import type { CountryMetadata } from '../enums/Country';
import { Validator } from '../validation/Validator';

/**
 * Payment request data
 */
export interface PaymentRequestData {
  /** Payment amount */
  amount: number;
  /** Customer phone number in E.164 format */
  clientPhoneNumber: string;
  /** Country metadata */
  country: CountryMetadata;
  /** Optional webhook callback URL */
  callbackUrl?: string;
}

/**
 * Immutable payment request with validation
 */
export class PaymentRequest {
  /** Payment amount */
  readonly amount: number;

  /** Customer phone number */
  readonly clientPhoneNumber: string;

  /** Country metadata */
  readonly country: CountryMetadata;

  /** Optional callback URL */
  readonly callbackUrl?: string;

  /**
   * Create a new PaymentRequest
   * @param data - Payment request data
   * @throws ValidationError if data is invalid
   */
  constructor(data: PaymentRequestData) {
    // Validate the request
    Validator.validatePaymentRequest(data);

    this.amount = data.amount;
    this.clientPhoneNumber = data.clientPhoneNumber;
    this.country = data.country;
    this.callbackUrl = data.callbackUrl;
  }

  /**
   * Create a payment request with validation
   * @param amount - Payment amount
   * @param phone - Customer phone number in E.164 format
   * @param country - Country metadata
   * @param callbackUrl - Optional webhook URL
   * @returns PaymentRequest instance
   * @throws ValidationError if parameters are invalid
   */
  static create(
    amount: number,
    phone: string,
    country: CountryMetadata,
    callbackUrl?: string,
  ): PaymentRequest {
    return new PaymentRequest({
      amount,
      clientPhoneNumber: phone,
      country,
      callbackUrl,
    });
  }

  /**
   * Convert to API payload format
   */
  toApiPayload(): {
    amount: number;
    clientPhoneNumber: string;
    callbackUrl?: string;
  } {
    return {
      amount: this.amount,
      clientPhoneNumber: this.clientPhoneNumber,
      ...(this.callbackUrl && { callbackUrl: this.callbackUrl }),
    };
  }

  /**
   * Convert to plain object
   */
  toJSON(): PaymentRequestData {
    return {
      amount: this.amount,
      clientPhoneNumber: this.clientPhoneNumber,
      country: this.country,
      callbackUrl: this.callbackUrl,
    };
  }
}
