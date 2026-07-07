/**
 * @fileoverview Order summary verification tests.
 * Validates that the checkout order summary displays correct
 * product details, prices, and totals matching the basket.
 * 
 * Tags: @regression, @checkout, @order-summary
 */

import { test, expect } from '../../src/fixtures/test.fixtures';
import { BasketPage } from '../../src/pages/basket.page';
import { TestData } from '../../src/helpers/test-data';

test.describe('Order Summary Verification @checkout @order-summary', () => {
  // Parse values to floats
  const parsePrice = (priceStr: string) => {
    const match = priceStr.match(/\d+[.,]\d{2}/);
    if (!match) return 0;
    return parseFloat(match[0].replace(',', '.'));
  };

  test('Verify order summary displays correct product details @regression', async ({ page, pageWithProductsInCart, basketPage, checkoutPage }) => {
    const productDetails = (pageWithProductsInCart as any).productDetails;
    console.log('Product details:', productDetails);

    let basketTotal = '';

    await test.step('Navigate to basket and capture total', async () => {
      await basketPage.open();
      await page.waitForTimeout(3000);
      basketTotal = await basketPage.getOrderTotal();
      console.log('Basket total:', basketTotal);
    });

    await test.step('Proceed to checkout', async () => {
      await basketPage.proceedToCheckout();
    });

    await test.step('Fill shipping address', async () => {
      await checkoutPage.fillShippingAddress(TestData.VALID_DE_ADDRESS);
      await checkoutPage.clickContinue();
      await page.waitForTimeout(2000);
    });

    await test.step('Verify order summary details', async () => {
      const summary = await checkoutPage.getOrderSummaryDetails();
      console.log('Order summary:', summary);

      // Product name should be present in the summary
      expect(summary.productName).toBeTruthy();

      // Total should contain a price value
      expect(summary.total).toMatch(/[€\d]/);
      console.log('Summary total:', summary.total);
      // verify basket total with order total
      expect(parsePrice(summary.total)).toBe(parsePrice(basketTotal));

      //TODO verify other order details
    });
  });

  // ─── Cleanup ────────────────────────────────────────────────

  test.afterEach(async ({ page }) => {
    try {
      const basket = new BasketPage(page);
      await basket.open();
      await basket.clearCart();
    } catch {
      // Best-effort cleanup
    }
  });
});
