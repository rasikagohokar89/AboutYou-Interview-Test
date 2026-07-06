/**
 * @fileoverview JSON Schemas for checkout API response validation.
 * Validates address payloads, order submissions, payment responses,
 * and shipping method structures.
 */

/** Schema for a shipping/billing address */
export const addressSchema = {
  type: 'object',
  properties: {
    firstName: { type: 'string', minLength: 1, maxLength: 100 },
    lastName: { type: 'string', minLength: 1, maxLength: 100 },
    street: { type: 'string', minLength: 1 },
    houseNumber: { type: 'string' },
    additionalInfo: { type: 'string' },
    postalCode: { type: 'string', pattern: '^[0-9]{4,10}$' },
    city: { type: 'string', minLength: 1 },
    country: { type: 'string', minLength: 2, maxLength: 3 },
    email: { type: 'string', format: 'email' },
    phone: { type: 'string' },
  },
  required: ['firstName', 'lastName', 'street', 'postalCode', 'city', 'country'],
  additionalProperties: true,
} as const;

/** Schema for a shipping method option */
export const shippingMethodSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string', minLength: 1 },
    price: { type: 'number', minimum: 0 },
    estimatedDelivery: { type: 'string' },
    currency: { type: 'string' },
  },
  required: ['id', 'name', 'price'],
  additionalProperties: true,
} as const;

/** Schema for available payment methods response */
export const paymentMethodSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    type: {
      type: 'string',
      enum: [
        'credit_card', 'paypal', 'klarna', 'sofort',
        'invoice', 'prepayment', 'google_pay', 'apple_pay',
      ],
    },
    name: { type: 'string', minLength: 1 },
    isAvailable: { type: 'boolean' },
  },
  required: ['id', 'name'],
  additionalProperties: true,
} as const;

/** Schema for order placement request payload */
export const orderPayloadSchema = {
  type: 'object',
  properties: {
    shippingAddress: addressSchema,
    billingAddress: addressSchema,
    shippingMethodId: { type: 'string' },
    paymentMethodId: { type: 'string' },
    voucherCodes: {
      type: 'array',
      items: { type: 'string' },
    },
  },
  required: ['shippingAddress', 'shippingMethodId', 'paymentMethodId'],
  additionalProperties: true,
} as const;

/** Schema for order confirmation response */
export const orderConfirmationSchema = {
  type: 'object',
  properties: {
    orderId: { type: 'string', minLength: 1 },
    status: {
      type: 'string',
      enum: ['pending', 'confirmed', 'processing', 'failed'],
    },
    total: { type: 'number', minimum: 0 },
    currency: { type: 'string' },
    estimatedDelivery: { type: 'string' },
  },
  required: ['orderId', 'status'],
  additionalProperties: true,
} as const;

/** Schema for payment processing result */
export const paymentResultSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    transactionId: { type: 'string' },
    error: {
      type: 'object',
      properties: {
        code: { type: 'string' },
        message: { type: 'string' },
        type: {
          type: 'string',
          enum: [
            'declined', 'insufficient_funds', 'expired_card',
            'invalid_card', 'gateway_timeout', 'network_error',
            'fraud_detected', '3ds_required',
          ],
        },
      },
      required: ['code', 'message'],
    },
    requiresAction: { type: 'boolean' },
    actionUrl: { type: 'string', format: 'uri' },
  },
  required: ['success'],
  additionalProperties: true,
} as const;
