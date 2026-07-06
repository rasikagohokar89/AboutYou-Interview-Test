/**
 * @fileoverview API interceptor utilities for mocking checkout-related API calls.
 * Uses Playwright's page.route() to intercept and mock payment gateway responses,
 * cart modifications, and checkout API endpoints.
 * 
 * This enables testing payment flows (success, decline, timeout, 3DS)
 * without making real transactions on the production storefront.
 */

import { type Page, type Route } from '@playwright/test';
import { type PaymentResult, type OrderConfirmation, PaymentErrorType, OrderStatus } from '../types/checkout.types';

/**
 * API Interceptor class providing reusable mock utilities.
 * Encapsulates all route interception logic for clean test code.
 */
export class ApiInterceptor {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // ─── Payment Mocks ──────────────────────────────────────────

  /**
   * Mocks a successful payment response.
   * Simulates a payment gateway returning a success status.
   */
  async mockPaymentSuccess(): Promise<void> {
    await this.page.route('**/api/co/v3/state/order/confirmation/execute**', async (route: Route) => {
      const response: PaymentResult = {
        success: true,
        transactionId: `TXN-${Date.now()}`,
      };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response),
      });
    });
  }

  /**
   * Mocks a declined payment response.
   * Simulates a card being declined by the payment gateway.
   */
  async mockPaymentDeclined(): Promise<void> {
    await this.page.route('**/api/co/v3/state/order/confirmation/execute**', async (route: Route) => {
      const response: PaymentResult = {
        success: false,
        error: {
          code: 'INVALID_PHONE_NUMBER',
          message: 'Invalid phone number',
          type: PaymentErrorType.DECLINED,
        },
      };
      await route.fulfill({
        status: 402,
        contentType: 'application/json',
        body: JSON.stringify(response),
      });
    });
  }

  /**
   * Mocks a payment gateway timeout.
   * Simulates the payment provider not responding in time.
   */
  async mockPaymentTimeout(): Promise<void> {
    await this.page.route('**/api/co/v3/state/order/confirmation/execute**', async (route: Route) => {
      // Delay for 30 seconds to simulate timeout
      await new Promise(resolve => setTimeout(resolve, 30000));
      await route.fulfill({
        status: 413,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'PAYMENT_TIMEOUT',
          message: 'Payment gateway timeout. Please try again.',
        }),
      });
    });
  }

  /**
   * Mocks a 3D Secure challenge redirect.
   * Simulates the payment requiring additional authentication.
   */
  async mockPayment3DSChallenge(): Promise<void> {
    await this.page.route('**/api/co/v3/state/order/confirmation/execute**', async (route: Route) => {
      const response: PaymentResult = {
        success: false,
        requiresAction: true,
        actionUrl: 'https://3ds.example.com/challenge',
        error: {
          code: '3DS_REQUIRED',
          message: 'Additional authentication required.',
          type: PaymentErrorType.THREE_DS_REQUIRED,
        },
      };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response),
      });
    });
  }

  /**
   * Mocks a network error during payment processing.
   * Simulates complete connection failure.
   */
  async mockPaymentNetworkError(): Promise<void> {
    await this.page.route('**/api/co/v3/state/order/confirmation/execute**', async (route: Route) => {
      await route.abort('connectionfailed');
    });
  }

  /**
   * Mocks an insufficient funds response.
   */
  async mockPaymentInsufficientFunds(): Promise<void> {
    await this.page.route('**/api/co/v3/state/order/confirmation/execute**', async (route: Route) => {
      const response: PaymentResult = {
        success: false,
        error: {
          code: 'INSUFFICIENT_FUNDS',
          message: 'Insufficient funds. Please check your account balance.',
          type: PaymentErrorType.INSUFFICIENT_FUNDS,
        },
      };
      await route.fulfill({
        status: 402,
        contentType: 'application/json',
        body: JSON.stringify(response),
      });
    });
  }

  // ─── Order Confirmation Mocks ───────────────────────────────

  /**
   * Mocks a successful order confirmation response.
   */
  async mockOrderConfirmation(): Promise<string> {
    const orderId = `ORD-${Date.now()}`;
    await this.page.route('**/api/co/v3/state/order/confirmation/execute**', async (route: Route) => {
      const response: OrderConfirmation = {
        orderId: orderId,
        status: OrderStatus.CONFIRMED,
        total: 4999,
        currency: 'EUR',
        estimatedDelivery: '3-5 business days',
      };
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(response),
      });
    });
    return orderId;
  }

  // ─── Cart/Stock Mocks ──────────────────────────────────────

  /**
   * Mocks an item going out of stock during checkout.
   * Intercepts cart validation endpoints to return stock error.
   */
  async mockOutOfStockDuringCheckout(): Promise<void> {
    await this.page.route('**/api/cart/validate**', async (route: Route) => {
      await route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'ITEM_OUT_OF_STOCK',
          message: 'One or more items in your cart are no longer available.',
          unavailableItems: [{ variantId: 12345, reason: 'out_of_stock' }],
        }),
      });
    });
  }

  /**
   * Mocks a price change for items in the cart.
   * Simulates price increasing between cart and checkout.
   */
  async mockPriceChangeInCart(): Promise<void> {
    await this.page.route('**/api/cart/validate**', async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          priceChanged: true,
          message: 'Prices have been updated since you added items to your cart.',
          updatedItems: [{ variantId: 12345, oldPrice: 2999, newPrice: 3499 }],
        }),
      });
    });
  }

  // ─── Shipping Mocks ─────────────────────────────────────────

  /**
   * Mocks available shipping options response.
   */
  async mockShippingOptions(): Promise<void> {
    await this.page.route('**/api/checkout/shipping**', async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          methods: [
            { id: 'standard', name: 'Standard Shipping', price: 499, estimatedDelivery: '3-5 days', currency: 'EUR' },
            { id: 'express', name: 'Express Shipping', price: 999, estimatedDelivery: '1-2 days', currency: 'EUR' },
            { id: 'free', name: 'Free Shipping', price: 0, estimatedDelivery: '5-7 days', currency: 'EUR' },
          ],
        }),
      });
    });
  }

  // ─── Utility Methods ────────────────────────────────────────

  /**
   * Clears all active route interceptors.
   * Call this in afterEach to reset mocks between tests.
   */
  async clearAllMocks(): Promise<void> {
    await this.page.unrouteAll({ behavior: 'ignoreErrors' });
  }

  /**
   * Intercepts a specific API pattern and returns the request data.
   * Used for validating that the frontend sends correct payloads.
   * 
   * @param urlPattern - URL pattern to intercept
   * @returns Promise that resolves with the intercepted request body
   */
  async captureRequest(urlPattern: string): Promise<unknown> {
    return new Promise((resolve) => {
      this.page.route(urlPattern, async (route: Route) => {
        const request = route.request();
        const body = request.postDataJSON();
        resolve(body);
        // Continue the request (don't block it)
        await route.continue();
      });
    });
  }
}
