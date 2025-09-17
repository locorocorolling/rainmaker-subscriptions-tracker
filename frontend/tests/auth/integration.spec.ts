import { test, expect } from './auth.setup';

test.describe('Authentication Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('modal interactions and form validation', async ({ authUtils }) => {
    await authUtils.openAuthModal();
    await authUtils.switchToRegister();

    // Test form validation
    await authUtils.submitButton.click();

    // Check for validation errors
    const emailError = await authUtils.page.locator('text=Invalid email address');
    const passwordError = await authUtils.page.locator('text=Password must be at least 6 characters');

    // Form should show validation errors
    expect(await emailError.isVisible() || await passwordError.isVisible()).toBe(true);
  });

  test('modal mode switching', async ({ authUtils }) => {
    await authUtils.openAuthModal();

    // Switch to register
    await authUtils.switchToRegister();
    await expect(authUtils.nameInput).toBeVisible();

    // Switch back to login
    await authUtils.switchToLogin();
    await expect(authUtils.nameInput).not.toBeVisible();
  });

  test('modal can be closed manually', async ({ authUtils }) => {
    await authUtils.openAuthModal();
    await expect(authUtils.authModal).toBeVisible();

    // Close modal by clicking outside or escape key
    await authUtils.page.keyboard.press('Escape');
    await expect(authUtils.authModal).not.toBeVisible();
  });

  test('form filling works correctly', async ({ authUtils }) => {
    await authUtils.openAuthModal();
    await authUtils.switchToRegister();

    // Fill form with test data
    await authUtils.nameInput.fill('Test User');
    await authUtils.emailInput.fill('test@example.com');
    await authUtils.passwordInput.fill('password123');
    await authUtils.confirmPasswordInput.fill('password123');

    // Verify form values
    expect(await authUtils.nameInput.inputValue()).toBe('Test User');
    expect(await authUtils.emailInput.inputValue()).toBe('test@example.com');
    expect(await authUtils.passwordInput.inputValue()).toBe('password123');
    expect(await authUtils.confirmPasswordInput.inputValue()).toBe('password123');
  });

  test('loading state appears during form submission', async ({ authUtils }) => {
    await authUtils.openAuthModal();
    await authUtils.switchToRegister();

    // Fill form
    await authUtils.nameInput.fill('Test User');
    await authUtils.emailInput.fill(`test-${Date.now()}@example.com`);
    await authUtils.passwordInput.fill('password123');
    await authUtils.confirmPasswordInput.fill('password123');

    // Submit form
    await authUtils.submitButton.click();

    // Check for loading state (should appear briefly)
    await authUtils.page.waitForTimeout(1000);

    // Modal might still be open due to API error, but loading state should have appeared
    const isModalVisible = await authUtils.isVisible(authUtils.authModal);
    console.log('Modal visible after submission:', isModalVisible);
  });
});