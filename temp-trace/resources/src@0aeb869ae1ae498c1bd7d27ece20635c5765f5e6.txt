/**
 * @fileoverview Login/Registration page object.
 * Handles authentication flows required for checkout.
 * Supports both the login modal and full login page.
 */

import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  // ─── Locators ────────────────────────────────────────────────

  /** Login form container */
  readonly loginForm: Locator;

  /** Email input on login form */
  readonly emailInput: Locator;

  /** Password input on login form */
  readonly passwordInput: Locator;

  /** Login submit button */
  readonly loginButton: Locator;

  /** Register tab/link */
  readonly registerTab: Locator;

  /** Register form container */
  readonly registerForm: Locator;

  /** Registration first name input */
  readonly registerFirstName: Locator;

  /** Registration last name input */
  readonly registerLastName: Locator;

  /** Registration email input */
  readonly registerEmail: Locator;

  /** Registration password input */
  readonly registerPassword: Locator;

  /** Registration submit button */
  readonly registerButton: Locator;

  /** Social login — Google */
  readonly googleLoginButton: Locator;

  /** Social login — Apple */
  readonly appleLoginButton: Locator;

  /** Social login — Facebook */
  readonly facebookLoginButton: Locator;

  /** "Forgot password" link */
  readonly forgotPasswordLink: Locator;

  /** Login error message */
  readonly loginError: Locator;

  /** Guest checkout option */
  readonly guestCheckoutButton: Locator;

  /** Password visibility toggle */
  readonly passwordToggle: Locator;

  constructor(page: Page) {
    super(page);

    // Login form
    this.loginForm = page.locator('form').filter({ hasText: /Login|Email/i }).first();
    this.emailInput = this.loginForm.getByRole('textbox', { name: /Email/i }).first();
    this.passwordInput = this.loginForm.getByRole('textbox', { name: /Password/i }).first();
    // Some sites use input type="password" without a role, so we can fallback:
    if (!this.passwordInput) {
      this.passwordInput = this.loginForm.locator('input[type="password"]').first();
    }
    // Scope to login form and also allow type="submit" fallback
    this.loginButton = this.loginForm.locator('button[type="submit"], button').filter({ hasText: /Log in|Login|Weiter/i }).first();

    // Register
    this.registerTab = page.getByRole('link', { name: /Register/i }).first();
    this.registerForm = page.locator('form').filter({ hasText: /Register|Create/i }).first();
    this.registerFirstName = page.getByRole('textbox', { name: /First name/i }).first();
    this.registerLastName = page.getByRole('textbox', { name: /Last name/i }).first();
    this.registerEmail = page.getByRole('textbox', { name: /Email/i }).first();
    this.registerPassword = page.locator('input[type="password"]').first();
    this.registerButton = page.getByRole('button', { name: /Create account|Register/i }).first();

    // Social logins
    this.googleLoginButton = page.getByRole('button', { name: /Google/i }).first();
    this.appleLoginButton = page.getByRole('button', { name: /Apple/i }).first();
    this.facebookLoginButton = page.getByRole('button', { name: /Facebook/i }).first();

    // Misc
    this.forgotPasswordLink = page.getByRole('link', { name: /Forgot/i }).first();
    this.loginError = page.getByRole('alert').first();
    this.guestCheckoutButton = page.getByRole('button', { name: /Guest/i }).first();
    this.passwordToggle = page.getByRole('button', { name: /Show password/i }).first();
  }

  // ─── Actions ─────────────────────────────────────────────────

  /**
   * Navigates to the login page directly.
   */
  async open(): Promise<void> {
    await this.navigateTo('/login');
    await this.dismissCookieConsent();
  }

  /**
   * Performs a full login with email and password.
   * 
   * @param email - User email address
   * @param password - User password
   */
  async login(email: string, password: string): Promise<void> {
    await this.safeFill(this.emailInput, email);
    await this.safeFill(this.passwordInput, password);
    
    await this.page.waitForTimeout(1000); // Give validation/captcha time to render
    const isButtonDisabled = await this.loginButton.isDisabled().catch(() => false);
    
    if (isButtonDisabled) {
      const captchaVisible = await this.page.locator('iframe[src*="cloudflare"]').isVisible().catch(() => false) || 
                             await this.page.getByText(/Verify you are human/i).isVisible().catch(() => false);
      if (captchaVisible) {
        console.log('⚠️ Cloudflare CAPTCHA detected! Please solve it manually in the browser window within 30 seconds...');
        try {
          // Wait up to 30s for the login button to become enabled
          await this.loginButton.waitFor({ state: 'attached', timeout: 30000 });
          // Poll until it's enabled
          let enabled = await this.loginButton.isDisabled().then(d => !d);
          let attempts = 0;
          while (!enabled && attempts < 30) {
            await this.page.waitForTimeout(1000);
            enabled = await this.loginButton.isDisabled().then(d => !d);
            attempts++;
          }
          if (!enabled) throw new Error('Timeout waiting for CAPTCHA to be solved');
        } catch (e) {
          throw new Error('Cloudflare CAPTCHA interactive challenge blocked the login attempt and was not solved in time.');
        }
      }
    }

    await this.safeClick(this.loginButton);
    await this.waitForNetworkIdle();
  }

  /**
   * Switches to the registration form.
   */
  async switchToRegister(): Promise<void> {
    await this.safeClick(this.registerTab);
    await this.page.waitForTimeout(1000);
  }

  /**
   * Checks if the login error message is displayed.
   */
  async hasLoginError(): Promise<boolean> {
    return this.isElementVisible(this.loginError, 5000);
  }

  /**
   * Gets the login error message text.
   */
  async getLoginErrorMessage(): Promise<string> {
    return this.getTextContent(this.loginError);
  }

  /**
   * Checks if the guest checkout option is available.
   */
  async hasGuestCheckout(): Promise<boolean> {
    return this.isElementVisible(this.guestCheckoutButton, 5000);
  }

  /**
   * Checks if social login buttons are present.
   */
  async getSocialLoginOptions(): Promise<{ google: boolean; apple: boolean; facebook: boolean }> {
    return {
      google: await this.isElementVisible(this.googleLoginButton, 3000),
      apple: await this.isElementVisible(this.appleLoginButton, 3000),
      facebook: await this.isElementVisible(this.facebookLoginButton, 3000),
    };
  }
}
