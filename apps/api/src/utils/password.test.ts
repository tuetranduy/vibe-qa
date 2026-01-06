import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword } from './password';

describe('Password Utility', () => {
  describe('hashPassword', () => {
    it('should hash a password successfully', async () => {
      const password = 'Test123!@#';
      const hash = await hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBe(60); // bcrypt hash length
      expect(hash.startsWith('$2')).toBe(true); // bcrypt format
    });

    it('should generate different hashes for same password', async () => {
      const password = 'Test123!@#';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      
      expect(hash1).not.toBe(hash2); // Different salts
    });

    it('should hash passwords with special characters', async () => {
      const password = 'Complex!@#$%^&*()_+-=[]{}|;:,.<>?Password123';
      const hash = await hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash.length).toBe(60);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      const password = 'Test123!@#';
      const hash = await hashPassword(password);
      const result = await comparePassword(password, hash);
      
      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = 'Test123!@#';
      const hash = await hashPassword(password);
      const result = await comparePassword('WrongPassword123!', hash);
      
      expect(result).toBe(false);
    });

    it('should return false for empty password', async () => {
      const hash = await hashPassword('Test123!@#');
      const result = await comparePassword('', hash);
      
      expect(result).toBe(false);
    });

    it('should be case-sensitive', async () => {
      const password = 'Test123!@#';
      const hash = await hashPassword(password);
      const result = await comparePassword('test123!@#', hash);
      
      expect(result).toBe(false);
    });
  });
});
