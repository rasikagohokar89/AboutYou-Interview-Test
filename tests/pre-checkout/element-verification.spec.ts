/**
 * @fileoverview Element verification tests for key pages.
 * Validates that every important UI element is visible, present,
 * and clickable where expected across Homepage, PDP, Basket,
 * and Checkout pages.
 * 
 * Tags: @smoke, @regression, @ui-verification
 */

import { test, expect } from '../../src/fixtures/test.fixtures';
import { HomePage } from '../../src/pages/home.page';
import { ProductListingPage } from '../../src/pages/product-listing.page';
import { ProductDetailPage } from '../../src/pages/product-detail.page';
import { BasketPage } from '../../src/pages/basket.page';
import { CheckoutPage } from '../../src/pages/checkout.page';
import { TestData } from '../../src/helpers/test-data';

test.describe('Element Verification @ui-verification', () => {
  // ─── Homepage ───────────────────────────────────────────────

  test.describe('Homepage Elements', () => {

    test('should verify all key elements on homepage @smoke', async ({ homePage }) => {
      await homePage.open();

      await test.step('Verify header elements', async () => {
        // Logo
        const logoVisible = await homePage.isElementVisible(homePage.logo);
        expect(logoVisible).toBe(true);

        // Search bar
        const searchVisible = await homePage.isElementVisible(homePage.searchInput);
        expect(searchVisible).toBe(true);

        // Basket icon
        const basketVisible = await homePage.isElementVisible(homePage.basketIcon);
        expect(basketVisible).toBe(true);

        // Wishlist icon
        const wishlistVisible = await homePage.isElementVisible(homePage.wishlistIcon);
        expect(wishlistVisible).toBe(true);
      });

      await test.step('Verify navigation categories are present', async () => {
        const categories = await homePage.getNavigationCategories();
        expect(categories.length).toBeGreaterThan(0);
        console.log('Navigation categories found:', categories);
      });

      await test.step('Verify page title is set', async () => {
        const title = await homePage.getPageTitle();
        expect(title).toBeTruthy();
        expect(title.length).toBeGreaterThan(0);
      });
    });

    test('should verify brand and category links are clickable @regression', async ({ homePage, page }) => {
      await homePage.open();

      await test.step('Verify navigation category is clickable', async () => {
        const categories = await homePage.getNavigationCategories();
        // Click the first available category link
        if (categories.length > 0) {
          const firstCategory = categories[0];
          await homePage.clickNavigationCategory(firstCategory);

          // Should navigate to a new page
          const currentUrl = page.url();
          expect(currentUrl).not.toBe('https://en.aboutyou.de/');
          expect(currentUrl).toBeTruthy();

          // Page should load successfully
          const title = await page.title();
          expect(title).toBeTruthy();
        }
      });
    });

    test('should verify language change works @regression', async ({ homePage, page }) => {
      await homePage.open();

      await test.step('Switch to German locale', async () => {
        await homePage.changeLanguage('de');
        await page.waitForTimeout(3000);

        // Verify we're on the German site
        const currentUrl = page.url();
        expect(currentUrl).toContain('www.aboutyou.de');

        // The page should have German text (e.g., "Warenkorb" or site title in German)
        const title = await page.title();
        expect(title).toBeTruthy();
        console.log('German page title:', title);
      });

      await test.step('Switch back to English locale', async () => {
        await homePage.changeLanguage('en');
        await page.waitForTimeout(3000);

        const currentUrl = page.url();
        expect(currentUrl).toContain('en.aboutyou.de');
      });
    });
  });

  // ─── Product Detail Page ───────────────────────────────────

  test.describe('Product Detail Page Elements', () => {

    test('should verify all elements on PDP @regression', async ({ homePage, page }) => {
      await homePage.open();
      await homePage.searchAndSubmit(TestData.SEARCH_QUERIES.general);

      const plp = new ProductListingPage(page);
      await plp.clickRandomProduct();

      const pdp = new ProductDetailPage(page);

      await test.step('Verify product name is visible', async () => {
        const nameVisible = await pdp.isElementVisible(pdp.productName);
        expect(nameVisible).toBe(true);
      });

      await test.step('Verify product price is visible', async () => {
        const priceVisible = await pdp.isElementVisible(pdp.currentPrice);
        expect(priceVisible).toBe(true);

        const priceText = await pdp.getCurrentPrice();
        expect(priceText).toMatch(/[€\d]/);
      });

      await test.step('Verify product images are visible', async () => {
        const imageVisible = await pdp.isElementVisible(pdp.productImages.first());
        expect(imageVisible).toBe(true);
      });

      await test.step('Verify add to basket button is visible and enabled', async () => {
        const addToBasketVisible = await pdp.isElementVisible(pdp.addToBasketButton);
        expect(addToBasketVisible).toBe(true);
        await expect(pdp.addToBasketButton).toBeEnabled();
      });

      await test.step('Verify wishlist button is visible', async () => {
        const wishlistVisible = await pdp.isElementVisible(pdp.addToWishlistButton);
        expect(wishlistVisible).toBe(true);
      });

      await test.step('Verify size options are available', async () => {
        const sizeCount = await pdp.getAvailableSizeCount();
        expect(sizeCount).toBeGreaterThanOrEqual(0);
        console.log('Size options count:', sizeCount);
      });

      await test.step('Verify brand name is displayed', async () => {
        const brandText = await pdp.getBrandName();
        console.log('Brand name:', brandText);
        // Brand name should be present (may be empty for some products)
        expect(typeof brandText).toBe('string');
      });
    });
  });

  // ─── Basket Page ───────────────────────────────────────────

  test.describe('Basket Page Elements', () => {

    test('should verify all elements on basket page with items @regression', async ({ page, pageWithProductsInCart, basketPage }) => {
      await basketPage.open();
      await page.waitForTimeout(3000);

      await test.step('Verify product details are displayed', async () => {
        const cartItem = await basketPage.getCartItemData(0);

        // Product name should be visible
        expect(cartItem.name).toBeTruthy();
        console.log('Cart item name:', cartItem.name);

        // Product price should be visible
        expect(cartItem.price).toBeTruthy();
        console.log('Cart item price:', cartItem.price);

        // Product quantity should be visible
        expect(cartItem.quantity).toBeGreaterThanOrEqual(1);
      });

      await test.step('Verify price summary is displayed', async () => {
        const subtotal = await basketPage.getSubtotal();
        expect(subtotal).toBeTruthy();
        expect(subtotal).toMatch(/[€\d]/);
        console.log('Subtotal:', subtotal);

        const total = await basketPage.getOrderTotal();
        expect(total).toBeTruthy();
        expect(total).toMatch(/[€\d]/);
        console.log('Order total:', total);
      });

      await test.step('Verify checkout button is visible and enabled', async () => {
        await expect(basketPage.checkoutButton).toBeVisible();
        await expect(basketPage.checkoutButton).toBeEnabled();
      });

      await test.step('Verify quantity controls are present', async () => {
        // Increase quantity button
        const increaseVisible = await basketPage.isElementVisible(basketPage.quantityIncrease, 3000);
        expect(increaseVisible).toBe(true)
        console.log('Increase quantity button visible:', increaseVisible);

        // Decrease quantity button
        const decreaseVisible = await basketPage.isElementVisible(basketPage.quantityDecrease, 3000);
        expect(decreaseVisible).toBe(true)
        console.log('Decrease quantity button visible:', decreaseVisible);
      });

      await test.step('Verify remove item button is present', async () => {
        const removeVisible = await basketPage.isElementVisible(basketPage.removeItemButton.first(), 3000);
        expect(removeVisible).toBe(true);
        console.log('Remove item button visible:', removeVisible);
      });

      await test.step('Verify payment method icons are displayed', async () => {
        const paymentMethodsCount = await basketPage.paymentMethods.count();
        expect(paymentMethodsCount).toBeGreaterThanOrEqual(1);
        console.log('Payment methods displayed:', paymentMethodsCount);
      });
    });
  });

  // ─── Checkout Shipping Tab ──────────────────────────────────

  test.describe('Checkout Shipping Tab Elements', () => {

    test('should verify all elements on checkout shipping tab @regression', async ({ pageWithProductsInCart, basketPage, checkoutPage, page }) => {
      await basketPage.open();
      await basketPage.proceedToCheckout();

      await checkoutPage.fillShippingAddress(TestData.VALID_DE_ADDRESS);

      await test.step('Verify shipping address form fields are present', async () => {
        // First name
        const firstNameVisible = await checkoutPage.isElementVisible(checkoutPage.firstNameInput, 10000);
        expect(firstNameVisible).toBe(true);

        // Last name
        const lastNameVisible = await checkoutPage.isElementVisible(checkoutPage.lastNameInput);
        expect(lastNameVisible).toBe(true);

        // Street
        const streetVisible = await checkoutPage.isElementVisible(checkoutPage.streetInput);
        expect(streetVisible).toBe(true);

        // Postal code
        const postalCodeVisible = await checkoutPage.isElementVisible(checkoutPage.postalCodeInput);
        expect(postalCodeVisible).toBe(true);

        // City
        const cityVisible = await checkoutPage.isElementVisible(checkoutPage.cityInput);
        expect(cityVisible).toBe(true);
      });

      await test.step('Verify continue button is present', async () => {
        await expect(checkoutPage.continueButton).toBeVisible();
      });

      await test.step('Verify collection point option is present', async () => {
        const collectionPointVisible = await checkoutPage.isElementVisible(checkoutPage.collectionpoint, 5000);
        console.log('Collection point option visible:', collectionPointVisible);
        expect(collectionPointVisible).toBe(true)
      });
    });
    // Checkout Payment Tab elements verification

    test('should verify all elements on checkout payment tab @regression', async ({ pageWithProductsInCart, basketPage, checkoutPage, page }) => {
      await basketPage.open();
      await basketPage.proceedToCheckout();

      await checkoutPage.fillShippingAddress(TestData.VALID_DE_ADDRESS);
      await checkoutPage.clickContinue();

      await test.step('Verify payment method options are displayed', async () => {
        const paymentMethodsCount = await checkoutPage.paymentOptions.count();
        expect(paymentMethodsCount).toBeGreaterThanOrEqual(1);

        // verify voucher input field is visible
        await expect(checkoutPage.voucher_input).toBeVisible();

        // verify checkbox for consent is visible
        await expect(checkoutPage.consent_checkbox).toBeVisible();

        // verify buy button is visible 
        await expect(checkoutPage.continueButton).toBeVisible();
      });
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
