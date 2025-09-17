import { Page, Locator } from '@playwright/test';

export class AuthUtils {
  readonly page: Page;
  readonly signInButton: Locator;
  readonly authModal: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly registerTab: Locator;
  readonly loginTab: Locator;
  readonly nameInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly welcomeMessage: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.signInButton = page.locator('button', { hasText: 'Sign In' });
    this.authModal = page.locator('[role="dialog"]');
    this.emailInput = page.locator('input[type="email"]');
    this.passwordInput = page.locator('input#password');
    this.submitButton = page.locator('button[type="submit"]');
    this.registerTab = page.locator('button', { hasText: 'Sign up' });
    this.loginTab = page.locator('button', { hasText: 'Sign in' });
    this.nameInput = page.locator('input#name');
    this.confirmPasswordInput = page.locator('input#confirmPassword');
    this.welcomeMessage = page.locator('text=Welcome to Subscription Tracker');
    this.logoutButton = page.locator('button', { hasText: 'Logout' });
  }

  async navigateToHome() {
    await this.page.goto('/');
  }

  async openAuthModal() {
    await this.signInButton.click();
    await this.authModal.waitFor();
  }

  async switchToRegister() {
    await this.registerTab.click();
    await this.nameInput.waitFor();
  }

  async switchToLogin() {
    await this.loginTab.click();
    await this.nameInput.waitFor({ state: 'hidden' });
  }

  async register(userData: {
    name?: string;
    email: string;
    password: string;
  }) {
    await this.switchToRegister();

    if (userData.name) {
      await this.nameInput.fill(userData.name);
    }

    await this.emailInput.fill(userData.email);
    await this.passwordInput.fill(userData.password);
    await this.confirmPasswordInput.fill(userData.password);

    await this.submitButton.click();
  }

  async login(credentials: {
    email: string;
    password: string;
  }) {
    await this.switchToLogin();

    await this.emailInput.fill(credentials.email);
    await this.passwordInput.fill(credentials.password);

    await this.submitButton.click();
  }

  async waitForSuccessfulAuth() {
    await this.authModal.waitFor({ state: 'hidden' });
    await this.welcomeMessage.waitFor({ state: 'hidden' });
    await this.logoutButton.waitFor();
  }

  async logout() {
    await this.logoutButton.click();
    await this.signInButton.waitFor();
  }

  async isVisible(locator: Locator): Promise<boolean> {
    return await locator.isVisible();
  }

  async getErrorMessage(): Promise<string> {
    const errorElement = this.page.locator('.text-red-500');
    return await errorElement.textContent() || '';
  }

  async getLoadingState(): Promise<boolean> {
    const submitButton = this.page.locator('button[type="submit"]');
    const buttonText = await submitButton.textContent();
    return buttonText?.includes('...') || false;
  }
}