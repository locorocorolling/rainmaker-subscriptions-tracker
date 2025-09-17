import { test as base } from '@playwright/test';
import { AuthUtils } from './auth-utils';

export const test = base.extend<{
  authUtils: AuthUtils;
}>({
  authUtils: async ({ page }, use) => {
    const authUtils = new AuthUtils(page);
    await use(authUtils);
  },
});

export { expect } from '@playwright/test';