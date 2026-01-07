import { test as base, expect } from '@playwright/test';
import { createUser, type UserData } from '../factories/user.factory';

/**
 * Authenticated User Fixture
 * Provides a registered and logged-in user with auto-cleanup
 * 
 * Usage:
 * test('should do something', async ({ authenticatedUser, page }) => {
 *   // authenticatedUser provides: { user, token }
 *   // User is already registered and token is in localStorage
 * });
 */

type AuthenticatedUserFixture = {
  user: UserData;
  token: string;
};

export const test = base.extend<{ authenticatedUser: AuthenticatedUserFixture }>({
  authenticatedUser: async ({ page }, use) => {
    const API_BASE_URL = process.env.API_URL || 'http://localhost:3001';
    const user = createUser();
    
    // Register user via API
    const signupResponse = await page.request.post(`${API_BASE_URL}/api/v1/auth/signup`, {
      data: {
        email: user.email,
        password: user.password,
        name: user.name,
      },
    });
    
    expect(signupResponse.ok()).toBeTruthy();
    const signupData = await signupResponse.json();
    const token = signupData.data.token;
    
    // Store token in page context for authenticated requests
    await page.goto('/');
    await page.evaluate((token) => {
      localStorage.setItem('vibeqa_token', token);
    }, token);
    
    // Provide to test
    await use({ user, token });
    
    // Cleanup: Delete user from database
    // Note: In MVP, no DELETE user endpoint exists
    // Cleanup will happen via database reset between test runs
  },
});

export { expect };
