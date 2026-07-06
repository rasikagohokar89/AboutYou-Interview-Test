/**
 * @fileoverview Checkout flow E2E tests — the core test suite for this role.
 * Tests the end-to-end checkout journey from basket through to order placement.
 * Uses API mocking for payment steps to avoid real transactions.
 * 
 * Tags: @smoke, @regression, @checkout
 */

import { test, expect } from '../../src/fixtures/test.fixtures';
import { BasketPage } from '../../src/pages/basket.page';
import { ApiInterceptor } from '../../src/helpers/api-interceptor';
import { TestData } from '../../src/helpers/test-data';

test.describe('Checkout Flow @checkout', () => {
  let apiInterceptor: ApiInterceptor;

  test.beforeEach(async ({ page }) => {
    apiInterceptor = new ApiInterceptor(page);
  });

  test('Verify complete checkout process with mocked payment @smoke @regression', async ({ page, pageWithProductsInCart, basketPage, checkoutPage }) => {


    // Mock successful payment response
    await apiInterceptor.mockPaymentSuccess();
    await apiInterceptor.mockOrderConfirmation();

    //Navigate to checkout page from basket page
    await basketPage.open();
    await basketPage.proceedToCheckout();

    // verify shipping address API was called in backend for address updation , with method PUT and status code 201
    let shippingApiResponse;
    page.on('response', async (response) => {
      if (
        response.url().includes('/next/api/co/v3/state/order/addresses/shipping')
      ) {
        shippingApiResponse = response;
      }
    });

    // verify state API is called that stores the state
    let stateResponse;
    page.on('response', async (response) => {
      if (
        response.url().includes('/next/api/co/v3/state')
      ) {
        stateResponse = response;
      }
    });

    // Verify if inside payment tab
    if (!await checkoutPage.paymentOptions.isVisible()) {
      // add shipping details and verify
      await checkoutPage.fillShippingAddress(TestData.VALID_DE_ADDRESS);
      // click on continue to move to payment tab
      await checkoutPage.clickContinue();
    }

    // shipping api response verification
    expect(shippingApiResponse).toBeDefined();
    expect(shippingApiResponse!.status()).toBe(201);
    expect(shippingApiResponse!.request().method()).toBe('PUT');
    const shippingJson = await shippingApiResponse!.json();
    expect(shippingJson).toBeDefined();

    // state api response verification
    expect(stateResponse).toBeDefined();
    expect(stateResponse!.status()).toBe(200);
    const stateJson = await stateResponse!.json();
    expect(stateJson).toBeDefined();



    // Select shipping if available
    const shippingCount = await checkoutPage.getShippingOptionCount();
    // select the shipping method according to index
    if (shippingCount > 0) {
      await checkoutPage.selectShippingMethod(0);
      await checkoutPage.clickContinue();
    }

    // Select payment method if available
    const paymentCount = await checkoutPage.getPaymentOptionCount();
    // select the payment method according to index 
    // in this case paypal selected 
    if (paymentCount > 0) {
      await checkoutPage.selectPaymentMethod(0);
    }

    // tick terms and conditions checkbox
    await checkoutPage.consent_checkbox.check();


    // Place order (mocked)
    const placeOrderVisible = await checkoutPage.isElementVisible(checkoutPage.placeOrderButton, 5000);
    if (placeOrderVisible) {
      // verify state API is called in backend and that that order current state details in it
      let payment_stateResponse;
      let confirmationResponse;
      page.on('response', async (response) => {
        if (
          response.url().includes('/next/api/co/v3/state')
        ) {
          payment_stateResponse = response;
        }
      })

      // verify order confirmation API called in backend
      page.on('response', async (response) => {
        if (
          response.url().includes('/next/api/co/v3/state/order/confirmation/execute')
        ) {
          confirmationResponse = response;
        }
      })

      await checkoutPage.clickPlaceOrder();

      // Verify current state API response
      expect(payment_stateResponse).toBeDefined();
      expect(payment_stateResponse!.status()).toBe(200);
      const stateJson = await payment_stateResponse!.json();
      expect(stateJson).toBeDefined();

      // Verify order confirmation API response
      expect(confirmationResponse).toBeDefined();
      expect(confirmationResponse!.status()).toBe(201);
      expect(confirmationResponse!.request().method()).toBe('POST');
      const confirmationJson = await confirmationResponse!.json();
      expect(confirmationJson.status).toBe('confirmed');
      expect(confirmationJson).toHaveProperty('orderId');
      //TODO Verify the order details with DB 

      //TODO  Verify order confirmation email received 
    }
  });

  test('Verify checkout process with declined payment @smoke @regression', async ({ page, pageWithProductsInCart, basketPage, checkoutPage }) => {

    // Mock declined payment response
    await apiInterceptor.mockPaymentDeclined();

    //Navigate to checkout page from basket page
    await basketPage.open();
    await basketPage.proceedToCheckout();

    // verify shipping address API was called in backend for address updation , with method PUT and status code 201
    let shippingApiResponse;
    page.on('response', async (response) => {
      if (
        response.url().includes('/next/api/co/v3/state/order/addresses/shipping')
      ) {
        shippingApiResponse = response;
      }
    });

    // verify state API is called that stores the state
    let stateResponse;
    page.on('response', async (response) => {
      if (
        response.url().includes('/next/api/co/v3/state')
      ) {
        stateResponse = response;
      }
    });

    // Verify if inside payment tab
    if (!await checkoutPage.paymentOptions.isVisible()) {
      // add shipping details and verify
      await checkoutPage.fillShippingAddress(TestData.VALID_DE_ADDRESS);
      // click on continue to move to payment tab
      await checkoutPage.clickContinue();
    }

    // shipping api response verification
    expect(shippingApiResponse).toBeDefined();
    expect(shippingApiResponse!.status()).toBe(201);
    expect(shippingApiResponse!.request().method()).toBe('PUT');
    const shippingJson = await shippingApiResponse!.json();
    console.log("Shipping Json", shippingJson);

    // state api response verification
    expect(stateResponse).toBeDefined();
    expect(stateResponse!.status()).toBe(200);
    const stateJson = await stateResponse!.json();
    console.log("State Json", stateJson);



    // Select shipping if available
    const shippingCount = await checkoutPage.getShippingOptionCount();
    // select the shipping method according to index
    if (shippingCount > 0) {
      await checkoutPage.selectShippingMethod(0);
      await checkoutPage.clickContinue();
    }

    // Select payment method if available
    const paymentCount = await checkoutPage.getPaymentOptionCount();
    // select the payment method according to index 
    // in this case paypal selected 
    if (paymentCount > 0) {
      await checkoutPage.selectPaymentMethod(0);
    }

    // tick terms and conditions checkbox
    await checkoutPage.consent_checkbox.check();


    // Place order (mocked)
    const placeOrderVisible = await checkoutPage.isElementVisible(checkoutPage.placeOrderButton, 5000);
    if (placeOrderVisible) {
      // verify state API is called in backend and that that order current state details in it
      let payment_stateResponse;
      let confirmationResponse;
      page.on('response', async (response) => {
        if (
          response.url().includes('/next/api/co/v3/state')
        ) {
          payment_stateResponse = response;
        }
      })

      // verify order confirmation API called in backend
      page.on('response', async (response) => {
        if (
          response.url().includes('/next/api/co/v3/state/order/confirmation/execute')
        ) {
          confirmationResponse = response;
        }
      })

      await checkoutPage.clickPlaceOrder();

      // Verify current state API response
      expect(payment_stateResponse).toBeDefined();
      expect(payment_stateResponse!.status()).toBe(200);
      const stateJson = await payment_stateResponse!.json();
      console.log("State Json", stateJson);
      expect(stateJson).toBeDefined();

      // Verify order confirmation API response
      expect(confirmationResponse).toBeDefined();
      expect(confirmationResponse!.status()).toBe(402);
      expect(confirmationResponse!.request().method()).toBe('POST');
      const confirmationJson = await confirmationResponse!.json();
      console.log("Confirmation Json", confirmationJson);
      expect(confirmationJson.success).toBe(false);
      expect(confirmationJson.error.code).toBe('INVALID_PHONE_NUMBER');

      //TODO Verify that the UI displays a payment error message
      //TODO Verify the with the DB using Admin API
    }
  });

  test('Verify card payment error with invalid card details @regression', async ({ page, pageWithProductsInCart, basketPage, checkoutPage }) => {
    // Mock payment declined to simulate card error
    await apiInterceptor.mockPaymentDeclined();

    // Navigate to checkout
    await basketPage.open();
    await basketPage.proceedToCheckout();

    // Fill shipping address if needed
    if (!await checkoutPage.paymentOptions.isVisible()) {
      await checkoutPage.fillShippingAddress(TestData.VALID_DE_ADDRESS);
      await checkoutPage.clickContinue();
    }

    // Select shipping if available
    const shippingCount = await checkoutPage.getShippingOptionCount();
    if (shippingCount > 0) {
      await checkoutPage.selectShippingMethod(0);
      await checkoutPage.clickContinue();
    }

    // Select credit card payment method
    const paymentCount = await checkoutPage.getPaymentOptionCount();
    if (paymentCount > 0) {
      // Try to select credit card payment method
      await checkoutPage.selectPaymentMethod(0);
    }

    await test.step('Verify error handling after payment attempt', async () => {
      // Check consent
      await checkoutPage.consent_checkbox.check();

      // Set up response listener for the confirmation API
      let confirmationResponse: any;
      page.on('response', async (response) => {
        if (response.url().includes('/next/api/co/v3/state/order/confirmation/execute')) {
          confirmationResponse = response;
        }
      });

      const placeOrderVisible = await checkoutPage.isElementVisible(checkoutPage.placeOrderButton, 5000);
      if (placeOrderVisible) {
        await checkoutPage.clickPlaceOrder();
        await page.waitForTimeout(3000);

        // Verify the API returned 402 (declined)
        if (confirmationResponse) {
          expect(confirmationResponse.status()).toBe(402);
          const json = await confirmationResponse.json();
          expect(json.success).toBe(false);
          console.log('Payment declined response:', json);
        }

        // Verify the page still shows the checkout (not order confirmation)
        // The user should NOT land on a success page
        const currentUrl = page.url();
        expect(currentUrl).not.toContain('confirmation');
        expect(currentUrl).not.toContain('thank-you');
        console.log('Page URL after declined payment:', currentUrl);
      }
    });
  });  // ─── Cleanup ────────────────────────────────────────────────

  test.afterEach(async ({ page }) => {
    try {
      // Cleanup mocks
      await apiInterceptor.clearAllMocks();
      // remove all listners 
      page.removeAllListeners();
      // Clear cart
      const basket = new BasketPage(page);
      await basket.open();
      await basket.clearCart();
    } catch {
      // Best-effort cleanup
    }
  });
});
