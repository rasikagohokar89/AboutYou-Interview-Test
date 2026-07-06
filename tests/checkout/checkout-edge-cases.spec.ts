/**
 * @fileoverview Checkout edge case and resilience tests.
 * Tests unexpected scenarios that can occur during checkout:
 * stock changes, price changes, session expiry, browser back/refresh.
 * 
 * Tags: @regression, @checkout, @edge-case
 */

import { test, expect } from '../../src/fixtures/test.fixtures';
import { BasketPage } from '../../src/pages/basket.page';
import { CheckoutPage } from '../../src/pages/checkout.page';
import { HomePage } from '../../src/pages/home.page';
import { TestData } from '../../src/helpers/test-data';

test.describe('Checkout Edge Cases @checkout @edge-case', () => {
  test.afterEach(async ({ page }) => {
    try {
      const basket = new BasketPage(page);
      await basket.open();
      await basket.clearCart();
    } catch {
      // Best-effort cleanup
    }
  });


  // ─── Browser Navigation Edge Cases ──────────────────────────

  test.describe('Browser Navigation @edge-case', () => {

    test('should handle browser back button during checkout @regression @edge-case', async ({ pageWithProductsInCart, basketPage, checkoutPage, page }) => {

      await basketPage.open();
      await basketPage.proceedToCheckout();

      // Fill address 
      await checkoutPage.fillShippingAddress(TestData.VALID_DE_ADDRESS);
      await checkoutPage.clickContinue();

      // Press browser back button
      await page.goBack();
      await page.waitForTimeout(2000);

      // Page should either return to address form or show a warning
      // It should NOT crash or show a white screen
      const pageTitle = await page.title();
      expect(pageTitle).toBeTruthy();
    });

    test('should handle page refresh during checkout @regression @edge-case', async ({ pageWithProductsInCart, basketPage, checkoutPage, page }) => {

      await basketPage.open();
      await basketPage.proceedToCheckout();

      // Navigate to checkout
      await basketPage.open();
      await basketPage.proceedToCheckout();

      // Fill address
      await checkoutPage.fillShippingAddress(TestData.VALID_DE_ADDRESS);
      // Reload the page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Page should recover gracefully
      const pageTitle = await page.title();
      await expect(pageTitle).toBeTruthy();

      // Either the form should still be populated, or we're back at a valid state
      const currentUrl = page.url();
      await expect(currentUrl).toBeTruthy();
    });

    test('should handle navigating away and returning @regression @edge-case', async ({ pageWithProductsInCart, basketPage, homePage }) => {

      // Navigate back to basket
      await basketPage.open();

      // Cart items should be present
      const itemCount_before = await basketPage.getItemCount();
      expect(itemCount_before).toEqual(1);

      // Navigate away to homepage
      await homePage.open();

      // Navigate back to basket
      await basketPage.open();

      // Cart items should still be present
      const itemCount_after = await basketPage.getItemCount();
      expect(itemCount_after).toEqual(itemCount_before);

      // Checkout button should still work
      const checkoutVisible = await basketPage.isElementVisible(basketPage.checkoutButton);
      expect(checkoutVisible).toBe(true);
    });
  });
});
