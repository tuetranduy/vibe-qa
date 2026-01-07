import { test, expect } from '@playwright/test';
import { createUser } from '../support/factories/user.factory';

/**
 * E2E Tests: User Login (Story 1.4)
 * 
 * Tests cover:
 * - Successful login with valid credentials
 * - Error handling for invalid credentials
 * - Form validation
 * - JWT token storage
 * - Redirect to dashboard after login
 * - Forgot password link visibility
 */

test.describe('User Login', () => {
  
  test('should login with valid credentials', async ({ page }) => {
    const user = createUser();
    
    // GIVEN a registered user exists
    await page.request.post('http://localhost:3001/api/v1/auth/signup', {
      data: {
        email: user.email,
        password: user.password,
        name: user.name,
      },
    });
    
    // WHEN I navigate to the login page
    await page.goto('/login');
    
    // AND I enter valid credentials
    await page.fill('[data-testid="email-input"]', user.email);
    await page.fill('[data-testid="password-input"]', user.password);
    await page.click('[data-testid="login-button"]');
    
    // THEN I should be redirected to the dashboard
    await page.waitForURL('/dashboard');
    
    // AND I should see my user profile
    await expect(page.locator('[data-testid="user-name"]')).toContainText(user.name);
  });
  
  test('should display error for invalid email', async ({ page }) => {
    // GIVEN I am on the login page
    await page.goto('/login');
    
    // WHEN I enter a non-existent email
    await page.fill('[data-testid="email-input"]', 'nonexistent@example.com');
    await page.fill('[data-testid="password-input"]', 'SomePassword123!');
    await page.click('[data-testid="login-button"]');
    
    // THEN I should see a generic error message (no user enumeration)
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid email or password');
  });
  
  test('should display error for incorrect password', async ({ page }) => {
    const user = createUser();
    
    // GIVEN a registered user exists
    await page.request.post('http://localhost:3001/api/v1/auth/signup', {
      data: {
        email: user.email,
        password: user.password,
        name: user.name,
      },
    });
    
    // WHEN I enter the correct email but wrong password
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', user.email);
    await page.fill('[data-testid="password-input"]', 'WrongPassword123!');
    await page.click('[data-testid="login-button"]');
    
    // THEN I should see a generic error message (no user enumeration)
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid email or password');
  });
  
  test('should store JWT token in localStorage on successful login', async ({ page }) => {
    const user = createUser();
    
    // GIVEN a registered user exists
    await page.request.post('http://localhost:3001/api/v1/auth/signup', {
      data: {
        email: user.email,
        password: user.password,
        name: user.name,
      },
    });
    
    // WHEN I login successfully
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', user.email);
    await page.fill('[data-testid="password-input"]', user.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');
    
    // THEN JWT token should be stored in localStorage
    const token = await page.evaluate(() => localStorage.getItem('vibeqa_token'));
    expect(token).toBeTruthy();
    expect(token).toMatch(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/); // JWT format
  });
  
  test('should display forgot password link', async ({ page }) => {
    // GIVEN I am on the login page
    await page.goto('/login');
    
    // THEN I should see a forgot password link
    const forgotLink = page.locator('[data-testid="forgot-password-link"]');
    await expect(forgotLink).toBeVisible();
    await expect(forgotLink).toContainText('Forgot password');
    
    // Note: Link is non-functional in MVP per FR33
    await expect(forgotLink).toHaveAttribute('disabled', '');
  });
  
  test('should disable submit button while loading', async ({ page }) => {
    const user = createUser();
    
    // GIVEN a registered user exists
    await page.request.post('http://localhost:3001/api/v1/auth/signup', {
      data: {
        email: user.email,
        password: user.password,
        name: user.name,
      },
    });
    
    // WHEN I submit the login form
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', user.email);
    await page.fill('[data-testid="password-input"]', user.password);
    
    // Intercept to simulate slow network
    await page.route('**/api/v1/auth/login', async (route) => {
      await page.waitForTimeout(1000);
      await route.continue();
    });
    
    await page.click('[data-testid="login-button"]');
    
    // THEN the submit button should be disabled
    await expect(page.locator('[data-testid="login-button"]')).toBeDisabled();
  });
  
  test('should have link to signup page', async ({ page }) => {
    // GIVEN I am on the login page
    await page.goto('/login');
    
    // THEN I should see a link to the signup page
    const signupLink = page.locator('[data-testid="signup-link"]');
    await expect(signupLink).toBeVisible();
    await expect(signupLink).toContainText('sign up');
    
    // WHEN I click the link
    await signupLink.click();
    
    // THEN I should be on the signup page
    await expect(page).toHaveURL('/signup');
  });
  
  test('should redirect to dashboard if already authenticated', async ({ page }) => {
    const user = createUser();
    
    // GIVEN I am already logged in
    const signupResponse = await page.request.post('http://localhost:3001/api/v1/auth/signup', {
      data: {
        email: user.email,
        password: user.password,
        name: user.name,
      },
    });
    const signupData = await signupResponse.json();
    const token = signupData.data.token;
    
    await page.goto('/');
    await page.evaluate((token) => {
      localStorage.setItem('vibeqa_token', token);
    }, token);
    
    // WHEN I try to visit the login page
    await page.goto('/login');
    
    // THEN I should be redirected to the dashboard
    await expect(page).toHaveURL('/dashboard');
  });
});
