import { test } from './auth.setup';

test.describe('Registration Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('successful registration with name', async ({ authUtils }) => {
    const userData = {
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      password: 'password123'
    };

    await authUtils.openAuthModal();
    await authUtils.register(userData);
    await authUtils.waitForSuccessfulAuth();

    await expect(authUtils.logoutButton).toBeVisible();
    await expect(authUtils.page.locator('text=Welcome, Test User')).toBeVisible();
  });

  test('successful registration without name', async ({ authUtils }) => {
    const userData = {
      email: `test-${Date.now()}@example.com`,
      password: 'password123'
    };

    await authUtils.openAuthModal();
    await authUtils.register(userData);
    await authUtils.waitForSuccessfulAuth();

    await expect(authUtils.logoutButton).toBeVisible();
    await expect(authUtils.page.locator(new RegExp(`Welcome, ${userData.email}`))).toBeVisible();
  });

  test('registration with loading state', async ({ authUtils }) => {
    const userData = {
      email: `test-${Date.now()}@example.com`,
      password: 'password123'
    };

    await authUtils.openAuthModal();
    await authUtils.switchToRegister();

    await authUtils.nameInput.fill('Test User');
    await authUtils.emailInput.fill(userData.email);
    await authUtils.passwordInput.fill(userData.password);
    await authUtils.confirmPasswordInput.fill(userData.password);

    await authUtils.submitButton.click();

    const isLoading = await authUtils.getLoadingState();
    expect(isLoading).toBe(true);

    await authUtils.waitForSuccessfulAuth();
    await expect(authUtils.logoutButton).toBeVisible();
  });

  test('modal closes after successful registration', async ({ authUtils }) => {
    const userData = {
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      password: 'password123'
    };

    await authUtils.openAuthModal();
    await authUtils.register(userData);
    await authUtils.waitForSuccessfulAuth();

    const isModalVisible = await authUtils.isVisible(authUtils.authModal);
    expect(isModalVisible).toBe(false);
  });

  test('registration redirects to dashboard', async ({ authUtils }) => {
    const userData = {
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      password: 'password123'
    };

    await authUtils.openAuthModal();
    await authUtils.register(userData);
    await authUtils.waitForSuccessfulAuth();

    await expect(authUtils.page.locator('text=Active Subscriptions')).toBeVisible();
    await expect(authUtils.page.locator('text=Monthly Total')).toBeVisible();
    await expect(authUtils.page.locator('text=Next Renewal')).toBeVisible();
  });

  test('registration creates persistent session', async ({ authUtils, page }) => {
    const userData = {
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      password: 'password123'
    };

    await authUtils.openAuthModal();
    await authUtils.register(userData);
    await authUtils.waitForSuccessfulAuth();

    await page.reload();
    await expect(authUtils.logoutButton).toBeVisible();
    await expect(authUtils.page.locator('text=Welcome, Test User')).toBeVisible();
  });
});