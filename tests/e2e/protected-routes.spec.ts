import { test, expect } from '@playwright/test';
import { test as authTest } from '../support/fixtures/auth.fixture';

/**
 * E2E Tests: Protected Routes (Story 1.9 - not implemented yet)
 * 
 * Tests cover:
 * - Redirects to login when accessing protected routes without auth
 * - Access to protected routes when authenticated
 * - Root path redirect logic
 */

test.describe('Protected Routes and Navigation', () => {
  
  test('should redirect root path to dashboard if authenticated', async ({ page }) => {
    const API_BASE_URL = 'http://localhost:3001';
    
    // GIVEN I am logged in
    const signupResponse = await page.request.post(`${API_BASE_URL}/api/v1/auth/signup`, {
      data: {
        email: 'test@example.com',
        password: 'Test123!@#',
        name: 'Test User',
      },
    });
    const signupData = await signupResponse.json();
    const token = signupData.data.token;
    
    await page.goto('/');
    await page.evaluate((token) => {
      localStorage.setItem('vibeqa_token', token);
    }, token);
    
    // WHEN I visit the root path
    await page.goto('/');
    
    // THEN I should be redirected to dashboard
    await expect(page).toHaveURL('/dashboard');
  });
  
  test('should redirect root path to login if not authenticated', async ({ page }) => {
    // GIVEN I am not logged in
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    
    // WHEN I visit the root path
    await page.goto('/');
    
    // THEN I should be redirected to login
    await expect(page).toHaveURL('/login');
  });
  
  test('should access dashboard when authenticated', async ({ page }) => {
    const API_BASE_URL = 'http://localhost:3001';
    
    // GIVEN I am logged in
    const signupResponse = await page.request.post(`${API_BASE_URL}/api/v1/auth/signup`, {
      data: {
        email: 'dashboard@example.com',
        password: 'Test123!@#',
        name: 'Dashboard User',
      },
    });
    const signupData = await signupResponse.json();
    const token = signupData.data.token;
    
    await page.goto('/');
    await page.evaluate((token) => {
      localStorage.setItem('vibeqa_token', token);
    }, token);
    
    // WHEN I navigate to dashboard
    await page.goto('/dashboard');
    
    // THEN I should see the dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="dashboard-content"]')).toBeVisible();
  });
  
  test('should block access to dashboard when not authenticated', async ({ page }) => {
    // GIVEN I am not logged in
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    
    // WHEN I try to access dashboard
    await page.goto('/dashboard');
    
    // THEN I should be redirected to login
    await expect(page).toHaveURL('/login');
  });
  
  test('should preserve intended destination after login', async ({ page }) => {
    // GIVEN I try to access dashboard without being logged in
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/login');
    
    // WHEN I login
    const API_BASE_URL = 'http://localhost:3001';
    const user = {
      email: 'redirect@example.com',
      password: 'Test123!@#',
      name: 'Redirect User',
    };
    
    await page.request.post(`${API_BASE_URL}/api/v1/auth/signup`, {
      data: user,
    });
    
    await page.fill('[data-testid="email-input"]', user.email);
    await page.fill('[data-testid="password-input"]', user.password);
    await page.click('[data-testid="login-button"]');
    
    // THEN I should be redirected to the originally intended destination
    await expect(page).toHaveURL('/dashboard');
  });
});

authTest.describe('Navigation with Authentication', () => {
  
  authTest('should navigate between protected pages', async ({ page, authenticatedUser }) => {
    // GIVEN I am logged in
    await page.goto('/dashboard');
    
    // WHEN I navigate to profile
    await page.click('[data-testid="profile-link"]');
    
    // THEN I should see the profile page
    await expect(page).toHaveURL('/profile');
    
    // WHEN I navigate back to dashboard
    await page.click('[data-testid="dashboard-link"]');
    
    // THEN I should see the dashboard
    await expect(page).toHaveURL('/dashboard');
  });
  
  authTest('should display user navigation menu', async ({ page, authenticatedUser }) => {
    const { user } = authenticatedUser;
    
    // GIVEN I am logged in
    await page.goto('/dashboard');
    
    // THEN I should see navigation links
    await expect(page.locator('[data-testid="dashboard-link"]')).toBeVisible();
    await expect(page.locator('[data-testid="profile-link"]')).toBeVisible();
    await expect(page.locator('[data-testid="logout-button"]')).toBeVisible();
    
    // AND I should see my user name in navigation
    await expect(page.locator('[data-testid="nav-user-name"]')).toContainText(user.name);
  });
});
