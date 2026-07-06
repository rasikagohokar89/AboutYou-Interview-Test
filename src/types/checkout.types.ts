/**
 * @fileoverview Type definitions for checkout-related entities.
 * Covers shipping addresses, payment methods, order payloads,
 * and checkout step state management.
 */

/** Shipping/billing address */
export interface Address {
  readonly firstName: string;
  readonly lastName: string;
  readonly street: string;
  readonly houseNumber: string;
  readonly additionalInfo?: string;
  readonly postalCode: string;
  readonly city: string;
  readonly country: string;
  readonly email?: string;
  readonly phone?: string;
}

/** Available shipping method */
export interface ShippingMethod {
  readonly id: string;
  readonly name: string;
  readonly price: number;
  readonly estimatedDelivery: string;
  readonly currency: string;
}

/** Supported payment method types */
export enum PaymentMethodType {
  CREDIT_CARD = 'credit_card',
  PAYPAL = 'paypal',
  KLARNA = 'klarna',
  SOFORT = 'sofort',
  INVOICE = 'invoice',
  PREPAYMENT = 'prepayment',
  GOOGLE_PAY = 'google_pay',
  APPLE_PAY = 'apple_pay',
}

/** Payment method details */
export interface PaymentMethod {
  readonly id: string;
  readonly type: PaymentMethodType;
  readonly name: string;
  readonly isAvailable: boolean;
}

/** Credit card payment details */
export interface CreditCardDetails {
  readonly cardNumber: string;
  readonly expiryMonth: string;
  readonly expiryYear: string;
  readonly cvv: string;
  readonly cardholderName: string;
}

/** Checkout step identifiers */
export enum CheckoutStep {
  LOGIN = 'login',
  ADDRESS = 'address',
  SHIPPING = 'shipping',
  PAYMENT = 'payment',
  REVIEW = 'review',
  CONFIRMATION = 'confirmation',
}

/** Order placement payload (sent to checkout API) */
export interface OrderPayload {
  readonly shippingAddress: Address;
  readonly billingAddress?: Address;
  readonly shippingMethodId: string;
  readonly paymentMethodId: string;
  readonly paymentDetails?: CreditCardDetails;
  readonly voucherCodes?: string[];
  readonly cartId?: string;
}

/** Order confirmation response */
export interface OrderConfirmation {
  readonly orderId: string;
  readonly status: OrderStatus;
  readonly total: number;
  readonly currency: string;
  readonly estimatedDelivery?: string;
}

/** Possible order statuses */
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
}

/** Payment processing result */
export interface PaymentResult {
  readonly success: boolean;
  readonly transactionId?: string;
  readonly error?: PaymentError;
  readonly requiresAction?: boolean;
  readonly actionUrl?: string;
}

/** Payment error details */
export interface PaymentError {
  readonly code: string;
  readonly message: string;
  readonly type: PaymentErrorType;
}

/** Payment error type classification */
export enum PaymentErrorType {
  DECLINED = 'declined',
  INSUFFICIENT_FUNDS = 'insufficient_funds',
  EXPIRED_CARD = 'expired_card',
  INVALID_CARD = 'invalid_card',
  GATEWAY_TIMEOUT = 'gateway_timeout',
  NETWORK_ERROR = 'network_error',
  FRAUD_DETECTED = 'fraud_detected',
  THREE_DS_REQUIRED = '3ds_required',
}

/** Test data interface for address generation */
export interface TestAddress extends Address {
  readonly isValid: boolean;
  readonly description: string;
}
