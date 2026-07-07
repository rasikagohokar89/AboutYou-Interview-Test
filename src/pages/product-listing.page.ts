import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './base.page';
import type { ProductCardData } from '../types/product.types';

export class ProductListingPage extends BasePage {
  // ─── Locators ────────────────────────────────────────────────

  /** Individual product cards in the listing */
  readonly productCards: Locator;

  /** Product card links (clickable to navigate to PDP) */
  readonly productLinks: Locator;

  /** "No results" message */
  readonly noResultsMessage: Locator;

  // ─── Filter & Sort Locators ──────────────────────────────────

  /** Filter toggle button */
  readonly filterButton: Locator;

  /** Sort dropdown button */
  readonly sortDropdown: Locator;

  /** Sort options in the dropdown */
  readonly sortOptions: Locator;

  /** Applied filter chips/pills */
  readonly activeFilterChips: Locator;

  /** "Clear all" filters button */
  readonly clearAllFiltersButton: Locator;

  /** Product count / results count text */
  readonly productCountText: Locator;

  constructor(page: Page) {
    super(page);

    this.productCards = page.locator('li a[href*="/p/"]').filter({ has: page.locator('img') });
    this.productLinks = this.productCards; // For AboutYou, the card IS the link
    this.noResultsMessage = page.getByText(/We couldn't find anything|no results|nenalezli|keine ergebnisse/i).first();

    // Filter & Sort
    this.filterButton = page.getByRole('button', { name: /Filter/i }).first();
    this.sortDropdown = page.getByRole('button', { name: /Sort|Sortieren/i }).first();
    this.sortOptions = page.getByRole('option').or(page.getByRole('menuitem')).or(page.getByRole('radio'));
    this.activeFilterChips = page.getByRole('button').filter({ hasText: /×|✕|remove/i });
    this.clearAllFiltersButton = page.getByTestId('[data-testid="resetButton"]')
    this.productCountText = page.getByText(/products|Produkte|results|Ergebnisse/i).first();
  }

  // ─── Actions ─────────────────────────────────────────────────

  /**
   * Returns the number of product cards currently visible.
   */
  async getProductCount(): Promise<number> {
    await this.page.waitForTimeout(2000); // Allow products to load
    return this.productCards.count();
  }

  /**
   * Clicks on a random product from the listing to navigate to its PDP.
   * Using a random selection avoids parallel tests colliding on the same product.
   * 
   * @returns The URL of the product that was clicked
   */
  async clickRandomProduct(): Promise<string> {
    await this.dismissPopups();

    const count = await this.productLinks.count();
    const randomIndex = Math.floor(Math.random() * Math.min(count, 10)); // Pick from first 10 to stay in viewport
    const link = this.productLinks.nth(randomIndex);
    const href = await link.getAttribute('href') || '';
    if (href) {
      await this.page.goto(href, { waitUntil: 'domcontentloaded' });
    } else {
      await this.safeClick(link, { force: true });
      await this.page.waitForURL('**/p/**', { timeout: 10000 });
    }
    return href;
  }

  /**
   * Clicks on a product at a specific index.
   * 
   * @param index - Zero-based index of the product to click
   */
  async clickProductAtIndex(index: number): Promise<void> {
    await this.safeClick(this.productLinks.nth(index));
    await this.waitForNetworkIdle();
  }

  /**
   * Extracts product card data for assertion.
   * 
   * @param index - Zero-based index of the product card
   * @returns ProductCardData object with extracted information
   */
  async getProductCardData(index: number): Promise<ProductCardData> {
    const card = this.productCards.nth(index);
    const nameEl = card.locator('p, div').filter({ hasText: /^[A-Z]/ }).first();
    const priceEl = card.getByText(/€/).first();
    const originalPriceEl = card.locator('s, del, [class*="crossed"]').first();
    const wishlistBtn = card.getByRole('button').filter({ hasText: '' }).first(); // Wishlist is usually a button with icon
    const image = card.getByRole('img').first();

    return {
      brand: 'Unknown', // Brand text might be generic
      name: await this.getTextContent(nameEl),
      currentPrice: await this.getTextContent(priceEl),
      originalPrice: await this.isElementVisible(originalPriceEl, 2000)
        ? await this.getTextContent(originalPriceEl)
        : undefined,
      hasWishlistButton: await this.isElementVisible(wishlistBtn, 2000),
      imageVisible: await this.isElementVisible(image, 2000),
    };
  }

  /**
   * Checks whether the "no results" state is displayed.
   */
  async hasNoResults(): Promise<boolean> {
    return this.isElementVisible(this.noResultsMessage, 5000);
  }

  // ─── Filter Methods ─────────────────────────────────────────

  /**
   * Opens the filter panel by clicking the filter button.
   */
  async openFilters(): Promise<void> {
    await this.safeClick(this.filterButton);
    await this.page.waitForTimeout(1000);
  }

  /**
   * Applies a filter by clicking on a filter category and selecting a value.
   * 
   * @param categoryName - The name of the filter category (e.g., "Brand", "Color")
   * @param value - The filter value to select (e.g., "Nike", "Black")
   */
  async applyFilter(categoryName: string, value: string): Promise<void> {
    // Click the filter category header to expand it
    const categoryHeader = this.page.getByRole('button', { name: new RegExp(categoryName, 'i') }).first();
    if (await this.isElementVisible(categoryHeader, 3000)) {
      await this.safeClick(categoryHeader);
      await this.page.waitForTimeout(500);
    }

    // Click the specific filter value
    const filterValue = this.page.getByRole('checkbox', { name: new RegExp(value, 'i') })
      .or(this.page.getByRole('button', { name: new RegExp(value, 'i') }))
      .or(this.page.getByText(new RegExp(`^${value}$`, 'i')))
      .first();
    await this.safeClick(filterValue);
    await this.page.waitForTimeout(2000); // Wait for products to reload
  }

  /**
   * Checks if a specific filter category is visible in the filter panel.
   * 
   * @param categoryName - The name of the filter category
   */
  async isFilterCategoryVisible(categoryName: string): Promise<boolean> {
    const category = this.page.getByRole('button', { name: new RegExp(categoryName, 'i') })
      .or(this.page.getByText(new RegExp(categoryName, 'i')))
      .first();
    return this.isElementVisible(category, 3000);
  }

  /**
   * Returns the count of applied filter chips.
   */
  async getAppliedFilterCount(): Promise<number> {
    return this.activeFilterChips.count();
  }

  /**
   * Removes a specific applied filter chip by index.
   * 
   * @param index - Zero-based index of the filter chip to remove
   */
  async removeFilter(index: number): Promise<void> {
    await this.safeClick(this.activeFilterChips.nth(index));
    await this.page.waitForTimeout(2000);
  }

  /**
   * Clears all applied filters.
   */
  async clearAllFilters(): Promise<void> {
    if (await this.isElementVisible(this.clearAllFiltersButton, 3000)) {
      await this.safeClick(this.clearAllFiltersButton);
      await this.page.waitForTimeout(2000);
    }
  }

  /**
   * Selects a sort option from the sort dropdown.
   * 
   * @param optionText - The sort option text (e.g., "Price: low to high")
   */
  async sortBy(optionText: string): Promise<void> {
    await this.safeClick(this.sortDropdown);
    await this.page.waitForTimeout(500);
    const option = this.page.getByText(new RegExp(optionText, 'i')).first();
    await this.safeClick(option);
    await this.page.waitForTimeout(2000);
  }

  /**
   * Extracts the price from a product card at a given index.
   * 
   * @param index - Zero-based index of the product card
   * @returns The price as a float, or 0 if not parseable
   */
  async getProductPrice(index: number): Promise<number> {
    const card = this.productCards.nth(index);
    const priceText = await card.getByText(/€/).first().textContent({ timeout: 3000 }).catch(() => '0');
    const match = priceText?.match(/[\d]+[.,]\d{2}/);
    if (match) {
      return parseFloat(match[0].replace(',', '.'));
    }
    return 0;
  }
}
