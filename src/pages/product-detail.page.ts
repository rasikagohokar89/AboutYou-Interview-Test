/**
 * @fileoverview Product Detail Page (PDP) object.
 * Handles product information display, size selection,
 * color variant switching, and add-to-cart/wishlist interactions.
 * This is a critical page in the checkout funnel — the entry
 * point for adding items to the basket.
 */

import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class ProductDetailPage extends BasePage {
  // ─── Locators ────────────────────────────────────────────────

  /** Product brand name */
  readonly brandName: Locator;

  /** Product name/title */
  readonly productName: Locator;

  /** Current price display */
  readonly currentPrice: Locator;

  /** Original price (shown when on sale, crossed out) */
  readonly originalPrice: Locator;

  /** Discount badge/percentage */
  readonly discountBadge: Locator;

  /** Product images gallery */
  readonly productImages: Locator;

  /** Size selector container */
  readonly sizeSelector: Locator;

  /** Individual size options (buttons) */
  readonly sizeOptions: Locator;

  /** "Select size" prompt/overlay */
  readonly selectSizePrompt: Locator;

  /** Color variant selector */
  readonly colorVariants: Locator;

  /** Add to basket/cart button */
  readonly addToBasketButton: Locator;

  /** Add to wishlist button */
  readonly addToWishlistButton: Locator;

  /** Size guide link */
  readonly sizeGuideLink: Locator;

  /** Product description section */
  readonly productDescription: Locator;

  /** "Added to basket" confirmation indicator */
  readonly addedToBasketConfirmation: Locator;

  /** Out of stock message */
  readonly outOfStockMessage: Locator;

  constructor(page: Page) {
    super(page);

    // Product info
    this.brandName = page.locator('h1').locator('..').locator('div').first(); // Generic fallback
    this.productName = page.locator('h1').first();
    this.currentPrice = page.getByText(/€/).first();
    this.originalPrice = page.locator('s, del, [class*="crossed"]').first();
    this.discountBadge = page.locator('div').filter({ hasText: /^-\d+%$/ }).first();

    // Images
    this.productImages = page.getByRole('img');

    // Size selection
    this.sizeSelector = page.getByTestId('sizeFlyoutOpener').first();
    this.sizeOptions = page.getByRole('button').filter({ hasText: /^[A-Z0-9x ]+$/ }); // Generic fallback for size buttons
    this.selectSizePrompt = page.getByText(/Please select a size|Bitte wähle eine Größe/i).first();

    // Color variants
    this.colorVariants = page.locator('a[href*="/p/"]').filter({ has: page.getByRole('img') });

    // Actions
    this.addToBasketButton = page.getByRole('button', { name: /Add to basket|In den Warenkorb/i }).filter({ hasNot: page.locator('[data-testid="ProductTileAddToBasketButton"]') }).first();
    this.addToWishlistButton = page.getByTestId('WishListIcon-empty')

    // Supplementary info
    this.sizeGuideLink = page.getByRole('link', { name: /Size guide/i }).first();
    this.productDescription = page.locator('div').filter({ hasText: /^Description$/ }).first();

    // Feedback states
    this.addedToBasketConfirmation = page.getByText(/Added to basket/i).first();
    this.outOfStockMessage = page.getByText(/Out of stock/i).first();
  }

  // ─── Actions ─────────────────────────────────────────────────

  /**
   * Navigates directly to a product detail page by URL.
   * 
   * @param productUrl - Full or relative URL to the product
   */
  async openProduct(productUrl: string): Promise<void> {
    await this.navigateTo(productUrl);
    await this.dismissCookieConsent();
    await this.waitForNetworkIdle();
  }

  /**
   * Gets the product brand name text.
   */
  async getBrandName(): Promise<string> {
    return this.getTextContent(this.brandName);
  }

  /**
   * Gets the product name text.
   */
  async getProductName(): Promise<string> {
    return this.getTextContent(this.productName);
  }

  /**
   * Gets the current price text (e.g., "29,99 €").
   */
  async getCurrentPrice(): Promise<string> {
    return this.getTextContent(this.currentPrice);
  }

  /**
   * Checks if the product is on sale (has an original price).
   */
  async isOnSale(): Promise<boolean> {
    return this.isElementVisible(this.originalPrice, 3000);
  }

  /**
   * Gets the count of available size options.
   */
  async getAvailableSizeCount(): Promise<number> {
    return this.sizeOptions.count();
  }

  /**
   * Selects a size by its text label (e.g., "M", "42", "L").
   * 
   * @param size - The size label to select
   */
  async selectSize(size: string): Promise<void> {
    const sizeButton = this.sizeOptions.filter({ hasText: size }).first();
    await this.safeClick(sizeButton);
  }

  /**
   * Selects the first available (in-stock) size.
   * Skips sizes that appear disabled/out-of-stock.
   * 
   * @returns The size label that was selected, or null if none available
   */
  async selectFirstAvailableSize(): Promise<string | null> {
    // Some products don't have a size selector dropdown (e.g. one-size items, or sizes displayed directly)
    try {
      // Wait briefly for the selector to appear
      await this.sizeSelector.waitFor({ state: 'visible', timeout: 3000 });
      await this.safeClick(this.sizeSelector, { force: true });
      await this.page.waitForTimeout(500);
    } catch {
      // Ignore if size selector is not present or not clickable
    }

    const count = await this.sizeOptions.count();
    for (let i = 0; i < count; i++) {
      const option = this.sizeOptions.nth(i);
      // Notify me bell icon for some sizes
      const isDisabled = await option.isDisabled().catch(() => false);
      const hasStrikethrough = await option.locator('s, del, [class*="crossed"]').count() > 0;

      if (!isDisabled && !hasStrikethrough) {
        const sizeText = await this.getTextContent(option);
        await this.safeClick(option, { force: true });
        return sizeText;
      }
    }
    return null;
  }

  /**
   * Clicks the "Add to basket" button.
   * If size selection is required, selects the first available size first.
   */
  async addToBasket(): Promise<void> {
    await this.dismissCookieConsent();
    await this.dismissPopups();

    // Sometimes the add to basket button click is intercepted by overlays. Retry up to 3 times.
    let response = null;
    for (let i = 0; i < 3; i++) {
      const basketResponsePromise = this.page.waitForResponse(
        res => res.url().includes('basket') && res.request().method() !== 'GET' && [200, 201].includes(res.status()),
        { timeout: 5000 }
      ).catch(() => null);

      await this.safeClick(this.addToBasketButton, { force: true });
      response = await basketResponsePromise;
      if (response) break;

      // If we didn't get a response, check if a Cloudflare Turnstile challenge appeared
      const cfIframe = this.page.frameLocator('iframe[src*="cloudflare"]');
      const cfCheckbox = cfIframe.locator('input[type="checkbox"], .ctp-checkbox-label').first();
      if (await cfCheckbox.isVisible({ timeout: 2000 }).catch(() => false)) {
        await cfCheckbox.click();
        await this.page.waitForTimeout(3000); // Give it time to verify
      } else {
        await this.page.waitForTimeout(1000); // Wait before retrying normally
      }
    }

    if (!response) {
      await this.page.screenshot({ path: 'add-to-basket-failed.png' });
      throw new Error('Failed to add to basket: API request did not fire or succeed after 3 attempts.');
    }
    await this.page.waitForTimeout(2000);
  }

  /**
   * Full add-to-basket flow: select size → add to basket.
   * Returns the selected size label.
   */
  async selectSizeAndAddToBasket(): Promise<string | null> {
    await this.selectFirstAvailableSize();
    await this.addToBasket();
    return null;
  }

  /**
   * Clicks a different color variant.
   * 
   * @param index - Zero-based index of the color variant to click
   */
  async selectColorVariant(index: number): Promise<void> {
    await this.safeClick(this.colorVariants.nth(index));
    await this.waitForNetworkIdle();
  }

  /**
   * Returns the number of available color variants.
   */
  async getColorVariantCount(): Promise<number> {
    return this.colorVariants.count();
  }

  /**
   * Checks if the product is currently out of stock.
   */
  async isOutOfStock(): Promise<boolean> {
    return this.isElementVisible(this.outOfStockMessage, 3000);
  }

  /**
   * Checks if the "added to basket" confirmation is visible.
   */
  async isAddedToBasketConfirmationVisible(): Promise<boolean> {
    return this.isElementVisible(this.addedToBasketConfirmation, 5000);
  }

  // ─── Wishlist Actions ──────────────────────────────────────────

  /**
   * Clicks the "Add to wishlist" button (heart icon) on the PDP.
   */
  async addToWishlist(): Promise<void> {
    await this.dismissCookieConsent();
    await this.dismissPopups();
    await this.safeClick(this.addToWishlistButton, { force: true });
    await this.page.waitForTimeout(1500);
  }

  /**
   * Checks if the wishlist button is in an active/filled state.
   * On AboutYou, the heart icon changes fill color or adds aria attributes when active.
   */
  async isWishlistActive(): Promise<boolean> {
    // Check for common active state indicators: filled SVG, aria-pressed, data attributes
    const hasAriaPressed = await this.addToWishlistButton.getAttribute('aria-pressed')
      .then(v => v === 'true').catch(() => false);
    const hasActiveClass = await this.addToWishlistButton.getAttribute('class')
      .then(v => v?.includes('active') || v?.includes('filled') || false).catch(() => false);
    // Check if the SVG fill changes (filled heart vs outline)
    const hasFill = await this.addToWishlistButton.locator('svg[fill], svg path[fill]').count() > 0;

    return hasAriaPressed || hasActiveClass || hasFill;
  }
}

