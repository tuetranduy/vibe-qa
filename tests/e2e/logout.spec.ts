import { test, expect } from '../support/fixtures/auth.fixture';

/**
 * E2E Tests: User Logout (Story 1.7)
 * 
 * Tests cover:
 * - Successful logout
 * - JWT token removal from localStorage
 * - Redirect to login after logout
 * - Inability to access protected routes after logout
 * - Logout button visibility when authenticated
 */

test.describe('User Logout', () => {
  
  test('should logout successfully', async ({ page, authenticatedUser }) => {
    // GIVEN I am logged in and on the dashboard
    await page.goto('/dashboard');
    
    // WHEN I click the logout button
    await page.click('[data-testid="logout-button"]');
    
    // THEN I should be redirected to the login page
    await expect(page).toHaveURL('/login');
  });
  
  test('should clear JWT token from localStorage on logout', async ({ page, authenticatedUser }) => {
    // GIVEN I am logged in
    await page.goto('/dashboard');
    
    // WHEN I logout
    await page.click('[data-testid="logout-button"]');
    await page.waitForURL('/login');
    
    // THEN the JWT token should be removed from localStorage
    const token = await page.evaluate(() => localStorage.getItem('vibeqa_token'));
    expect(token).toBeNull();
  });
  
  test('should not access protected routes after logout', async ({ page, authenticatedUser }) => {
    // GIVEN I am logged in
    await page.goto('/dashboard');
    
    // WHEN I logout
    await page.click('[data-testid="logout-button"]');
    await page.waitForURL('/login');
    
    // AND I try to access a protected route
    await page.goto('/dashboard');
    
    // THEN I should be redirected to login
    await expect(page).toHaveURL('/login');
  });
  
  test('should not access profile page after logout', async ({ page, authenticatedUser }) => {
    // GIVEN I am logged in
    await page.goto('/dashboard');
    
    // WHEN I logout
    await page.click('[data-testid="logout-button"]');
    await page.waitForURL('/login');
    
    // AND I try to access the profile page
    await page.goto('/profile');
    
    // THEN I should be redirected to login
    await expect(page).toHaveURL('/login');
  });
  
  test('should display logout button when authenticated', async ({ page, authenticatedUser }) => {
    // GIVEN I am logged in
    await page.goto('/dashboard');
    
    // THEN I should see a logout button
    await expect(page.locator('[data-testid="logout-button"]')).toBeVisible();
  });
  
  test('should not display logout button when not authenticated', async ({ page }) => {
    // GIVEN I am not logged in
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/login');
    
    // THEN I should not see a logout button
    await expect(page.locator('[data-testid="logout-button"]')).not.toBeVisible();
  });
  
  test('should show confirmation message after logout', async ({ page, authenticatedUser }) => {
    // GIVEN I am logged in
    await page.goto('/dashboard');
    
    // WHEN I logout
    await page.click('[data-testid="logout-button"]');
    await page.waitForURL('/login');
    
    // THEN I should see a logout confirmation message
    await expect(page.locator('[data-testid="logout-success-message"]')).toContainText('logged out successfully');
  });
  
  test('should allow login again after logout', async ({ page, authenticatedUser }) => {
    const { user } = authenticatedUser;
    
    // GIVEN I have logged out
    await page.goto('/dashboard');
    await page.click('[data-testid="logout-button"]');
    await page.waitForURL('/login');
    
    // WHEN I login again with the same credentials
    await page.fill('[data-testid="email-input"]', user.email);
    await page.fill('[data-testid="password-input"]', user.password);
    await page.click('[data-testid="login-button"]');
    
    // THEN I should be logged in successfully
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-name"]')).toContainText(user.name);
  });
});
