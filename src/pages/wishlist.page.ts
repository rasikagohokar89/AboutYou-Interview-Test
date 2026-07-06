/**
 * @fileoverview Wishlist page object for the About You storefront.
 * Handles wishlist item display, removal, and add-to-basket interactions.
 */

import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class WishlistPage extends BasePage {
  // ─── Locators ────────────────────────────────────────────────

  /** Wishlist product cards */
  readonly wishlistItems: Locator;

  /** Product name links within wishlist items */
  readonly wishlistItemNames: Locator;

  /** Product price elements */
  readonly wishlistItemPrices: Locator;

  /** Product images */
  readonly wishlistItemImages: Locator;

  /** Remove from wishlist button (heart icon / remove) */
  readonly removeFromWishlistButton: Locator;

  /** "Add to bag" / "Add to basket" button on each wishlist item */
  readonly addToBagButton: Locator;

  /** Empty wishlist message */
  readonly emptyWishlistMessage: Locator;

  /** Size selector on wishlist product cards */
  readonly sizeSelector: Locator;

  /** Wishlist page heading */
  readonly pageHeading: Locator;

  constructor(page: Page) {
    super(page);

    // Wishlist items — product cards containing product links
    this.wishlistItems = page.locator('li a[href*="/p/"]').filter({ has: page.locator('img') });
    this.wishlistItemNames = page.locator('a[href*="/p/"]');
    this.wishlistItemPrices = page.getByText(/€/).first();
    this.wishlistItemImages = page.getByRole('img');

    // Action buttons
    this.removeFromWishlistButton = page.getByTestId('DeleteWishlistItemButton')
    this.addToBagButton = page.getByRole('button', { name: /Add to bag|Add to basket|In den Warenkorb/i });
    this.sizeSelector = page.getByRole('button', { name: /Select size|Größe wählen|Size/i });

    // Empty state
    this.emptyWishlistMessage = page.getByText(/wishlist is empty|Wunschliste ist leer|no items/i).first();

    // Page heading
    this.pageHeading = page.getByRole('heading', { name: /Wishlist|Wunschliste/i }).first();
  }

  // ─── Actions ─────────────────────────────────────────────────

  /**
   * Opens the wishlist page directly.
   */
  async open(): Promise<void> {
    await this.navigateTo('/wishlist');
    await this.dismissCookieConsent();
    await this.page.waitForTimeout(2000);
  }

  /**
   * Returns the number of items in the wishlist.
   */
  async getItemCount(): Promise<number> {
    await this.page.waitForTimeout(1000);
    return this.wishlistItems.count();
  }

  /**
   * Checks if the wishlist is empty.
   */
  async isEmpty(): Promise<boolean> {
    const itemCount = await this.getItemCount();
    return itemCount === 0 || await this.isElementVisible(this.emptyWishlistMessage, 3000);
  }

  /**
   * Extracts data for a specific wishlist item.
   * 
   * @param index - Zero-based index of the wishlist item
   */
  async getItemData(index: number): Promise<{ name: string; price: string; imageVisible: boolean }> {
    const item = this.wishlistItems.nth(index);
    return {
      name: await item.locator('a[href*="/p/"]').allTextContents().then(texts => texts.join(' ').trim()),
      price: await item.getByText(/€/).first().textContent({ timeout: 2000 }).then(t => t?.trim() || '').catch(() => ''),
      imageVisible: await this.isElementVisible(item.locator('img').first(), 3000),
    };
  }

  /**
   * Removes an item from the wishlist by index.
   * 
   * @param index - Zero-based index of the item to remove
   */
  async removeItem(index: number): Promise<void> {
    await this.safeClick(this.removeFromWishlistButton.nth(index));
    await this.page.waitForTimeout(1500);
  }

  /**
   * Clicks the "Add to bag" button for a specific wishlist item.
   * 
   * @param index - Zero-based index of the item
   */
  async addItemToBasket(index: number): Promise<void> {
    await this.safeClick(this.addToBagButton.nth(index));
    await this.page.waitForTimeout(2000);
  }
}
