/**
 * @fileoverview JSON Schemas for cart/basket API response validation.
 * Used with AJV to ensure API responses conform to expected structure
 * during network interception tests.
 */

/** Schema for a single cart item in the API response */
export const cartItemSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    productId: { type: 'number' },
    variantId: { type: 'number' },
    name: { type: 'string', minLength: 1 },
    brand: { type: 'string', minLength: 1 },
    size: { type: 'string' },
    color: { type: 'string' },
    quantity: { type: 'number', minimum: 1 },
    price: {
      type: 'object',
      properties: {
        current: { type: 'number', minimum: 0 },
        original: { type: 'number', minimum: 0 },
        currency: { type: 'string', enum: ['EUR', 'CHF', 'GBP'] },
        isOnSale: { type: 'boolean' },
      },
      required: ['current', 'currency'],
    },
    imageUrl: { type: 'string', format: 'uri' },
  },
  required: ['id', 'name', 'quantity', 'price'],
  additionalProperties: true,
} as const;

/** Schema for cart summary/totals */
export const cartSummarySchema = {
  type: 'object',
  properties: {
    itemCount: { type: 'number', minimum: 0 },
    lineItemCount: { type: 'number', minimum: 0 },
    subtotal: { type: 'number', minimum: 0 },
    shippingCost: { type: 'number', minimum: 0 },
    discount: { type: 'number', minimum: 0 },
    total: { type: 'number', minimum: 0 },
    currency: { type: 'string' },
  },
  required: ['subtotal', 'total', 'currency'],
  additionalProperties: true,
} as const;

/** Schema for the full cart API response */
export const cartResponseSchema = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: cartItemSchema,
    },
    summary: cartSummarySchema,
    appliedVouchers: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          code: { type: 'string' },
          discountAmount: { type: 'number' },
          isValid: { type: 'boolean' },
        },
        required: ['code', 'isValid'],
      },
    },
  },
  required: ['items'],
  additionalProperties: true,
} as const;

/** Schema for add-to-cart request payload */
export const addToCartPayloadSchema = {
  type: 'object',
  properties: {
    variantId: { type: 'number' },
    quantity: { type: 'number', minimum: 1 },
  },
  required: ['variantId'],
  additionalProperties: true,
} as const;

/** Schema for voucher/promo code application response */
export const voucherResponseSchema = {
  type: 'object',
  properties: {
    code: { type: 'string' },
    discountAmount: { type: 'number' },
    discountType: { type: 'string', enum: ['percentage', 'fixed'] },
    isValid: { type: 'boolean' },
    errorMessage: { type: 'string' },
  },
  required: ['isValid'],
  additionalProperties: true,
} as const;
