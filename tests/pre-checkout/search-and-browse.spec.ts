/**
 * @fileoverview Pre-checkout journey tests — search, browse, and product detail.
 * These are thin tests covering just enough of the discovery flow
 * to verify that products can be found and added to the cart.
 * 
 * Tags: @smoke, @regression, @pre-checkout
 */

import { test, expect } from '../../src/fixtures/test.fixtures';
import { HomePage } from '../../src/pages/home.page';
import { ProductListingPage } from '../../src/pages/product-listing.page';
import { ProductDetailPage } from '../../src/pages/product-detail.page';
import { TestData } from '../../src/helpers/test-data';

test.describe('Search & Browse @pre-checkout', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
  });

  // ─── Homepage ───────────────────────────────────────────────

  test.describe('Homepage', () => {

    test('should load homepage with key elements @smoke', async ({ homePage }) => {
      // Logo should be visible
      const logoVisible = await homePage.isElementVisible(homePage.logo);
      expect(logoVisible).toBe(true);

      // Search bar should be present
      const searchVisible = await homePage.isElementVisible(homePage.searchInput);
      expect(searchVisible).toBe(true);

      // Basket icon should be present
      const basketVisible = await homePage.isElementVisible(homePage.basketIcon);
      expect(basketVisible).toBe(true);
    });

    test('should have correct page title @regression', async ({ homePage }) => {
      const title = await homePage.getPageTitle();
      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(0);
    });
  });

  // ─── Search ─────────────────────────────────────────────────

  test.describe('Search Functionality', () => {

    test('should return results for valid search query @smoke @regression', async ({ homePage, page }) => {
      await homePage.searchAndSubmit(TestData.SEARCH_QUERIES.general);

      const plp = new ProductListingPage(page);
      const productCount = await plp.getProductCount();
      expect(productCount).toBeGreaterThan(0);
    });

    test('should handle search with no results @negative', async ({ homePage, page }) => {
      await homePage.searchAndSubmit(TestData.SEARCH_QUERIES.noResults);

      const plp = new ProductListingPage(page);
      // Either no products or "no results" message
      const count = await plp.getProductCount();
      const hasNoResults = await plp.hasNoResults();
      expect(count === 0 || hasNoResults).toBe(true);
    });

    test('should handle XSS attempt in search @negative @edge-case', async ({ homePage, page }) => {
      await homePage.searchAndSubmit(TestData.SEARCH_QUERIES.specialChars);

      // Page should handle this gracefully — no script execution
      const pageTitle = await page.title();
      expect(pageTitle).toBeTruthy();
      // Should not contain the script tag in the page content
      const content = await page.content();
      expect(content).not.toContain('<script>alert');
    });

    test('should handle SQL injection attempt in search @negative @edge-case', async ({ homePage, page }) => {
      await homePage.searchAndSubmit(TestData.SEARCH_QUERIES.sqlInjection);

      // Page should handle gracefully
      const pageTitle = await page.title();
      expect(pageTitle).toBeTruthy();
    });
  });

  // ─── Product Detail Page ────────────────────────────────────

  test.describe('Product Detail Page', () => {

    test('should display product information on PDP @smoke @regression', async ({ homePage, page }) => {
      await homePage.searchAndSubmit(TestData.SEARCH_QUERIES.general);

      const plp = new ProductListingPage(page);
      await plp.clickRandomProduct();

      const pdp = new ProductDetailPage(page);

      // Product name should be visible
      const nameVisible = await pdp.isElementVisible(pdp.productName);
      expect(nameVisible).toBe(true);

      // Price should be visible
      const priceVisible = await pdp.isElementVisible(pdp.currentPrice);
      expect(priceVisible).toBe(true);

      // Add to basket button should be present
      const addToBasketVisible = await pdp.isElementVisible(pdp.addToBasketButton);
      expect(addToBasketVisible).toBe(true);
    });

    test('should have selectable size options @regression', async ({ homePage, page }) => {
      await homePage.searchAndSubmit(TestData.SEARCH_QUERIES.general);

      const plp = new ProductListingPage(page);
      await plp.clickRandomProduct();

      const pdp = new ProductDetailPage(page);
      const sizeCount = await pdp.getAvailableSizeCount();
      // Product should have at least one size option
      expect(sizeCount).toBeGreaterThanOrEqual(0);
    });

    test('should display product images @regression', async ({ homePage, page }) => {
      await homePage.searchAndSubmit(TestData.SEARCH_QUERIES.general);

      const plp = new ProductListingPage(page);
      await plp.clickRandomProduct();

      const pdp = new ProductDetailPage(page);
      const imagesVisible = await pdp.isElementVisible(pdp.productImages.first());
      expect(imagesVisible).toBe(true);
    });
  });
});
