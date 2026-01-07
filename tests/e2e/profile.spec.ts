import { test, expect } from '../support/fixtures/auth.fixture';

/**
 * E2E Tests: User Profile Management (Story 1.6)
 * 
 * Tests cover:
 * - View user profile
 * - Update profile name
 * - Prevent email updates
 * - Authentication required for profile access
 * - Profile data persistence
 */

test.describe('User Profile Management', () => {
  
  test('should display user profile information', async ({ page, authenticatedUser }) => {
    // GIVEN I am logged in
    const { user } = authenticatedUser;
    
    // WHEN I navigate to my profile page
    await page.goto('/profile');
    
    // THEN I should see my profile information
    await expect(page.locator('[data-testid="profile-email"]')).toContainText(user.email);
    await expect(page.locator('[data-testid="profile-name"]')).toHaveValue(user.name);
  });
  
  test('should update profile name successfully', async ({ page, authenticatedUser }) => {
    const { user } = authenticatedUser;
    const newName = 'Updated Test Name';
    
    // GIVEN I am on my profile page
    await page.goto('/profile');
    
    // WHEN I update my name
    await page.fill('[data-testid="profile-name"]', newName);
    await page.click('[data-testid="save-profile-button"]');
    
    // THEN I should see a success message
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Profile updated successfully');
    
    // AND the new name should be displayed
    await expect(page.locator('[data-testid="profile-name"]')).toHaveValue(newName);
  });
  
  test('should persist name changes after page reload', async ({ page, authenticatedUser }) => {
    const newName = 'Persistent Test Name';
    
    // GIVEN I have updated my profile name
    await page.goto('/profile');
    await page.fill('[data-testid="profile-name"]', newName);
    await page.click('[data-testid="save-profile-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // WHEN I reload the page
    await page.reload();
    
    // THEN the updated name should still be displayed
    await expect(page.locator('[data-testid="profile-name"]')).toHaveValue(newName);
  });
  
  test('should NOT allow email updates', async ({ page, authenticatedUser }) => {
    const { user } = authenticatedUser;
    
    // GIVEN I am on my profile page
    await page.goto('/profile');
    
    // THEN the email field should be read-only or not editable
    const emailField = page.locator('[data-testid="profile-email"]');
    await expect(emailField).toHaveAttribute('readonly', '');
    // OR email should be displayed as text (not input)
  });
  
  test('should show validation error for empty name', async ({ page, authenticatedUser }) => {
    // GIVEN I am on my profile page
    await page.goto('/profile');
    
    // WHEN I try to save with an empty name
    await page.fill('[data-testid="profile-name"]', '');
    await page.click('[data-testid="save-profile-button"]');
    
    // THEN I should see a validation error
    await expect(page.locator('[data-testid="name-error"]')).toContainText('Name is required');
  });
  
  test('should redirect to login if not authenticated', async ({ page }) => {
    // GIVEN I am not logged in (clear localStorage)
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    
    // WHEN I try to access the profile page
    await page.goto('/profile');
    
    // THEN I should be redirected to the login page
    await expect(page).toHaveURL('/login');
  });
  
  test('should display loading state while saving', async ({ page, authenticatedUser }) => {
    const newName = 'Loading Test Name';
    
    // GIVEN I am on my profile page
    await page.goto('/profile');
    
    // WHEN I update my name
    await page.fill('[data-testid="profile-name"]', newName);
    
    // Intercept API call to simulate slow network
    await page.route('**/api/v1/users/me', async (route) => {
      await page.waitForTimeout(1000);
      await route.continue();
    });
    
    await page.click('[data-testid="save-profile-button"]');
    
    // THEN I should see a loading indicator or disabled button
    await expect(page.locator('[data-testid="save-profile-button"]')).toBeDisabled();
  });
  
  test('should display error message on API failure', async ({ page, authenticatedUser }) => {
    const newName = 'Error Test Name';
    
    // GIVEN I am on my profile page
    await page.goto('/profile');
    
    // WHEN the API returns an error
    await page.route('**/api/v1/users/me', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: {
            code: 'SERVER_ERROR',
            message: 'Internal server error',
          },
        }),
      });
    });
    
    await page.fill('[data-testid="profile-name"]', newName);
    await page.click('[data-testid="save-profile-button"]');
    
    // THEN I should see an error message
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Failed to update profile');
  });
});
