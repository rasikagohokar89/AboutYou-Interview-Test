/**
 * @fileoverview Type definitions for cart/basket-related entities.
 * Used for validating cart API responses and UI state assertions.
 */

import { ProductPrice } from './product.types';

/** A single item in the shopping cart */
export interface CartItem {
  readonly id: string;
  readonly productId: number;
  readonly variantId: number;
  readonly name: string;
  readonly brand: string;
  readonly size: string;
  readonly color?: string;
  readonly quantity: number;
  readonly price: ProductPrice;
  readonly imageUrl: string;
}

/** Summary of cart totals */
export interface CartSummary {
  /** Total number of items (sum of quantities) */
  readonly itemCount: number;
  /** Number of distinct line items */
  readonly lineItemCount: number;
  /** Subtotal before shipping and discounts (in cents) */
  readonly subtotal: number;
  /** Shipping cost (in cents, 0 if free) */
  readonly shippingCost: number;
  /** Total discount amount (in cents) */
  readonly discount: number;
  /** Final total = subtotal + shipping - discount (in cents) */
  readonly total: number;
  /** Currency code */
  readonly currency: string;
}

/** Applied voucher/promo code */
export interface AppliedVoucher {
  readonly code: string;
  readonly discountAmount: number;
  readonly discountType: 'percentage' | 'fixed';
  readonly isValid: boolean;
  readonly errorMessage?: string;
}

/** Cart data extracted from the UI for assertions */
export interface CartItemUIData {
  readonly name: string;
  readonly brand: string;
  readonly size: string;
  readonly quantity: number;
  readonly price: string;
  readonly imageVisible: boolean;
}

/** Full cart state as represented in the API */
export interface CartState {
  readonly items: CartItem[];
  readonly summary: CartSummary;
  readonly appliedVouchers: AppliedVoucher[];
  readonly isEmpty: boolean;
}

/** Payload for adding an item to the cart */
export interface AddToCartPayload {
  readonly variantId: number;
  readonly quantity: number;
}

/** Payload for updating cart item quantity */
export interface UpdateCartPayload {
  readonly itemId: string;
  readonly quantity: number;
}
