/**
 * @fileoverview Address validation tests for the checkout flow.
 * Tests form validation for shipping and billing addresses,
 * covering valid, invalid, and edge-case inputs.
 * 
 * Tags: @regression, @checkout, @validation
 */

import { test, expect } from '../../src/fixtures/test.fixtures';
import { BasketPage } from '../../src/pages/basket.page';
import { TestData } from '../../src/helpers/test-data';

test.describe('Address Validation @checkout @validation', () => {

  // ─── Positive Tests ─────────────────────────────────────────

  test.describe('Valid Addresses @regression', () => {

    const testAddresses = [
      { type: 'valid DE address', data: TestData.VALID_DE_ADDRESS },
      { type: 'address with special characters (umlauts)', data: TestData.SPECIAL_CHARS_ADDRESS }
    ];

    for (const { type, data } of testAddresses) {
      test(`Provide ${type} and verify that checkout continues @regression`, async ({ pageWithProductsInCart, basketPage, checkoutPage }) => {
        // 2. Proceed to checkout
        await basketPage.proceedToCheckout();

        // 3. Fill address and continue
        await checkoutPage.fillShippingAddress(data);
        await checkoutPage.clickContinue();

        // 4. Validate that there are no errors and we reached the Payment tab
        const hasErrors = await checkoutPage.hasValidationErrors();
        expect(hasErrors).toBe(false);

        await expect(checkoutPage.paymentOptions).toBeVisible();
      });
    }
  });

  // ─── Negative Tests ─────────────────────────────────────────

  test.describe('Invalid Addresses @negative', () => {

    test('should show errors for empty required fields @regression @negative', async ({ pageWithProductsInCart, basketPage, checkoutPage }) => {

      // Navigate to checkout
      await basketPage.open();
      await basketPage.proceedToCheckout();

      // Fill shipping address with empty values
      await checkoutPage.fillShippingAddress(TestData.EMPTY_ADDRESS);
      // Submit without filling any fields
      await checkoutPage.clickContinue();

      // Should show validation errors
      // Use getValidationErrors instead of hasValidationErrors to get the actual text
      const errorsList = await checkoutPage.getValidationErrors();
      const allErrorsText = errorsList.join(' ');

      expect(allErrorsText).toContain('Street and house number is required');
      expect(allErrorsText).toContain('ZIP Code is required');
      expect(allErrorsText).toContain('City is required');
    });
  });

  // ─── Edge Cases ─────────────────────────────────────────────

  test.describe('Address Edge Cases @edge-case', () => {

    test('Verify that continue button is disabled when no collection points are selected @edge-case', async ({ pageWithProductsInCart, basketPage, checkoutPage }) => {


      // Navigate to checkout
      await basketPage.open();
      await basketPage.proceedToCheckout();

      await checkoutPage.provide_collection_point();

      // Verify continue button is disabled
      await expect(checkoutPage.continueButton).toBeDisabled();

      // Verify validation error text
      // We check the actual text content of the validation error locator
      await expect(checkoutPage.validationErrors.or(checkoutPage.fieldErrors).first()).toContainText('Please select a collection point');
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
