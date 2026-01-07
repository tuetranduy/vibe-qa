import { test, expect } from '@playwright/test';
import { createUser, createUserWithWeakPassword, createUserWithInvalidEmail } from '../support/factories/user.factory';

/**
 * E2E Tests: User Registration (Story 1.3)
 * 
 * Tests cover:
 * - Successful registration with valid data
 * - Form validation (email, password requirements)
 * - Duplicate email handling
 * - Password visibility toggle
 * - Redirect to dashboard after signup
 */

test.describe('User Registration', () => {
  
  test('should register a new user with valid credentials', async ({ page }) => {
    const user = createUser();
    
    // GIVEN I am on the signup page
    await page.goto('/signup');
    
    // WHEN I fill in valid registration details
    await page.fill('[data-testid="email-input"]', user.email);
    await page.fill('[data-testid="password-input"]', user.password);
    await page.fill('[data-testid="name-input"]', user.name);
    await page.click('[data-testid="signup-button"]');
    
    // THEN I should be redirected to the dashboard
    await page.waitForURL('/dashboard');
    
    // AND I should see a welcome message with my name
    await expect(page.locator('[data-testid="welcome-message"]')).toContainText(user.name);
  });
  
  test('should display error for duplicate email', async ({ page }) => {
    const user = createUser();
    
    // GIVEN a user is already registered
    await page.request.post('http://localhost:3001/api/v1/auth/signup', {
      data: {
        email: user.email,
        password: user.password,
        name: user.name,
      },
    });
    
    // WHEN I try to register with the same email
    await page.goto('/signup');
    await page.fill('[data-testid="email-input"]', user.email);
    await page.fill('[data-testid="password-input"]', user.password);
    await page.fill('[data-testid="name-input"]', user.name);
    await page.click('[data-testid="signup-button"]');
    
    // THEN I should see an error message
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Email already exists');
  });
  
  test('should display validation error for invalid email', async ({ page }) => {
    const user = createUserWithInvalidEmail();
    
    // GIVEN I am on the signup page
    await page.goto('/signup');
    
    // WHEN I enter an invalid email
    await page.fill('[data-testid="email-input"]', user.email);
    await page.fill('[data-testid="password-input"]', user.password);
    await page.fill('[data-testid="name-input"]', user.name);
    
    // Trigger validation by clicking outside or submit
    await page.click('[data-testid="signup-button"]');
    
    // THEN I should see a validation error
    await expect(page.locator('[data-testid="email-error"]')).toContainText('Invalid email');
  });
  
  test('should display validation error for weak password', async ({ page }) => {
    const user = createUserWithWeakPassword();
    
    // GIVEN I am on the signup page
    await page.goto('/signup');
    
    // WHEN I enter a weak password
    await page.fill('[data-testid="email-input"]', user.email);
    await page.fill('[data-testid="password-input"]', user.password);
    await page.fill('[data-testid="name-input"]', user.name);
    await page.click('[data-testid="signup-button"]');
    
    // THEN I should see password requirement errors
    const passwordError = page.locator('[data-testid="password-error"]');
    await expect(passwordError).toBeVisible();
    await expect(passwordError).toContainText('at least 8 characters');
  });
  
  test('should display all password requirements', async ({ page }) => {
    // GIVEN I am on the signup page
    await page.goto('/signup');
    
    // THEN I should see all password requirements displayed
    await expect(page.locator('[data-testid="password-requirements"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-requirements"]')).toContainText('8 characters');
    await expect(page.locator('[data-testid="password-requirements"]')).toContainText('uppercase');
    await expect(page.locator('[data-testid="password-requirements"]')).toContainText('lowercase');
    await expect(page.locator('[data-testid="password-requirements"]')).toContainText('number');
    await expect(page.locator('[data-testid="password-requirements"]')).toContainText('special character');
  });
  
  test('should disable submit button while loading', async ({ page }) => {
    const user = createUser();
    
    // GIVEN I am on the signup page
    await page.goto('/signup');
    
    // WHEN I start submitting the form
    await page.fill('[data-testid="email-input"]', user.email);
    await page.fill('[data-testid="password-input"]', user.password);
    await page.fill('[data-testid="name-input"]', user.name);
    
    // Intercept API call to simulate slow network
    await page.route('**/api/v1/auth/signup', async (route) => {
      await page.waitForTimeout(1000); // Simulate delay
      await route.continue();
    });
    
    await page.click('[data-testid="signup-button"]');
    
    // THEN the submit button should be disabled
    await expect(page.locator('[data-testid="signup-button"]')).toBeDisabled();
  });
  
  test('should have link to login page', async ({ page }) => {
    // GIVEN I am on the signup page
    await page.goto('/signup');
    
    // THEN I should see a link to the login page
    const loginLink = page.locator('[data-testid="login-link"]');
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toContainText('login');
    
    // WHEN I click the link
    await loginLink.click();
    
    // THEN I should be on the login page
    await expect(page).toHaveURL('/login');
  });
});
