/**
 * @fileoverview Voucher and promotional code E2E tests.
 * Tests the application, validation, and removal of voucher/promo codes
 * in the cart, including invalid and edge-case inputs.
 * 
 * Tags: @regression, @cart, @voucher
 */

import { test, expect } from '../../src/fixtures/test.fixtures';
import { BasketPage } from '../../src/pages/basket.page';
import { TestData } from '../../src/helpers/test-data';

test.describe('Voucher / Promo Code @cart @voucher', () => {


  // ─── Positive Tests ─────────────────────────────────────────

  test.describe('Voucher Input Presence', () => {

    //test.use({ productsToAdd: ['pant', 'dress'] });
    test('Provide valid voucher code and verify it is applied @positive @regression', async ({ page, pageWithProductsInCart, basketPage, checkoutPage }) => {

      //open basket page
      await basketPage.open();

      // proceed to checkout
      await basketPage.proceedToCheckout();

      // Get order total before voucher is applied 
      const cartItem = await basketPage.getCartItemData(0);
      const initialTotal = Number(cartItem.price);

      //Verify if inside payment tab
      if (!await checkoutPage.paymentOptions.isVisible()) {
        // add shipping details 
        await checkoutPage.fillShippingAddress(TestData.VALID_DE_ADDRESS);
        await checkoutPage.clickContinue();
      }
      await checkoutPage.addVoucherCode(TestData.VOUCHER_CODES.valid);

      // verify notification is received after the voucher is applied
      await expect(page.getByText(TestData.VALID_VOUCHER_SUCCESS_MSG)).toBeVisible()

      // verify price updated after the voucher is applied
      const finalTotal = parseFloat((await checkoutPage.reviewTotal.innerText()).replace('€', '').trim());
      expect(finalTotal).not.toEqual(initialTotal)
    });
  });

  // ─── Negative Tests ─────────────────────────────────────────

  test.describe('Invalid Voucher Codes @negative', () => {
    test.use({ productsToAdd: ['pant'] })
    test('Provide invalid voucher code and verify it is not applied @negative @regression', async ({ page, pageWithProductsInCart, basketPage, checkoutPage }) => {

      //open basket page
      await basketPage.open();
      await page.waitForTimeout(3000);

      // proceed to checkout
      await basketPage.proceedToCheckout();

      //Verify if inside payment tab
      if (!await checkoutPage.paymentOptions.isVisible()) {
        // add shipping details 
        await checkoutPage.fillShippingAddress(TestData.VALID_DE_ADDRESS);
        await checkoutPage.clickContinue();
      }

      // Get order total before voucher is applied 
      const initialTotal = parseFloat((await checkoutPage.reviewTotal.innerText()).replace('€', '').trim());

      await checkoutPage.addVoucherCode(TestData.VOUCHER_CODES.invalid);


      //verify error message is visible
      await expect(checkoutPage.checkoutError).toBeVisible();
      const error_message = await checkoutPage.checkoutError.innerText();
      console.log("error message ", error_message);
      expect(error_message).toContain('Unfortunately, this voucher code does not exist.');

      // verify price is not updated as voucher not applied
      const finalTotal = parseFloat((await checkoutPage.reviewTotal.innerText()).replace('€', '').trim());
      expect(finalTotal).toEqual(initialTotal)
    });
  });
  // ─── Cleanup ────────────────────────────────────────────────

  test.afterEach(async ({ page }) => {
    try {
      const basket = new BasketPage(page);
      await basket.open();
      await basket.clearCart();
      await page.close()
    } catch {
      // Best-effort cleanup
    }
  });
});
