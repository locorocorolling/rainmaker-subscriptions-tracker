import { test, expect } from './auth.setup';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('successful login', async ({ authUtils }) => {
    const credentials = {
      email: 'test@example.com',
      password: 'password123'
    };

    await authUtils.openAuthModal();
    await authUtils.login(credentials);
    await authUtils.waitForSuccessfulAuth();

    await expect(authUtils.logoutButton).toBeVisible();
    await expect(authUtils.page.locator(new RegExp(`Welcome, ${credentials.email}`))).toBeVisible();
  });

  test('login with loading state', async ({ authUtils }) => {
    const credentials = {
      email: 'test@example.com',
      password: 'password123'
    };

    await authUtils.openAuthModal();
    // Modal starts in login mode by default

    await authUtils.emailInput.fill(credentials.email);
    await authUtils.passwordInput.fill(credentials.password);

    await authUtils.submitButton.click();

    const isLoading = await authUtils.getLoadingState();
    expect(isLoading).toBe(true);

    await authUtils.waitForSuccessfulAuth();
    await expect(authUtils.logoutButton).toBeVisible();
  });

  test('modal closes after successful login', async ({ authUtils }) => {
    const credentials = {
      email: 'test@example.com',
      password: 'password123'
    };

    await authUtils.openAuthModal();
    await authUtils.login(credentials);
    await authUtils.waitForSuccessfulAuth();

    const isModalVisible = await authUtils.isVisible(authUtils.authModal);
    expect(isModalVisible).toBe(false);
  });

  test('login redirects to dashboard', async ({ authUtils }) => {
    const credentials = {
      email: 'test@example.com',
      password: 'password123'
    };

    await authUtils.openAuthModal();
    await authUtils.login(credentials);
    await authUtils.waitForSuccessfulAuth();

    await expect(authUtils.page.locator('text=Active Subscriptions')).toBeVisible();
    await expect(authUtils.page.locator('text=Monthly Total')).toBeVisible();
    await expect(authUtils.page.locator('text=Next Renewal')).toBeVisible();
  });

  test('login creates persistent session', async ({ authUtils, page }) => {
    const credentials = {
      email: 'test@example.com',
      password: 'password123'
    };

    await authUtils.openAuthModal();
    await authUtils.login(credentials);
    await authUtils.waitForSuccessfulAuth();

    await page.reload();
    await expect(authUtils.logoutButton).toBeVisible();
    await expect(authUtils.page.locator(new RegExp(`Welcome, ${credentials.email}`))).toBeVisible();
  });

  test('logout functionality', async ({ authUtils }) => {
    const credentials = {
      email: 'test@example.com',
      password: 'password123'
    };

    await authUtils.openAuthModal();
    await authUtils.login(credentials);
    await authUtils.waitForSuccessfulAuth();

    await authUtils.logout();

    await expect(authUtils.signInButton).toBeVisible();
    await expect(authUtils.page.locator('text=Welcome to Subscription Tracker')).toBeVisible();
  });

  test('session persistence after logout', async ({ authUtils, page }) => {
    const credentials = {
      email: 'test@example.com',
      password: 'password123'
    };

    await authUtils.openAuthModal();
    await authUtils.login(credentials);
    await authUtils.waitForSuccessfulAuth();

    await authUtils.logout();
    await page.reload();

    await expect(authUtils.signInButton).toBeVisible();
    await expect(authUtils.page.locator('text=Welcome to Subscription Tracker')).toBeVisible();
  });
});