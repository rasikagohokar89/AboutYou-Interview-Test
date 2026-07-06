/**
 * @fileoverview Checkout page object — the most critical page for this test suite.
 * Handles the multi-step checkout flow: address entry, shipping selection,
 * payment method choice, order review, and confirmation.
 * 
 * Supports both real UI interactions and works with mocked API responses
 * for payment processing (since we can't complete real payments on production).
 */

import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';
import type { Address, CreditCardDetails } from '../types/checkout.types';

export class CheckoutPage extends BasePage {
  // ─── Step Indicators ─────────────────────────────────────────

  /** Step progress indicator container */
  readonly stepIndicator: Locator;

  /** Currently active step */
  readonly activeStep: Locator;

  // ─── Address Form ────────────────────────────────────────────

  /** First name input */
  readonly firstNameInput: Locator;

  /** Last name input */
  readonly lastNameInput: Locator;

  /** Street/address line input */
  readonly streetInput: Locator;

  /** House number input */
  readonly houseNumberInput: Locator;

  /** Additional address info input */
  readonly additionalInfoInput: Locator;

  /** Postal code / ZIP input */
  readonly postalCodeInput: Locator;

  /** City input */
  readonly cityInput: Locator;

  /** Country selector */
  readonly countrySelect: Locator;

  /** Email input */
  readonly emailInput: Locator;

  /** Phone number input */
  readonly phoneInput: Locator;

  /** "Use as billing address" checkbox */
  readonly sameAsBillingCheckbox: Locator;

  /** Form validation error messages */
  readonly validationErrors: Locator;

  /** Specific field error message */
  readonly fieldErrors: Locator;

  // ─── Shipping ────────────────────────────────────────────────

  /** Shipping method options */
  readonly shippingOptions: Locator;

  /** Selected shipping method */
  readonly selectedShipping: Locator;

  /** Shipping price display */
  readonly shippingPrice: Locator;

  /** Estimated delivery display */
  readonly estimatedDelivery: Locator;

  // ─── Payment ─────────────────────────────────────────────────

  /** Payment method options */
  readonly paymentOptions: Locator;

  /** Credit card number input */
  readonly cardNumberInput: Locator;

  /** Card expiry input */
  readonly cardExpiryInput: Locator;

  /** Card CVV input */
  readonly cardCvvInput: Locator;

  /** Cardholder name input */
  readonly cardholderInput: Locator;

  /** PayPal payment option */
  readonly paypalOption: Locator;

  /** Klarna payment option */
  readonly klarnaOption: Locator;

  /** Payment error message */
  readonly paymentError: Locator;

  // ─── Order Review ────────────────────────────────────────────

  /** Order summary on review step */
  readonly orderSummary: Locator;

  /** Review items list */
  readonly reviewItems: Locator;

  /** Review total */
  readonly reviewTotal: Locator;

  /** Terms and conditions checkbox */
  readonly termsCheckbox: Locator;

  // ─── CTAs ────────────────────────────────────────────────────

  /** Continue/Next step button */
  readonly continueButton: Locator;

  /** Back/Previous step button */
  readonly backButton: Locator;

  /** Place order / Confirm purchase button */
  readonly placeOrderButton: Locator;

  // ─── Confirmation ────────────────────────────────────────────

  /** Order confirmation page container */
  readonly confirmationPage: Locator;

  /** Order number display */
  readonly orderNumber: Locator;

  /** Confirmation success message */
  readonly confirmationMessage: Locator;

  // ─── Error States ────────────────────────────────────────────

  /** Generic checkout error message */
  readonly checkoutError: Locator;

  /** Session expired message */
  readonly sessionExpiredMessage: Locator;

  /** Item unavailable during checkout */
  readonly itemUnavailableMessage: Locator;
  readonly collectionpoint: Locator;
  readonly voucher_input: Locator;
  readonly voucher_add_button: Locator;
  consent_checkbox: Locator;
  aboutyou_checkbox: Locator;

  // ─── Collection Point ──────────────────────────────────────

  /** List of available collection points */
  readonly collectionPointList: Locator;

  /** Individual collection point items */
  readonly collectionPointItems: Locator;

  // ─── Address Book ──────────────────────────────────────────

  /** Saved address entries in address book */
  readonly addressBookEntries: Locator;

  /** Add new address button */
  readonly addNewAddressButton: Locator;

  /** Edit address button */
  readonly editAddressButton: Locator;
  collection_address: any;
  dhl_shipping_option: Locator;
  hermes_shipping_option: Locator;
  voucher_error: Locator;

  constructor(page: Page) {
    super(page);

    // Step indicators
    this.stepIndicator = page.locator('div, nav').filter({ hasText: /Payment|Shipping|Address/i }).first();
    this.activeStep = page.locator('[aria-current="step"], [aria-current="page"]').first();

    // Address form fields (Using standard semantic locators)
    this.firstNameInput = page.getByRole('textbox', { name: /First name/i }).first();
    this.lastNameInput = page.getByRole('textbox', { name: /Last name/i }).first();
    this.streetInput = page.getByRole('textbox', { name: /Street/i }).first();
    this.houseNumberInput = page.getByRole('textbox', { name: /House number/i }).first();
    this.additionalInfoInput = page.getByRole('textbox', { name: /Additional/i }).first();
    this.postalCodeInput = page.getByRole('textbox', { name: /Postal code|Zip/i }).first();
    this.cityInput = page.getByRole('textbox', { name: /City/i }).first();
    this.countrySelect = page.getByRole('combobox', { name: /Country/i }).first();
    this.emailInput = page.getByRole('textbox', { name: /Email/i }).first();
    this.phoneInput = page.getByRole('textbox', { name: /Phone/i }).first();
    this.sameAsBillingCheckbox = page.getByRole('checkbox', { name: /Use as billing address/i }).first();

    // Validation
    this.validationErrors = page.getByRole('alert');
    this.fieldErrors = page.locator('span, div').filter({ hasText: /invalid|required/i });

    // Shipping
    this.shippingOptions = page.getByRole('radio', { name: /Shipping/i });
    this.selectedShipping = page.getByRole('radio', { name: /Shipping/i, checked: true }).first();
    this.shippingPrice = page.locator('div').filter({ hasText: /^Shipping/i }).getByText(/€/).first();
    this.estimatedDelivery = page.getByText(/Delivery in/i).first();
    this.collectionpoint = page.getByText(/Collection Point/i).first();
    this.dhl_shipping_option = page.locator('div').filter({ hasText: /Standard Delivery/i }).nth(0);
    this.hermes_shipping_option = page.locator('div').filter({ hasText: /Standard Delivery/i }).nth(1);

    // Payment methods 
    this.paymentOptions = page.getByRole('radio', { name: /Credit card|PayPal|Klarna/i });
    this.cardNumberInput = page.getByRole('textbox', { name: /Card number/i }).first();
    this.cardExpiryInput = page.getByRole('textbox', { name: /Expiry date|MM\/YY/i }).first();
    this.cardCvvInput = page.getByRole('textbox', { name: /CVV|CVC/i }).first();
    this.cardholderInput = page.getByRole('textbox', { name: /Cardholder/i }).first();
    this.paypalOption = page.getByRole('radio', { name: /PayPal/i }).first();
    this.klarnaOption = page.getByRole('radio', { name: /Klarna/i }).first();
    this.paymentError = page.locator('div').filter({ hasText: /payment error|declined/i }).first();


    //voucher
    this.voucher_input = page.locator('[data-test-id="voucher-code"]')
    this.voucher_add_button = page.locator('[data-test-id="voucher-add-btn"]')
    this.voucher_error = page.getByRole('alert', { name: /Unfortunately, this voucher code does not exist./i }).first()

    // Order review
    this.orderSummary = page.locator('div').filter({ hasText: /Order summary/i }).first();
    this.reviewItems = page.getByRole('listitem');
    this.reviewTotal = page.getByTestId('basket-total').getByText(/€/).first();
    this.termsCheckbox = page.getByRole('checkbox', { name: /Terms and conditions/i }).first();

    // Action buttons
    this.continueButton = page.getByRole('button', { name: /Continue|Next/i }).first();
    this.backButton = page.getByRole('button', { name: /Back/i }).first();
    this.placeOrderButton = page.getByRole('button', { name: /Place order|Buy now/i }).first();

    // Confirmation
    this.confirmationPage = page.locator('div').filter({ hasText: /Order confirmed/i }).first();
    this.orderNumber = page.getByText(/Order number:/i).first();
    this.confirmationMessage = page.getByText(/Thank you for your order/i).first();

    // Error states
    this.checkoutError = page.getByRole('alert').first();
    this.sessionExpiredMessage = page.locator('[data-testid="session-expired"], [class*="session-expired"]').first();
    this.itemUnavailableMessage = page.locator('[data-testid="item-unavailable"], [class*="item-unavailable"], [class*="out-of-stock"]').first();

    //consent check box
    this.consent_checkbox = page.locator('[data-test-id="paymentBelowMobileBasket-carrierConsent"]')
    this.aboutyou_checkbox = page.locator('[data-test-id="paymentBelowMobileBasket-newsletterSignUp"]')

    // Collection points
    this.collectionPointList = page.locator('div, ul').filter({ hasText: /Collection point|Paketshop|Pick up/i }).first();
    this.collectionPointItems = page.getByRole('radio', { name: /Collection|Pickup|Paketshop/i });
    this.collection_address = page.getByTestId('[data-test-id="shipping-collection-point-address"]')

    // Address book
    this.addressBookEntries = page.locator('[data-test-id*="address"], [data-testid*="address"]').filter({ has: page.locator('span, p') });
    this.addNewAddressButton = page.getByRole('button', { name: /Add new address|Neue Adresse/i }).first();
    this.editAddressButton = page.getByRole('button', { name: /Edit|Bearbeiten/i }).first();
  }

  // ─── Address Form Actions ────────────────────────────────────

  /**
   * Fills the complete shipping address form.
   * 
   * @param address - The address data to fill
   */
  async fillShippingAddress(address: Address): Promise<void> {
    // If the user is already logged in and has a saved address, 
    // the checkout might skip directly to the Payment tab.
    // convert 
    if (!(await this.isElementVisible(this.firstNameInput, 3000))) {
      // Try to click 'Edit', 'Change', or the 'Address' step indicator
      const editBtn = this.page.getByRole('button', { name: /Change|Edit|Ändern|Bearbeiten/i }).first();
      if (await editBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await editBtn.click();
      } else {
        const addressTab = this.page.locator('div, span, button, a, li').filter({ hasText: /Shipping|Delivery|Lieferung|Address|Adresse/i }).first();
        if (await addressTab.isVisible({ timeout: 5000 }).catch(() => false)) {
          await addressTab.click();
          await this.page.waitForTimeout(1500);
        }
      }

      // Wait a moment for the form to appear
      await this.firstNameInput.waitFor({ state: 'visible', timeout: 5000 }).catch(() => { });
    }

    await this.safeFill(this.firstNameInput, address.firstName);
    await this.safeFill(this.lastNameInput, address.lastName);

    // Handle street autocomplete dropdown
    // We clear the field and type slowly to trigger the suggestions
    const fullStreet = `${address.street} ${address.houseNumber}`;
    await this.streetInput.clear();
    await this.streetInput.pressSequentially(fullStreet, { delay: 100 });

    // Wait for the dropdown menu to populate, then select the first option
    await this.page.waitForTimeout(1500);
    await this.streetInput.press('ArrowDown');
    await this.page.waitForTimeout(500);
    await this.streetInput.press('Enter');
    await this.page.waitForTimeout(1000); // Wait for form to auto-fill other fields



    // Postal code and city might be auto-filled by the dropdown. 
    // We fill them just in case they are missing or incorrect.
    await this.safeFill(this.postalCodeInput, address.postalCode);
    await this.safeFill(this.cityInput, address.city);

    // Optional fields
    if (address.email && await this.isElementVisible(this.emailInput, 2000)) {
      await this.safeFill(this.emailInput, address.email);
    }

    if (address.phone && await this.isElementVisible(this.phoneInput, 2000)) {
      await this.safeFill(this.phoneInput, address.phone);
    }

    if (address.additionalInfo && await this.isElementVisible(this.additionalInfoInput, 2000)) {
      await this.safeFill(this.additionalInfoInput, address.additionalInfo);
    }
  }

  async provide_collection_point(provide_address: boolean = false, address_text: string = "") {
    // Since the checkout might skip directly to the Payment tab, 
    // we must navigate back to the Shipping tab to find the collectionpoint radio button.
    if (!(await this.isElementVisible(this.firstNameInput, 3000))) {
      // Try to click 'Edit', 'Change', or the 'Address' step indicator
      const editBtn = this.page.getByRole('button', { name: /Change|Edit|Ändern|Bearbeiten/i }).first();
      if (await editBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await editBtn.click();
      } else {
        const addressTab = this.page.locator('div, span, button, a, li').filter({ hasText: /Shipping|Delivery|Lieferung|Address|Adresse/i }).first();
        if (await addressTab.isVisible({ timeout: 5000 }).catch(() => false)) {
          await addressTab.click();
          await this.page.waitForTimeout(1500);
        }
      }

      // Wait a moment for the form to appear
      await this.firstNameInput.waitFor({ state: 'visible', timeout: 5000 }).catch(() => { });
    }

    // Wait for the tab transition
    await this.page.waitForTimeout(1500);
    await this.page.reload()
    await this.page.waitForLoadState("networkidle")

    // Now use the requested collection point locator

    await this.collectionpoint.waitFor({ state: 'visible', timeout: 5000 });
    await this.collectionpoint.click({ force: true });

    if (provide_address) {
      await this.collection_address.pressSequentially(address_text, { delay: 100 });

      // Wait for the dropdown menu to populate, then select the first option
      await this.page.waitForTimeout(1500);
      await this.collection_address.press('ArrowDown');
      await this.page.waitForTimeout(500);
      await this.collection_address.press('Enter');
      await this.page.waitForTimeout(1000); // Wait for form to auto-fill other fields
    }

  }
  /**
   * Fills the credit card payment form.
   * Note: This works with mocked responses — no real card data is used.
   * 
   * @param card - The card details to fill
   */
  async fillCreditCardDetails(card: CreditCardDetails): Promise<void> {
    if (await this.isElementVisible(this.cardNumberInput, 3000)) {
      await this.safeFill(this.cardNumberInput, card.cardNumber);
    }
    if (await this.isElementVisible(this.cardExpiryInput, 2000)) {
      await this.safeFill(this.cardExpiryInput, `${card.expiryMonth}/${card.expiryYear}`);
    }
    if (await this.isElementVisible(this.cardCvvInput, 2000)) {
      await this.safeFill(this.cardCvvInput, card.cvv);
    }
    if (await this.isElementVisible(this.cardholderInput, 2000)) {
      await this.safeFill(this.cardholderInput, card.cardholderName);
    }
  }

  // ─── Navigation Actions ──────────────────────────────────────

  /**
   * Clicks the "Continue" button to proceed to the next checkout step.
   */
  async clickContinue(): Promise<void> {
    await this.safeClick(this.continueButton);
    await this.page.waitForTimeout(2000);
  }

  /**
   * Clicks the "Back" button to return to the previous step.
   */
  async clickBack(): Promise<void> {
    await this.safeClick(this.backButton);
    await this.page.waitForTimeout(1000);
  }

  /**
   * Clicks the "Place Order" button to submit the order.
   * Used with mocked payment API responses.
   */
  async clickPlaceOrder(): Promise<void> {
    await this.safeClick(this.placeOrderButton);
    await this.page.waitForTimeout(3000);
  }

  // ─── Shipping Selection ──────────────────────────────────────

  /**
   * Selects a shipping method by index.
   * 
   * @param index - Zero-based index of the shipping option
   */
  async selectShippingMethod(index: number): Promise<void> {
    await this.safeClick(this.shippingOptions.nth(index));
    await this.page.waitForTimeout(1000);
  }

  /**
   * Returns the number of available shipping options.
   */
  async getShippingOptionCount(): Promise<number> {
    return this.shippingOptions.count();
  }

  // ─── Payment Selection ───────────────────────────────────────

  /**
   * Selects a payment method by index.
   * 
   * @param index - Zero-based index of the payment option
   */
  async selectPaymentMethod(index: number): Promise<void> {
    await this.safeClick(this.paymentOptions.nth(index));
    await this.page.waitForTimeout(1000);
  }

  /**
   * Returns the number of available payment options.
   */
  async getPaymentOptionCount(): Promise<number> {
    return this.paymentOptions.count();
  }

  /**
   * Selects PayPal as the payment method.
   */
  async selectPayPal(): Promise<void> {
    await this.safeClick(this.paypalOption);
    await this.page.waitForTimeout(1000);
  }

  /**
   * Selects Klarna as the payment method.
   */
  async selectKlarna(): Promise<void> {
    await this.safeClick(this.klarnaOption);
    await this.page.waitForTimeout(1000);
  }

  // ─── Validation & State Checks ───────────────────────────────

  /**
   * Returns all visible validation error messages.
   */
  async getValidationErrors(): Promise<string[]> {
    const errors = await this.validationErrors.allTextContents();
    return errors.map(e => e.trim()).filter(e => e.length > 0);
  }

  /**
   * Checks if there are any validation errors displayed.
   */
  async hasValidationErrors(): Promise<boolean> {
    return (await this.getValidationErrors()).length > 0;
  }

  /**
   * Checks if the payment error message is visible.
   */
  async hasPaymentError(): Promise<boolean> {
    return this.isElementVisible(this.paymentError, 5000);
  }

  /**
   * Gets the payment error message text.
   */
  async getPaymentErrorMessage(): Promise<string> {
    return this.getTextContent(this.paymentError);
  }

  /**
   * Checks if the order confirmation page is displayed.
   */
  async isOrderConfirmed(): Promise<boolean> {
    return this.isElementVisible(this.confirmationPage, 10000);
  }

  /**
   * Gets the order number from the confirmation page.
   */
  async getOrderNumber(): Promise<string> {
    return this.getTextContent(this.orderNumber);
  }

  /**
   * Checks if an item is flagged as unavailable during checkout.
   */
  async isItemUnavailable(): Promise<boolean> {
    return this.isElementVisible(this.itemUnavailableMessage, 5000);
  }

  /**
   * Checks if the session has expired.
   */
  async isSessionExpired(): Promise<boolean> {
    return this.isElementVisible(this.sessionExpiredMessage, 5000);
  }

  /**
   * Submits the address form and advances to the next step.
   * Wrapper for the full address entry flow.
   * 
   * @param address - The address to fill
   */
  async submitAddress(address: Address): Promise<void> {
    await this.fillShippingAddress(address);
    await this.clickContinue();
  }

  async addVoucherCode(code: string) {
    await this.safeFill(this.voucher_input, code)
    await this.safeClick(this.voucher_add_button)
    await expect(this.voucher_input).toHaveValue(code)

  }

  // ─── Collection Point Methods ────────────────────────────────

  /**
   * Selects a collection point by its display name.
   * 
   * @param name - The name of the collection point to select
   */
  async selectCollectionPointByName(name: string): Promise<void> {
    const point = this.page.getByRole('radio', { name: new RegExp(name, 'i') })
      .or(this.page.getByText(new RegExp(name, 'i')))
      .first();
    await this.safeClick(point);
    await this.page.waitForTimeout(1000);
  }

  /**
   * Gets the collection point validation error text.
   */
  async getCollectionPointValidationError(): Promise<string> {
    const error = this.validationErrors.or(this.fieldErrors).first();
    return this.getTextContent(error);
  }

  // ─── Address Book Methods ────────────────────────────────────

  /**
   * Returns the count of saved addresses in the address book.
   */
  async getAddressBookCount(): Promise<number> {
    return this.addressBookEntries.count();
  }

  /**
   * Selects a saved address from the address book by index.
   * 
   * @param index - Zero-based index of the address entry
   */
  async selectAddressFromBook(index: number): Promise<void> {
    await this.safeClick(this.addressBookEntries.nth(index));
    await this.page.waitForTimeout(1000);
  }

  // ─── Order Summary Methods ──────────────────────────────────

  /**
   * Gets the order summary details from the checkout review section.
   */
  async getOrderSummaryDetails(): Promise<{
    productName: string;
    subtotal: string;
    shipping: string;
    total: string;
  }> {
    const productName = await this.reviewItems.first().textContent({ timeout: 3000 }).then(t => t?.trim() || '').catch(() => '');
    const subtotal = await this.page.getByTestId('basket-subtotal').textContent({ timeout: 3000 }).then(t => t?.trim() || '').catch(() => '');
    const shipping = await this.page.getByTestId('basket-shipping-cost').textContent({ timeout: 3000 }).then(t => t?.trim() || '').catch(() => '');
    const total = await this.page.getByTestId('basket-total').textContent({ timeout: 3000 }).then(t => t?.trim() || '').catch(() => '');

    return { productName, subtotal, shipping, total };
  }
}
