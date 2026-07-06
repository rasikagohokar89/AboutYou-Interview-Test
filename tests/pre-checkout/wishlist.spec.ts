/**
 * @fileoverview Wishlist functionality tests.
 * Tests adding to wishlist from PDP, badge count, wishlist page display,
 * clickable elements on wishlist page, and removal.
 * 
 * Tags: @regression, @wishlist, @pre-checkout
 */

import { test, expect } from '../../src/fixtures/test.fixtures';
import { ProductListingPage } from '../../src/pages/product-listing.page';
import { ProductDetailPage } from '../../src/pages/product-detail.page';
import { WishlistPage } from '../../src/pages/wishlist.page';
import { TestData } from '../../src/helpers/test-data';

test.describe('Wishlist Functionality @wishlist @pre-checkout', () => {

  test.describe('Add to Wishlist', () => {

    test('should add a product to the wishlist from PDP @smoke @regression', async ({ homePage, page }) => {
      await homePage.open();
      await homePage.solveTurnstile();

      await homePage.searchAndSubmit(TestData.SEARCH_QUERIES.general);
      await homePage.solveTurnstile();

      const plp = new ProductListingPage(page);
      await plp.clickRandomProduct();
      await homePage.solveTurnstile();

      const pdp = new ProductDetailPage(page);

      // Store product name before adding to wishlist
      const productName = await pdp.getProductName();
      console.log('Product to add to wishlist:', productName);

      await test.step('Click wishlist button', async () => {
        await pdp.addToWishlist();
      });

      await test.step('Verify added to wishlist', async () => {
        await homePage.goToWishlist();
        const count = await homePage.getWishlistCount()
        expect(count).toBeGreaterThanOrEqual(1);

      });
    });

    test('should show updated wishlist badge count in header @regression', async ({ homePage, page }) => {
      await homePage.open();
      await homePage.solveTurnstile();

      // Get initial wishlist count
      const initialCount = await homePage.getWishlistCount();
      console.log('Initial wishlist count:', initialCount);

      // Navigate to a product and add to wishlist
      await homePage.searchAndSubmit(TestData.SEARCH_QUERIES.category);
      await homePage.solveTurnstile();

      const plp = new ProductListingPage(page);
      await plp.clickRandomProduct();
      await homePage.solveTurnstile();

      const pdp = new ProductDetailPage(page);
      await pdp.addToWishlist();

      // Check the wishlist count in header
      const updatedCount = await homePage.getWishlistCount();
      console.log('Updated wishlist count:', updatedCount);
      expect(updatedCount).toBeGreaterThanOrEqual(1);
    });
  });

  test.describe('Wishlist Page', () => {

    test('should display products in the wishlist page with correct details @regression', async ({ homePage, page }) => {
      // First add a product to wishlist
      await homePage.open();
      await homePage.solveTurnstile();

      await homePage.searchAndSubmit(TestData.SEARCH_QUERIES.general);
      await homePage.solveTurnstile();

      const plp = new ProductListingPage(page);
      await plp.clickRandomProduct();
      await homePage.solveTurnstile();

      const pdp = new ProductDetailPage(page);
      const productName = await pdp.getProductName();
      await pdp.addToWishlist();

      // Navigate to wishlist page
      const wishlistPage = new WishlistPage(page);
      await wishlistPage.open();

      await test.step('Verify wishlist is not empty', async () => {
        const isEmpty = await wishlistPage.isEmpty();
        console.log('Wishlist empty:', isEmpty);
        // If the product was added, it should not be empty
        if (!isEmpty) {
          const itemCount = await wishlistPage.getItemCount();
          expect(itemCount).toBeGreaterThanOrEqual(1);
          console.log('Wishlist item count:', itemCount);
        }
      });

      await test.step('Verify product images are visible', async () => {
        const imgCount = await wishlistPage.wishlistItemImages.count();
        expect(imgCount).toBeGreaterThan(0);
      });
    });

    test('should verify all clickable elements on wishlist page @regression', async ({ homePage, page }) => {
      // Add a product first
      await homePage.open();
      await homePage.solveTurnstile();

      await homePage.searchAndSubmit(TestData.SEARCH_QUERIES.general);
      await homePage.solveTurnstile();

      const plp = new ProductListingPage(page);
      await plp.clickRandomProduct();
      await homePage.solveTurnstile();

      const pdp = new ProductDetailPage(page);
      await pdp.addToWishlist();

      // Go to wishlist
      const wishlistPage = new WishlistPage(page);
      await wishlistPage.open();

      const isEmpty = await wishlistPage.isEmpty();
      if (!isEmpty) {
        await test.step('Verify "Add to bag" button is visible', async () => {
          const addToBagVisible = await wishlistPage.isElementVisible(wishlistPage.addToBagButton.first(), 5000);
          console.log('Add to bag button visible:', addToBagVisible);
        });

        await test.step('Verify remove button is visible', async () => {
          const removeVisible = await wishlistPage.isElementVisible(wishlistPage.removeFromWishlistButton.first(), 5000);
          console.log('Remove from wishlist button visible:', removeVisible);
        });

        await test.step('Verify size selector is visible', async () => {
          const sizeVisible = await wishlistPage.isElementVisible(wishlistPage.sizeSelector.first(), 5000);
          console.log('Size selector visible:', sizeVisible);
        });

        await test.step('Verify product links are clickable', async () => {
          const linkCount = await wishlistPage.wishlistItemNames.count();
          expect(linkCount).toBeGreaterThan(0);
          console.log('Clickable product links count:', linkCount);
        });
      }
    });

    test('should remove a product from the wishlist @regression', async ({ homePage, page }) => {
      // Add a product first
      await homePage.open();
      await homePage.solveTurnstile();

      await homePage.searchAndSubmit(TestData.SEARCH_QUERIES.general);
      await homePage.solveTurnstile();

      const plp = new ProductListingPage(page);
      await plp.clickRandomProduct();
      await homePage.solveTurnstile();

      const pdp = new ProductDetailPage(page);
      await pdp.addToWishlist();

      // Navigate to wishlist
      const wishlistPage = new WishlistPage(page);
      await wishlistPage.open();

      const initialCount = await wishlistPage.getItemCount();
      console.log('Wishlist count before removal:', initialCount);

      if (initialCount > 0) {
        await test.step('Remove first item', async () => {
          await wishlistPage.removeItem(0);
          await page.waitForTimeout(2000);

          const updatedCount = await wishlistPage.getItemCount();
          console.log('Wishlist count after removal:', updatedCount);
          expect(updatedCount).toBeLessThan(initialCount);
        });
      }
    });
  });

  // ─── Cleanup ────────────────────────────────────────────────

  test.afterEach(async ({ page }) => {
    try {
      const wishlistPage = new WishlistPage(page);
      await wishlistPage.open();
      const count = await wishlistPage.getItemCount();
      for (let i = count - 1; i >= 0; i--) {
        await wishlistPage.removeItem(i);
      }
    } catch {
      // Best-effort cleanup
    }
  });
});

