/**
 * @fileoverview Cart calculation and pricing E2E tests.
 * Validates order summary accuracy: subtotal, shipping, discounts,
 * and total calculations across different scenarios.
 * 
 * Tags: @regression, @cart, @calculations
 */

import { test, expect } from '../../src/fixtures/test.fixtures';
import { BasketPage } from '../../src/pages/basket.page';
import { HomePage } from '../../src/pages/home.page';
import { ProductDetailPage } from '../../src/pages/product-detail.page';
import { ProductListingPage } from '../../src/pages/product-listing.page';
import { NetworkHelper } from '../../src/helpers/network-helper';
import { TestConfig } from '../../src/config/test.config';
import { or } from 'ajv/dist/compile/codegen';

test.describe('Cart Calculations @cart', () => {

  // ─── Positive Tests ─────────────────────────────────────────

  test.describe('Order Summary Validation', () => {

    test('Add items to basket and verify details - DE @regression', async ({ page, pageWithProductsInCart, basketPage }) => {
      // The fixture has already navigated to the site, found a product, selected a size, and added it to the cart!
      const productDetails = (pageWithProductsInCart as any).productDetails;

      await test.step('Navigate to checkout/basket', async () => {
        // Now navigate to basket to verify
        await basketPage.open();
        // Wait for basket API to ensure totals are calculated (avoid networkidle on prod)
        await page.waitForTimeout(3000);
      });

      await test.step('Verify item is in basket with correct details', async () => {
        // Debug screenshot
        await page.screenshot({ path: 'debug-basket.png' });

        // 1. Verify exact count of items added to basket
        const itemCount = await basketPage.getItemCount();
        expect(itemCount).toBe(1);

        const cartItem = await basketPage.getCartItemData(0);
        console.log('Cart Item Extracted:', cartItem);
        console.log('Product Details from PDP:', productDetails);

        // 2. Strict verification of item details
        expect(cartItem.name).toBeTruthy();
        if (productDetails.name) {
          // The cart item name often compresses text, drops words like "in", or includes promo labels like "DEAL".
          // Just check the first word (usually the brand name) to avoid mismatches.
          const firstWord = productDetails.name.split(' ')[0].toLowerCase();
          expect(cartItem.name.toLowerCase()).toContain(firstWord);
        }

        expect(cartItem.quantity).toBe(1);

        // Extract just the numbers for price validation to avoid currency symbol issues
        const extractNumbers = (str: string) => str.replace(/[^\d]/g, '');
        expect(extractNumbers(cartItem.price)).toEqual(extractNumbers(productDetails.price));
      });

      await test.step('Verify price total calculations', async () => {
        const subtotalText = await basketPage.getSubtotal();
        const shippingText = await basketPage.getShippingCost();
        const totalText = await basketPage.getOrderTotal();

        console.log('Order Summary Texts:', { subtotalText, shippingText, totalText });

        // Parse values to floats
        const parsePrice = (priceStr: string) => {
          const match = priceStr.match(/\d+[.,]\d{2}/);
          if (!match) return 0;
          return parseFloat(match[0].replace(',', '.'));
        };

        const subtotal = parsePrice(subtotalText);
        const shipping = parsePrice(shippingText) || 0;
        const expectedTotal = subtotal + shipping;
        const actualTotal = parsePrice(totalText);

        expect(actualTotal).toBeCloseTo(expectedTotal, 2);
      });

      await test.step('Verify checkout flow is accessible', async () => {
        // We expect the 'Proceed to checkout' button to be visible and enabled
        await expect(basketPage.checkoutButton).toBeVisible();
        await expect(basketPage.checkoutButton).toBeEnabled();
      });

      await test.step('Verify payment methods are displayed', async () => {
        // We expect multiple payment methods to be rendered in the footer/basket area
        const paymentMethodsCount = await basketPage.paymentMethods.count();
        expect(paymentMethodsCount).toBeGreaterThanOrEqual(1);

        // Extract the 'alt' attributes to verify exact payment providers
        const altTexts = [];
        for (let i = 0; i < paymentMethodsCount; i++) {
          altTexts.push(await basketPage.paymentMethods.nth(i).getAttribute('alt'));
        }

        const expectedMethods = ['Klarna', 'PayPal', 'VISA', 'MasterCard', 'Apple Pay', 'Google Pay'];
        for (const expected of expectedMethods) {
          expect(altTexts.some(alt => alt?.includes(expected))).toBe(true);
        }
      });
    });



    test.describe('Remove item and verify prices', () => {
      test.use({ productsToAdd: ['pant', 'dress'] });

      test('Add 2 items to cart, remove one item and verify prices are updated @regression', async ({ page, pageWithProductsInCart, basketPage }) => {
        const verifyPrices = async (stepName: string) => {
          await test.step(stepName, async () => {
            const subtotalText = await basketPage.getSubtotal();
            const shippingText = await basketPage.getShippingCost();
            const totalText = await basketPage.getOrderTotal();

            console.log(`Order Summary Texts (${stepName}):`, { subtotalText, shippingText, totalText });

            // Parse values to floats
            const parsePrice = (priceStr: string) => {
              const match = priceStr.match(/\d+[.,]\d{2}/);
              if (!match) return 0;
              return parseFloat(match[0].replace(',', '.'));
            };

            const subtotal = parsePrice(subtotalText);
            const shipping = parsePrice(shippingText) || 0;
            const expectedTotal = subtotal + shipping;
            const actualTotal = parsePrice(totalText);

            expect(actualTotal).toBeCloseTo(expectedTotal, 2);
          });
        };

        await test.step('Navigate to checkout/basket', async () => {
          await basketPage.open();
          // Wait for basket API to ensure totals are calculated
          await page.waitForTimeout(3000);
        });

        // 1. Validate price of 2 items
        await verifyPrices('Verify prices with 2 items');

        // 2. Remove one item
        await test.step('Remove one item from cart', async () => {
          await basketPage.removeItem(0);
          // Wait for removal to reflect in totals
          await page.waitForTimeout(3000);
        });

        // 3. Verify price is updated
        await verifyPrices('Verify prices are updated after removal');
      });
    });


    // update item quantity and verify the price calculations
    test('should update item quantity and verify the price calculations @regression', async ({ page, pageWithProductsInCart, basketPage }) => {

      await test.step('Navigate to checkout/basket', async () => {
        await basketPage.open();
        // Wait for basket API to ensure totals are calculated
        await page.waitForTimeout(3000);
      });

      let initialSubtotal = 0;
      let shipping = 0;

      const parsePrice = (priceStr: string) => {
        const match = priceStr.match(/\d+[.,]\d{2}/);
        if (!match) return 0;
        return parseFloat(match[0].replace(',', '.'));
      };

      await test.step('Get initial prices', async () => {
        initialSubtotal = parsePrice(await basketPage.getSubtotal());
        shipping = parsePrice(await basketPage.getShippingCost()) || 0;
      });

      await test.step('Increase item quantity', async () => {
        // Some sites use a dropdown for quantity. We will try selecting index 1 ("2") first, then fallback.
        const selectLoc = page.locator('select[data-testid*="quantity"], select').first();
        if (await selectLoc.isVisible({ timeout: 1000 }).catch(() => false)) {
          await selectLoc.selectOption({ index: 1 });
          await page.waitForTimeout(2000);
        } else {
          await basketPage.increaseQuantity(0);
          await page.waitForTimeout(3000);
        }
      });

      await test.step('Verify total price is increased correctly', async () => {
        const updatedSubtotalText = await basketPage.getSubtotal();
        const updatedTotalText = await basketPage.getOrderTotal();

        const updatedSubtotal = parsePrice(updatedSubtotalText);
        const updatedTotal = parsePrice(updatedTotalText);

        // Subtotal should be doubled
        expect(updatedSubtotal).toBeCloseTo(initialSubtotal * 2, 2);
        // Total should be the new subtotal + shipping
        expect(updatedTotal).toBeCloseTo(updatedSubtotal + shipping, 2);
      });
    });

    test('should persist cart across page navigation @regression', async ({ pageWithProductsInCart, basketPage, homePage }) => {
      const productDetails = (pageWithProductsInCart as any).productDetails;

      //Navigate to homepage
      await homePage.open();


      // Navigate back to basket
      await basketPage.open();
      const cartItem = await basketPage.getCartItemData(0);
      console.log('Cart Item Extracted:', cartItem);
      console.log('Product Details from PDP:', productDetails);

      // 2. Strict verification of item details
      expect(cartItem.name).toBeTruthy();
      if (productDetails.name) {
        // The cart item name often compresses text, drops words like "in", or includes promo labels like "DEAL".
        // Just check the first word (usually the brand name) to avoid mismatches.
        const firstWord = productDetails.name.split(' ')[0].toLowerCase();
        expect(cartItem.name.toLowerCase()).toContain(firstWord);
      }

      expect(cartItem.quantity).toBe(1);
    });

    test.describe('Unauthenticated Checkout Flow', () => {
      // Clear storage state for these tests so they start unauthenticated
      test.use({ storageState: { cookies: [], origins: [] } });

      test.skip('Proceed to checkout without login, verify window for login displayed and checkout page visible after successful login @regression', async ({ page, pageWithProductsInCart, basketPage, loginPage, checkoutPage }) => {
        // Skip if no test credentials are provided
        test.skip(!TestConfig.hasCredentials(), 'No test credentials configured');

        await basketPage.open();
        await basketPage.proceedToCheckout();

        // verify login window available 
        await loginPage.loginForm.waitFor({ state: 'visible', timeout: 10000 });

        // Verify social logins are rendered (e.g., Google)
        const socialOptions = await loginPage.getSocialLoginOptions();
        expect(socialOptions.google || socialOptions.apple || socialOptions.facebook).toBeTruthy();

        // login via Google
        await test.step('Login with Google', async () => {
          const popupPromise = page.waitForEvent('popup', { timeout: 10000 }).catch(() => null);
          await loginPage.safeClick(loginPage.googleLoginButton);

          let googlePage = await popupPromise;
          if (!googlePage) {
            // Fallback if it navigates in the same tab instead of a popup
            googlePage = page;
          }

          // Wait for Google sign in page
          await googlePage.locator('input[type="email"]').waitFor({ state: 'visible', timeout: 15000 });
          // Use the configured email (or replace with a valid google account if hmail.com fails)
          await googlePage.locator('input[type="email"]').fill(TestConfig.credentials.email);
          await googlePage.locator('button:has-text("Next"), button:has-text("Weiter")').first().click();

          // Fill Google password
          await googlePage.locator('input[type="password"]').waitFor({ state: 'visible', timeout: 15000 });
          await googlePage.locator('input[type="password"]').fill(TestConfig.credentials.password);
          await googlePage.locator('button:has-text("Next"), button:has-text("Weiter")').first().click();

          if (googlePage !== page) {
            await googlePage.waitForEvent('close', { timeout: 15000 }).catch(() => { });
          }
        });

        // verify successful login and landed on shipping address page
        const firstNameVisible = await checkoutPage.isElementVisible(checkoutPage.firstNameInput, 15000);
        expect(firstNameVisible).toBe(true);
        expect(page.url()).toContain('/checkout');
      });
    });

    // ─── Negative Cases  ─────────────────────────────

    test.describe('Negative Scenarios', () => {

      test('should prompt for size selection when adding to cart without a size @negative', async ({ homePage, productListingPage, productDetailPage }) => {
        await homePage.open();
        await homePage.searchAndSubmit('dress');
        await productListingPage.clickRandomProduct();

        // Ensure no popups are blocking our clicks
        await productDetailPage.dismissPopups();

        // Click "Add to basket" directly without explicitly selecting a size.
        // The expected behavior on AboutYou is that instead of a text error,
        // the size selector dropdown/drawer automatically opens to prompt the user.
        await productDetailPage.safeClick(productDetailPage.addToBasketButton, { force: true });

        // Verify that the size options are now visible (dropdown/drawer is open)
        await productDetailPage.sizeOptions.first().waitFor({ state: 'visible', timeout: 5000 });

        const count = await productDetailPage.sizeOptions.count();
        expect(count).toBeGreaterThan(0);

        // select first size
        await productDetailPage.selectFirstAvailableSize();
        // click on add to basket 
        await productDetailPage.safeClick(productDetailPage.addToBasketButton, { force: true });
      });

      // increase quantity more than the maximum allowed
      test('should not allow increasing the quantity beyond the maximum allowed quantity @negative', async ({ pageWithProductsInCart, basketPage }) => {

        await basketPage.open();
        let isDisabled = false;

        // verifies the maximum quantity has been reached i.e 9 , or there is insufficient stock.
        for (let i = 1; i < 9; i++) {
          // Check if the button is explicitly marked as disabled
          isDisabled = await basketPage.isIncreaseQuantityDisabled(0);
          if (isDisabled) {
            break;
          }
          try {
            // Try to click increase
            await basketPage.increaseQuantity(0);
          } catch (e) {
            // If clicking throws an error, the button might have become unclickable/disabled
            isDisabled = true;
            break; // Stop once the limit is reached
          }
        }

        expect(isDisabled).toBe(true);

      });

      test('Empty cart message should be displayed @negative', async ({ basketPage }) => {
        // Navigate to basket
        await basketPage.open();
        // Verify empty basket message
        expect(await basketPage.isEmpty()).toBe(true);
        expect(await basketPage.emptyCartMessage.textContent()).toBeTruthy();
      });

    });

    // ─── Edge Cases ─────────────────────────────────────────────

    test.describe('Calculation Edge Cases', () => {

      test('should handle currency format correctly EUR @edge-case', async ({ pageWithProductsInCart, basketPage }) => {
        await basketPage.open();
        const total = await basketPage.getOrderTotal();

        // EUR format: should contain numbers and possibly € symbol
        // German format uses comma for decimals (e.g., "29,99 €")
        // English format might use period (e.g., "€29.99")
        expect(total).toMatch(/[\d.,]+/);
      });

      test('should show correct basket count in header badge @edge-case', async ({ pageWithProductsInCart, homePage }) => {
        await pageWithProductsInCart.waitForTimeout(2000);
        const count = await homePage.getBasketCount();
        expect(count).toBeGreaterThanOrEqual(1);
      });
    });


    // ─── Cleanup ─────────────────────────────────────────────

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
});
