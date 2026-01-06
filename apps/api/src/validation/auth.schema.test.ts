import { describe, it, expect } from 'vitest';
import { loginSchema } from './auth.schema';

describe('Login Schema Validation', () => {
  it('should accept valid login data', () => {
    const validData = {
      email: 'user@example.com',
      password: 'mypassword123'
    };

    const result = loginSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe(validData.email);
      expect(result.data.password).toBe(validData.password);
    }
  });

  it('should reject invalid email format', () => {
    const invalidData = {
      email: 'not-an-email',
      password: 'mypassword123'
    };

    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const emailError = result.error.issues.find(issue => issue.path[0] === 'email');
      expect(emailError).toBeDefined();
      expect(emailError?.message).toContain('Invalid email');
    }
  });

  it('should reject missing email field', () => {
    const invalidData = {
      password: 'mypassword123'
    };

    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const emailError = result.error.issues.find(issue => issue.path[0] === 'email');
      expect(emailError).toBeDefined();
    }
  });

  it('should reject missing password field', () => {
    const invalidData = {
      email: 'user@example.com'
    };

    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const passwordError = result.error.issues.find(issue => issue.path[0] === 'password');
      expect(passwordError).toBeDefined();
    }
  });

  it('should reject empty password', () => {
    const invalidData = {
      email: 'user@example.com',
      password: ''
    };

    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const passwordError = result.error.issues.find(issue => issue.path[0] === 'password');
      expect(passwordError).toBeDefined();
      expect(passwordError?.message).toContain('Password is required');
    }
  });

  it('should reject empty object', () => {
    const result = loginSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('should accept any password length for login (no complexity check)', () => {
    const validData = {
      email: 'user@example.com',
      password: 'x'
    };

    const result = loginSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});
