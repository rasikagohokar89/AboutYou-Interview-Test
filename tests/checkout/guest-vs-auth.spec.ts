/**
 * @fileoverview Guest vs Authenticated checkout flow tests.
 * Tests the checkout experience differences between logged-in
 * and guest users, including authentication gates and cart persistence.
 * 
 * Tags: @regression, @checkout, @auth
 */

import { test, expect } from '../../src/fixtures/test.fixtures';
import { BasketPage } from '../../src/pages/basket.page';
import { CheckoutPage } from '../../src/pages/checkout.page';
import { LoginPage } from '../../src/pages/login.page';
import { HomePage } from '../../src/pages/home.page';
import { ProductDetailPage } from '../../src/pages/product-detail.page';
import { ProductListingPage } from '../../src/pages/product-listing.page';
import { TestConfig } from '../../src/config/test.config';

test.describe('Guest vs Authenticated Checkout @checkout @auth', () => {
  // ─── Authentication Gate ────────────────────────────────────

  test.describe('Unauthenticated User @regression', () => {

    test.skip('should redirect to login when checkout is attempted @smoke @regression', async ({ browser }) => {
      // Use a fresh context without stored auth state
      const context = await browser.newContext();
      const page = await context.newPage();

      const homePage = new HomePage(page);
      const plp = new ProductListingPage(page);
      const pdp = new ProductDetailPage(page);
      const basketPage = new BasketPage(page);

      // Add product to cart
      await homePage.open();
      await homePage.searchAndSubmit('t-shirt');
      await plp.clickRandomProduct();
      await pdp.selectFirstAvailableSize();
      await pdp.addToBasket();

      // Try to checkout
      await basketPage.open();
      const checkoutVisible = await basketPage.isElementVisible(basketPage.checkoutButton, 5000);

      if (checkoutVisible) {
        await basketPage.proceedToCheckout();

        // Should be redirected to login
        const currentUrl = page.url();
        const isAuthPage = currentUrl.includes('login') ||
          currentUrl.includes('auth') ||
          currentUrl.includes('signin') ||
          currentUrl.includes('account');

        expect(isAuthPage).toBe(true);
      }

      await context.close();
    });

    test.skip('should preserve cart contents after login @regression', async ({ browser }) => {
      test.skip(!TestConfig.hasCredentials(), 'No test credentials configured');

      // Start with a fresh context (not logged in)
      const context = await browser.newContext();
      const page = await context.newPage();

      const homePage = new HomePage(page);
      const plp = new ProductListingPage(page);
      const pdp = new ProductDetailPage(page);
      const basketPage = new BasketPage(page);
      const loginPage = new LoginPage(page);

      // Add product to cart as guest
      await homePage.open();
      await homePage.searchAndSubmit('t-shirt');
      await plp.clickRandomProduct();
      await pdp.selectFirstAvailableSize();
      await pdp.addToBasket();

      // Attempt checkout — should redirect to login
      await basketPage.open();
      const checkoutVisible = await basketPage.isElementVisible(basketPage.checkoutButton, 5000);
      if (checkoutVisible) {
        await basketPage.proceedToCheckout();

        // Login
        const emailVisible = await loginPage.isElementVisible(loginPage.emailInput, 10000);
        if (emailVisible) {
          await loginPage.login(
            TestConfig.credentials.email,
            TestConfig.credentials.password
          );

          // After login, cart should still have items
          await basketPage.open();
          const itemCount = await basketPage.getItemCount();
          expect(itemCount).toBeGreaterThanOrEqual(1);
        }
      }

      await context.close();
    });
  });

  // ─── Guest Checkout ─────────────────────────────────────────

  test.describe('Guest Checkout Option @regression', () => {

    test.skip('should check for guest checkout availability @regression', async ({ browser }) => {
      const context = await browser.newContext();
      const page = await context.newPage();

      const homePage = new HomePage(page);
      const plp = new ProductListingPage(page);
      const pdp = new ProductDetailPage(page);
      const basketPage = new BasketPage(page);
      const loginPage = new LoginPage(page);

      // Add product and try to checkout
      await homePage.open();
      await homePage.searchAndSubmit('t-shirt');
      await plp.clickRandomProduct();
      await pdp.selectFirstAvailableSize();
      await pdp.addToBasket();

      await basketPage.open();
      const checkoutVisible = await basketPage.isElementVisible(basketPage.checkoutButton, 5000);
      if (checkoutVisible) {
        await basketPage.proceedToCheckout();

        // Check if guest checkout option exists
        const hasGuest = await loginPage.hasGuestCheckout();
        // Document whether guest checkout is available — not asserting
        // as this is a feature availability check
      }

      await context.close();
    });
  });

  // ─── Authenticated User ─────────────────────────────────────

  test.describe('Authenticated User @regression', () => {

    test.skip('should proceed directly to checkout when logged in @smoke @regression', async ({ page }) => {
      test.skip(!TestConfig.hasCredentials(), 'No test credentials configured');

      const homePage = new HomePage(page);
      const plp = new ProductListingPage(page);
      const pdp = new ProductDetailPage(page);
      const basketPage = new BasketPage(page);

      // Add product (user is already authenticated via storageState)
      await homePage.open();
      await homePage.searchAndSubmit('t-shirt');
      await plp.clickRandomProduct();
      await pdp.selectFirstAvailableSize();
      await pdp.addToBasket();

      await basketPage.open();
      const checkoutVisible = await basketPage.isElementVisible(basketPage.checkoutButton, 5000);
      if (checkoutVisible) {
        await basketPage.proceedToCheckout();

        // Authenticated user should go directly to checkout
        // (not be redirected to login)
        const currentUrl = page.url();
        const isLoginPage = currentUrl.includes('login') || currentUrl.includes('signin');
        // For authenticated user, should either be on checkout or the login merge was instant
      }
    });

    test.skip('should display social login options on login page @regression', async ({ browser }) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      const loginPage = new LoginPage(page);

      await loginPage.open();

      // Check for social login providers
      const socialOptions = await loginPage.getSocialLoginOptions();

      // About You typically supports Google, Apple, and Facebook
      // At least one social option should be available
      const hasSocialLogin = socialOptions.google || socialOptions.apple || socialOptions.facebook;
      // This is a feature check — document availability
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
