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

    // Navigate to checkout page from basket page
    await basketPage.open();
    await basketPage.proceedToCheckout();

    // verify shipping address API was called in backend for address updation, with method PUT and status code 201
    let shippingApiResponse;
    page.on('response', async (response) => {
      if (response.url().includes(TestData.API_ENDPOINTS.SHIPPING_ADDRESS)) {
        shippingApiResponse = response;
      }
    });

    // verify state API is called that stores the state
    let stateResponse;
    page.on('response', async (response) => {
      if (response.url().includes(TestData.API_ENDPOINTS.STATE)) {
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
    expect(shippingApiResponse!.status()).toBe(TestData.STATUS_CODES.CREATED);
    expect(shippingApiResponse!.request().method()).toBe(TestData.HTTP_METHODS.PUT);
    const shippingJson = await shippingApiResponse!.json();
    expect(shippingJson).toBeDefined();

    // state api response verification
    expect(stateResponse).toBeDefined();
    expect(stateResponse!.status()).toBe(TestData.STATUS_CODES.OK);
    const stateJson = await stateResponse!.json();
    expect(stateJson).toBeDefined();

    // Select shipping if available
    const shippingCount = await checkoutPage.getShippingOptionCount();
    if (shippingCount > 0) {
      await checkoutPage.selectShippingMethod(TestData.DEFAULT_INDEX);
      await checkoutPage.clickContinue();
    }

    // Select payment method if available
    const paymentCount = await checkoutPage.getPaymentOptionCount();
    if (paymentCount > 0) {
      await checkoutPage.selectPaymentMethod(TestData.DEFAULT_INDEX);
    }

    // tick terms and conditions checkbox
    await checkoutPage.consent_checkbox.check();

    // Place order (mocked)
    const placeOrderVisible = await checkoutPage.isElementVisible(checkoutPage.placeOrderButton, TestData.TIMEOUTS.ELEMENT_VISIBLE);
    if (placeOrderVisible) {
      // verify state API is called in backend and has order current state details in it
      let payment_stateResponse;
      let confirmationResponse;
      page.on('response', async (response) => {
        if (response.url().includes(TestData.API_ENDPOINTS.STATE)) {
          payment_stateResponse = response;
        }
      });

      // verify order confirmation API called in backend
      page.on('response', async (response) => {
        if (response.url().includes(TestData.API_ENDPOINTS.CONFIRMATION)) {
          confirmationResponse = response;
        }
      });

      await checkoutPage.clickPlaceOrder();

      // Verify current state API response
      expect(payment_stateResponse).toBeDefined();
      expect(payment_stateResponse!.status()).toBe(TestData.STATUS_CODES.OK);
      const stateJsonResult = await payment_stateResponse!.json();
      expect(stateJsonResult).toBeDefined();

      // Verify order confirmation API response
      expect(confirmationResponse).toBeDefined();
      expect(confirmationResponse!.status()).toBe(TestData.STATUS_CODES.CREATED);
      expect(confirmationResponse!.request().method()).toBe(TestData.HTTP_METHODS.POST);
      const confirmationJson = await confirmationResponse!.json();
      expect(confirmationJson.status).toBe(TestData.ORDER_STATUS.CONFIRMED);
      expect(confirmationJson).toHaveProperty('orderId');
    }
  });

  test('Verify checkout process with declined payment @smoke @regression', async ({ page, pageWithProductsInCart, basketPage, checkoutPage }) => {
    // Mock declined payment response
    await apiInterceptor.mockPaymentDeclined();

    // Navigate to checkout page from basket page
    await basketPage.open();
    await basketPage.proceedToCheckout();

    // verify shipping address API was called in backend for address updation, with method PUT and status code 201
    let shippingApiResponse;
    page.on('response', async (response) => {
      if (response.url().includes(TestData.API_ENDPOINTS.SHIPPING_ADDRESS)) {
        shippingApiResponse = response;
      }
    });

    // verify state API is called that stores the state
    let stateResponse;
    page.on('response', async (response) => {
      if (response.url().includes(TestData.API_ENDPOINTS.STATE)) {
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
    expect(shippingApiResponse!.status()).toBe(TestData.STATUS_CODES.CREATED);
    expect(shippingApiResponse!.request().method()).toBe(TestData.HTTP_METHODS.PUT);
    const shippingJson = await shippingApiResponse!.json();
    console.log("Shipping Json", shippingJson);

    // state api response verification
    expect(stateResponse).toBeDefined();
    expect(stateResponse!.status()).toBe(TestData.STATUS_CODES.OK);
    const stateJson = await stateResponse!.json();
    console.log("State Json", stateJson);

    // Select shipping if available
    const shippingCount = await checkoutPage.getShippingOptionCount();
    if (shippingCount > 0) {
      await checkoutPage.selectShippingMethod(TestData.DEFAULT_INDEX);
      await checkoutPage.clickContinue();
    }

    // Select payment method if available
    const paymentCount = await checkoutPage.getPaymentOptionCount();
    if (paymentCount > 0) {
      await checkoutPage.selectPaymentMethod(TestData.DEFAULT_INDEX);
    }

    // tick terms and conditions checkbox
    await checkoutPage.consent_checkbox.check();

    // Place order (mocked)
    const placeOrderVisible = await checkoutPage.isElementVisible(checkoutPage.placeOrderButton, TestData.TIMEOUTS.ELEMENT_VISIBLE);
    if (placeOrderVisible) {
      // verify state API is called in backend and has order current state details in it
      let payment_stateResponse;
      let confirmationResponse;
      page.on('response', async (response) => {
        if (response.url().includes(TestData.API_ENDPOINTS.STATE)) {
          payment_stateResponse = response;
        }
      });

      // verify order confirmation API called in backend
      page.on('response', async (response) => {
        if (response.url().includes(TestData.API_ENDPOINTS.CONFIRMATION)) {
          confirmationResponse = response;
        }
      });

      await checkoutPage.clickPlaceOrder();

      // Verify current state API response
      expect(payment_stateResponse).toBeDefined();
      expect(payment_stateResponse!.status()).toBe(TestData.STATUS_CODES.OK);
      const stateJsonResult = await payment_stateResponse!.json();
      console.log("State Json", stateJsonResult);
      expect(stateJsonResult).toBeDefined();

      // Verify canceled order API response
      expect(confirmationResponse).toBeDefined();
      expect(confirmationResponse!.status()).toBe(TestData.STATUS_CODES.PAYMENT_REQUIRED);
      expect(confirmationResponse!.request().method()).toBe(TestData.HTTP_METHODS.POST);
      const confirmationJson = await confirmationResponse!.json();
      console.log("Confirmation Json", confirmationJson);
      expect(confirmationJson.success).toBe(false);
      expect(confirmationJson.error.code).toBe(TestData.ERROR_CODES.INVALID_PHONE_NUMBER);
    }
  });

  // ─── Cleanup ────────────────────────────────────────────────
  test.afterEach(async ({ page }) => {
    try {
      // Cleanup mocks
      await apiInterceptor.clearAllMocks();
      // remove all listeners 
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
