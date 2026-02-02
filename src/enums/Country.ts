/**
 * Enum of supported country codes
 */
export enum CountryCode {
  DRC = 'DRC',
  KENYA = 'KE',
  UGANDA = 'UG',
}

/**
 * Metadata for a supported country
 */
export interface CountryMetadata {
  /** Country code (DRC, KE, UG) */
  code: CountryCode;
  /** Full country name */
  name: string;
  /** ISO 4217 currency code */
  currency: string;
  /** International phone dial code */
  dialCode: string;
  /** Minimum payment amount in local currency */
  minimumAmount: number;
}

/**
 * Shwary supported countries with metadata
 */
export class Country {
  /**
   * Democratic Republic of Congo
   */
  static readonly DRC: CountryMetadata = {
    code: CountryCode.DRC,
    name: 'Democratic Republic of Congo',
    currency: 'CDF',
    dialCode: '+243',
    minimumAmount: 2900,
  };

  /**
   * Kenya
   */
  static readonly KENYA: CountryMetadata = {
    code: CountryCode.KENYA,
    name: 'Kenya',
    currency: 'KES',
    dialCode: '+254',
    minimumAmount: 0,
  };

  /**
   * Uganda
   */
  static readonly UGANDA: CountryMetadata = {
    code: CountryCode.UGANDA,
    name: 'Uganda',
    currency: 'UGX',
    dialCode: '+256',
    minimumAmount: 0,
  };

  /**
   * Get country metadata by code
   * @param code - Country code (DRC, KE, UG)
   * @returns Country metadata or undefined if not found
   */
  static fromCode(code: string): CountryMetadata | undefined {
    const country = this.getAll().find((c) => c.code === code);
    return country;
  }

  /**
   * Get all supported countries
   * @returns Array of country metadata
   */
  static getAll(): CountryMetadata[] {
    return [this.DRC, this.KENYA, this.UGANDA];
  }

  /**
   * Check if a country code is valid
   * @param code - Country code to validate
   * @returns true if code is valid
   */
  static isValid(code: string): boolean {
    return this.getAll().some((c) => c.code === code);
  }
}
