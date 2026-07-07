/**
 * @fileoverview Test data generators for checkout test scenarios.
 * Provides valid, invalid, and edge-case data for addresses,
 * payment details, and product queries.
 * 
 * Keeping test data centralized ensures consistency and easy maintenance.
 */

import type { Address, CreditCardDetails, TestAddress } from '../types/checkout.types';

/**
 * Collection of test addresses for various scenarios.
 */
export class TestData {
  // ─── Valid Addresses ─────────────────────────────────────────

  /** Valid German shipping address */
  static readonly VALID_DE_ADDRESS: TestAddress = {
    firstName: 'Max',
    lastName: 'Mustermann',
    street: 'Domstraße',
    houseNumber: '10',
    postalCode: '20095',
    city: 'Hamburg',
    country: 'DE',
    email: 'max.mustermann@test.example.com',
    phone: '+4940123456789',
    isValid: true,
    description: 'Valid German address (Hamburg)',
  };

  /** Valid Austrian shipping address */
  static readonly VALID_AT_ADDRESS: TestAddress = {
    firstName: 'Anna',
    lastName: 'Huber',
    street: 'Mariahilfer Straße',
    houseNumber: '45',
    postalCode: '1060',
    city: 'Wien',
    country: 'AT',
    email: 'anna.huber@test.example.com',
    phone: '+43112345678',
    isValid: true,
    description: 'Valid Austrian address (Vienna)',
  };

  /** Address with special characters (umlauts, accents) */
  static readonly SPECIAL_CHARS_ADDRESS: TestAddress = {
    firstName: 'Ünsal',
    lastName: 'Müller-Löwenstein',
    street: 'Königstraße',
    houseNumber: '7a',
    postalCode: '70173',
    city: 'Stuttgart',
    country: 'DE',
    email: 'uensal@test.example.com',
    phone: '+49711987654',
    isValid: true,
    description: 'Address with German umlauts and special characters',
  };

  // ─── Invalid Addresses ──────────────────────────────────────

  /** Address with empty required fields */
  static readonly EMPTY_ADDRESS: TestAddress = {
    firstName: '',
    lastName: '',
    street: '',
    houseNumber: '',
    postalCode: '',
    city: '',
    country: '',
    isValid: false,
    description: 'All required fields empty',
  };

  /** Address with invalid postal code */
  static readonly INVALID_POSTCODE_ADDRESS: TestAddress = {
    firstName: 'Test',
    lastName: 'User',
    street: 'Teststraße',
    houseNumber: '1',
    postalCode: 'ABCDE', // Invalid — should be numeric for DE
    city: 'Berlin',
    country: 'DE',
    isValid: false,
    description: 'Non-numeric postal code for Germany',
  };

  /** Address with invalid email */
  static readonly INVALID_EMAIL_ADDRESS: TestAddress = {
    firstName: 'Test',
    lastName: 'User',
    street: 'Teststraße',
    houseNumber: '1',
    postalCode: '10115',
    city: 'Berlin',
    country: 'DE',
    email: 'not-an-email',
    isValid: false,
    description: 'Invalid email format',
  };

  // ─── Edge Case Addresses ────────────────────────────────────

  /** Address with extremely long values */
  static readonly LONG_VALUES_ADDRESS: TestAddress = {
    firstName: 'A'.repeat(100),
    lastName: 'B'.repeat(100),
    street: 'Very Long Street Name That Goes On And On And Might Break Layout',
    houseNumber: '12345',
    postalCode: '10115',
    city: 'Berlin',
    country: 'DE',
    isValid: false,
    description: 'Extremely long input values — boundary testing',
  };

  /** Address with only whitespace */
  static readonly WHITESPACE_ADDRESS: TestAddress = {
    firstName: '   ',
    lastName: '   ',
    street: '   ',
    houseNumber: ' ',
    postalCode: '   ',
    city: '   ',
    country: 'DE',
    isValid: false,
    description: 'Whitespace-only inputs — should be treated as empty',
  };

  /** Minimal valid address (only required fields) */
  static readonly MINIMAL_ADDRESS: TestAddress = {
    firstName: 'A',
    lastName: 'B',
    street: 'S',
    houseNumber: '1',
    postalCode: '10115',
    city: 'Berlin',
    country: 'DE',
    isValid: true,
    description: 'Minimal valid input — single characters',
  };

  // ─── Credit Card Test Data ──────────────────────────────────
  // NOTE: These are standard test card numbers, NOT real cards

  /** Valid test credit card */
  static readonly VALID_CARD: CreditCardDetails = {
    cardNumber: '4111111111111111',
    expiryMonth: '12',
    expiryYear: '2028',
    cvv: '123',
    cardholderName: 'Max Mustermann',
  };

  /** Expired test credit card */
  static readonly EXPIRED_CARD: CreditCardDetails = {
    cardNumber: '4111111111111111',
    expiryMonth: '01',
    expiryYear: '2020',
    cvv: '123',
    cardholderName: 'Max Mustermann',
  };

  /** Card that will be declined */
  static readonly DECLINED_CARD: CreditCardDetails = {
    cardNumber: '4000000000000002',
    expiryMonth: '12',
    expiryYear: '2028',
    cvv: '123',
    cardholderName: 'Max Mustermann',
  };

  /** Card with invalid CVV */
  static readonly INVALID_CVV_CARD: CreditCardDetails = {
    cardNumber: '4111111111111111',
    expiryMonth: '12',
    expiryYear: '2028',
    cvv: '99',  // Too short
    cardholderName: 'Max Mustermann',
  };

  // ─── Search Queries ─────────────────────────────────────────

  /** Common product search terms guaranteed to return results */
  static readonly GENERAL_SEARCH_QUERIES = [
    'dress',
    't-shirt',
    'jeans',
    'hoodie',
    'jacket',
    'sneakers',
    'shirt'
  ] as const;

  static readonly SEARCH_QUERIES = {
    general: TestData.GENERAL_SEARCH_QUERIES[Math.floor(Math.random() * TestData.GENERAL_SEARCH_QUERIES.length)],
    brand: 'Nike',
    category: 'shoes',
    specific: 'black jeans',
    noResults: 'xyznonexistentproduct12345',
    specialChars: '<script>alert("xss")</script>',
    sqlInjection: "'; DROP TABLE products; --",
    unicode: '👕 shirt',
  } as const;

  // ─── Voucher Codes ──────────────────────────────────────────

  /** Test voucher codes for promo functionality */
  static readonly VOUCHER_CODES = {
    valid: '98CEB918',
    invalid: 'INVALID',
    expired: 'EXPIRED2023',
    empty: '',
    specialChars: '<>!@#$%',
    longCode: 'A'.repeat(50),
  } as const;

  /** Success message for valid voucher code */
  static readonly VALID_VOUCHER_SUCCESS_MSG = 'Online_Coop DE UniDays BK10 MOV75 1125 was successfully added. The voucher cannot be applied in combination with DEAL discounts, coupons or Coins';

  // ─── Utility Methods ────────────────────────────────────────

  /**
   * Generates a random email address for testing.
   * Uses timestamp to ensure uniqueness.
   */
  static generateRandomEmail(): string {
    const timestamp = Date.now();
    return `test.user.${timestamp}@test.example.com`;
  }

  /**
   * Returns all valid test addresses as an array.
   * Useful for parameterized testing.
   */
  static getValidAddresses(): TestAddress[] {
    return [
      this.VALID_DE_ADDRESS,
      this.VALID_AT_ADDRESS,
      this.SPECIAL_CHARS_ADDRESS,
      this.MINIMAL_ADDRESS,
    ];
  }

  /**
   * Returns all invalid test addresses as an array.
   * Useful for negative test parameterization.
   */
  static getInvalidAddresses(): TestAddress[] {
    return [
      this.EMPTY_ADDRESS,
      this.INVALID_POSTCODE_ADDRESS,
      this.INVALID_EMAIL_ADDRESS,
      this.LONG_VALUES_ADDRESS,
      this.WHITESPACE_ADDRESS,
    ];
  }

  // ─── API and Checkout Constants ─────────────────────────────
  static readonly API_ENDPOINTS = {
    SHIPPING_ADDRESS: '/next/api/co/v3/state/order/addresses/shipping',
    STATE: '/next/api/co/v3/state',
    CONFIRMATION: '/next/api/co/v3/state/order/confirmation/execute',
  } as const;

  static readonly HTTP_METHODS = {
    PUT: 'PUT',
    POST: 'POST',
  } as const;

  static readonly STATUS_CODES = {
    OK: 200,
    CREATED: 201,
    PAYMENT_REQUIRED: 402,
  } as const;

  static readonly ORDER_STATUS = {
    CONFIRMED: 'confirmed',
  } as const;

  static readonly ERROR_CODES = {
    INVALID_PHONE_NUMBER: 'INVALID_PHONE_NUMBER',
  } as const;

  static readonly URL_SUBSTRINGS = {
    CONFIRMATION: 'confirmation',
    THANK_YOU: 'thank-you',
  } as const;

  static readonly TIMEOUTS = {
    ELEMENT_VISIBLE: 5000,
    MOCK_DELAY: 3000,
  } as const;

  static readonly DEFAULT_INDEX = 0;
}
