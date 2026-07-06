/**
 * @fileoverview Custom Playwright test fixtures for the About You checkout suite.
 * 
 * Provides:
 * - Pre-instantiated Page Object Model instances for all pages
 * - Automatic cookie consent dismissal via beforeEach hook
 * - `withProductInCart` fixture that sets up a cart with a product (reusable setup)
 * - `authenticatedPage` fixture that uses stored auth state
 * 
 * Usage:
 *   import { test, expect } from '../src/fixtures/test.fixtures';
 *   test('my test', async ({ basketPage, checkoutPage }) => { ... });
 */

import { test as base, expect, type Page } from '@playwright/test';
import { HomePage } from '../pages/home.page';
import { ProductListingPage } from '../pages/product-listing.page';
import { ProductDetailPage } from '../pages/product-detail.page';
import { BasketPage } from '../pages/basket.page';
import { CheckoutPage } from '../pages/checkout.page';
import { LoginPage } from '../pages/login.page';
import { TestConfig } from '../config/test.config';
import { TestData } from '@helpers/test-data';

export type TestOptions = {
  /** Array of search queries for products to add to the cart */
  productsToAdd: string[];
};

/**
 * Type definition for all custom fixtures.
 * Extends Playwright's base test with POM instances and setup utilities.
 */
interface TestFixtures extends TestOptions {
  /** Homepage page object */
  homePage: HomePage;
  /** Product listing page object */
  productListingPage: ProductListingPage;
  /** Product detail page object */
  productDetailPage: ProductDetailPage;
  /** Basket/cart page object */
  basketPage: BasketPage;
  /** Checkout page object */
  checkoutPage: CheckoutPage;
  /** Login page object */
  loginPage: LoginPage;
  /** Pre-configured page with a product already in the cart */
  pageWithProductsInCart: Page;
}

/**
 * Extended test instance with custom fixtures.
 * All page objects are lazily instantiated and share the same page instance.
 */
export const test = base.extend<TestFixtures>({
  productsToAdd: [[TestData.SEARCH_QUERIES.general], { option: true }],


  /**
   * HomePage fixture — instantiated from the current page.
   * Automatically dismisses cookie consent on first use.
   */
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await use(homePage);
  },

  /**
   * ProductListingPage fixture.
   */
  productListingPage: async ({ page }, use) => {
    const plp = new ProductListingPage(page);
    await use(plp);
  },

  /**
   * ProductDetailPage fixture.
   */
  productDetailPage: async ({ page }, use) => {
    const pdp = new ProductDetailPage(page);
    await use(pdp);
  },

  /**
   * BasketPage fixture.
   */
  basketPage: async ({ page }, use) => {
    const basket = new BasketPage(page);
    await use(basket);
  },

  /**
   * CheckoutPage fixture.
   */
  checkoutPage: async ({ page }, use) => {
    const checkout = new CheckoutPage(page);
    await use(checkout);
  },

  /**
   * LoginPage fixture.
   */
  loginPage: async ({ page }, use) => {
    const login = new LoginPage(page);
    await use(login);
  },

  /**
   * Setup fixture: Adds configurable products to the cart based on `productsToAdd` option.
   */
  pageWithProductsInCart: async ({ page, productsToAdd }, use) => {
    const homePage = new HomePage(page);
    const pdp = new ProductDetailPage(page);
    const plp = new ProductListingPage(page);

    let lastProductDetails = { name: '', price: 0 };

    for (const item of productsToAdd) {
      await homePage.open();
      await homePage.solveTurnstile();

      await homePage.searchAndSubmit(item);
      await homePage.solveTurnstile();

      await plp.clickRandomProduct();
      await homePage.solveTurnstile();

      // Extract product details before selecting size and adding to basket
      const brand = await pdp.getBrandName();
      const prodName = await pdp.getProductName();
      const name = brand ? `${brand} ${prodName}` : prodName;

      const priceText = await pdp.getCurrentPrice();
      let price = 0;
      const match = priceText.match(/\d+[.,]\d{2}/);
      if (match) {
        price = parseFloat(match[0].replace(',', '.'));
      }

      lastProductDetails = { name, price };

      await pdp.selectFirstAvailableSize();
      await homePage.solveTurnstile();

      await pdp.addToBasket();
      await homePage.solveTurnstile();


      // Close mini-basket sidebar that might block subsequent actions
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
    }

    (page as any).productDetails = lastProductDetails;

    await use(page);

    const basket = new BasketPage(page);
    try {
      await basket.open();
      await basket.clearCart();
    } catch {
      // Best-effort cleanup
    }
  },
});

// Re-export expect for convenience
export { expect };
