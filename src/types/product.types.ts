/**
 * @fileoverview Type definitions for product-related entities.
 * Used for validating API responses and ensuring type safety
 * when working with product data throughout the test suite.
 */

/** Represents a product variant (specific size/color combination) */
export interface ProductVariant {
  readonly id: number;
  readonly size: string;
  readonly stock: StockStatus;
  readonly sku?: string;
}

/** Stock availability status for a product variant */
export enum StockStatus {
  IN_STOCK = 'in_stock',
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
}

/** Represents a product color option */
export interface ProductColor {
  readonly id: number;
  readonly name: string;
  readonly hex?: string;
  readonly imageUrl?: string;
}

/** Price information for a product */
export interface ProductPrice {
  /** Current selling price in cents */
  readonly current: number;
  /** Original price in cents (before discount, if applicable) */
  readonly original?: number;
  /** Currency code (e.g., 'EUR') */
  readonly currency: string;
  /** Whether this item is currently on sale */
  readonly isOnSale: boolean;
  /** Discount percentage (0-100) */
  readonly discountPercentage?: number;
}

/** Represents a product as displayed on a product listing page */
export interface ProductListingItem {
  readonly id: number;
  readonly name: string;
  readonly brand: string;
  readonly price: ProductPrice;
  readonly imageUrl: string;
  readonly url: string;
  readonly badges?: string[];
}

/** Full product detail (PDP) */
export interface ProductDetail extends ProductListingItem {
  readonly description?: string;
  readonly colors: ProductColor[];
  readonly variants: ProductVariant[];
  readonly category?: string;
}

/** Product data as extracted from the UI (for assertion matching) */
export interface ProductCardData {
  readonly name: string;
  readonly brand: string;
  readonly currentPrice: string;
  readonly originalPrice?: string;
  readonly hasWishlistButton: boolean;
  readonly imageVisible: boolean;
}
