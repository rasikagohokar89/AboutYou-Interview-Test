/**
 * @fileoverview Home page object for the About You storefront.
 * Provides access to homepage-specific elements: navigation,
 * search bar, and promotional content. Used primarily as an
 * entry point into the shopping journey.
 */

import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class HomePage extends BasePage {
  // ─── Locators ────────────────────────────────────────────────

  /** Main logo / home link */
  readonly logo: Locator;

  /** Search input field in the header */
  readonly searchInput: Locator;

  /** Search submit button */
  readonly searchButton: Locator;

  /** Search autocomplete suggestion container */
  readonly searchSuggestions: Locator;

  /** Main navigation category links */
  readonly navigationCategories: Locator;

  /** User account / login icon in header */
  readonly accountIcon: Locator;

  /** Basket/cart icon in header */
  readonly basketIcon: Locator;

  /** Basket item count badge */
  readonly basketBadge: Locator;

  /** Wishlist icon in header */
  readonly wishlistIcon: Locator;

  readonly change_to_english: Locator;

  readonly change_to_de: Locator;
  readonly language_change: Locator
  constructor(page: Page) {
    super(page);

    // Header elements
    // The About You logo can usually be found via a link to home or by alt text
    this.logo = page.getByRole('link', { name: /About You/i }).first();
    // Use generic type selector to find search bar to work across all languages
    this.searchInput = page.locator('input[type="search"], input[data-testid*="search"], [data-testid*="search"] input').filter({ visible: true }).first();
    this.searchButton = page.locator('button[type="submit"]').filter({ has: page.locator('svg, img') }).first();
    this.searchSuggestions = page.locator('ul').filter({ hasText: /Suggestions|Vorschläge|Návrhy/i }).first(); // generic fallback

    // Navigation
    this.navigationCategories = page.getByRole('navigation').getByRole('link');

    // Account & cart
    this.accountIcon = page.getByRole('button', { name: /Login/i }).first();
    this.basketIcon = page.getByRole('button', { name: /Basket/i }).first();
    this.basketBadge = this.basketIcon.locator('div, span').filter({ hasText: /^[0-9]+$/ }).first();
    this.wishlistIcon = page.getByTestId('Wishlist');

    //Language change
    this.change_to_english = page.getByTestId('languageCountrySwitchLanguage-Englisch')
    this.change_to_de = page.getByTestId('languageCountrySwitchLanguage-German')
    this.language_change = page.getByTestId('languageCountrySwitch')
  }

  // ─── Actions ─────────────────────────────────────────────────

  /**
   * Opens the About You homepage.
   */
  async open(): Promise<void> {
    await this.navigateTo('/');
    await this.dismissCookieConsent();
    await this.dismissPopups();
  }

  /**
   * Performs a product search using the search bar.
   * 
   * @param query - The search term to enter
   */
  // async searchFor(query: string): Promise<void> {
  //   // Some About You layouts require clicking the search icon first to expand the search bar
  //   if (!(await this.searchInput.isVisible().catch(() => false))) {
  //     // Look for the generic search icon button in the header
  //     const searchToggle = this.page.getByTestId('search-button').or(this.page.locator('button[data-testid*="search"]')).first();
  //     await searchToggle.click({ force: true }).catch(() => { });
  //   }

  //   await this.safeClick(this.searchInput);
  //   await this.safeFill(this.searchInput, query);
  //   // Wait briefly for autocomplete to appear
  //   await this.page.waitForTimeout(1000);
  // }
  async searchFor(query: string): Promise<void> {
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.dismissPopups();
        await this.page.waitForSelector('.s1vj811m.sfjfx4y.s1823pp1.sbn1l2g');
        await this.page.locator('.s1vj811m.sfjfx4y.s1823pp1.sbn1l2g').click();
        await this.page.getByTestId('searchBarInput').fill(query);
        await this.page.waitForTimeout(1000);
        return;
      } catch (error) {
        console.log(`Search attempt ${attempt}/${maxRetries} failed: ${(error as Error).message}`);
        if (attempt === maxRetries) {
          throw new Error(`Search failed after ${maxRetries} retries for query: "${query}"`);
        }
        await this.page.waitForTimeout(1000);
      }
    }
  }

  /**
   * Submits the current search query (presses Enter).
   */
  async submitSearch(): Promise<void> {
    await this.searchInput.press('Enter');
    await this.waitForNetworkIdle();
  }

  /**
   * Performs a full search: types query and submits.
   * 
   * @param query - The search term
   */
  async searchAndSubmit(query: string): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded').catch(() => { });
    await this.searchFor(query);
    await this.submitSearch();
  }

  /**
   * Navigates to the basket by clicking the basket icon.
   */
  async goToBasket(): Promise<void> {
    await this.safeClick(this.basketIcon);
    await this.waitForUrl(/basket/);
  }

  /**
   * Navigates to login by clicking the account icon.
   */
  async goToLogin(): Promise<void> {
    await this.safeClick(this.accountIcon);
  }

  /**
   * Gets the current basket item count from the badge.
   * Returns 0 if badge is not visible.
   */
  async getBasketCount(): Promise<number> {
    const isVisible = await this.isElementVisible(this.basketBadge, 3000);
    if (!isVisible) return 0;
    const text = await this.getTextContent(this.basketBadge);
    return parseInt(text, 10) || 0;
  }

  /**
   * Returns the list of visible navigation category names.
   */
  async getNavigationCategories(): Promise<string[]> {
    const categories = await this.navigationCategories.allTextContents();
    return categories.map(c => c.trim()).filter(c => c.length > 0);
  }

  // ─── Wishlist ──────────────────────────────────────────────────

  /**
   * Gets the current wishlist item count from the header badge.
   * Returns 0 if badge is not visible.
   */
  async getWishlistCount(): Promise<number> {
    const badge = this.wishlistIcon.locator('div, span').filter({ hasText: /^[0-9]+$/ }).first();
    const isVisible = await this.isElementVisible(badge, 3000);
    if (!isVisible) return 0;
    const text = await this.getTextContent(badge);
    return parseInt(text, 10) || 0;
  }

  /**
   * Navigates to the wishlist page by clicking the wishlist icon.
   */
  async goToWishlist(): Promise<void> {
    await this.safeClick(this.wishlistIcon);
    await this.page.waitForTimeout(2000);
  }

  // ─── Language ──────────────────────────────────────────────────

  /**
   * Changes the site language by navigating to the locale-specific URL.
   * 
   * @param locale - The target locale prefix (e.g., 'en' for English, 'de' for German)
   */
  async changeLanguage(locale: string): Promise<void> {
    // AboutYou uses subdomain-based locale: en.aboutyou.de vs www.aboutyou.de
    //const currentUrl = this.page.url();
    let newUrl: string;
    this.language_change.click()
    if (locale === 'de') {
      await this.change_to_de.click()
    } else {
      await this.change_to_english.click()
    }
    await this.page.waitForLoadState('domcontentloaded')
    await this.dismissCookieConsent();
  }

  // ─── Mega Menu / Navigation ────────────────────────────────────

  /**
   * Clicks a top-level navigation category link (e.g., "Women", "Men").
   * 
   * @param categoryName - The visible text of the category
   */
  async clickNavigationCategory(categoryName: string): Promise<void> {
    const category = this.navigationCategories.filter({ hasText: new RegExp(`^${categoryName}$`, 'i') }).first();
    await this.safeClick(category);
    await this.waitForNetworkIdle();
  }
}

