import { describe, it, expect } from 'vitest';
import { generateToken, verifyToken } from './jwt';
import jwt from 'jsonwebtoken';

describe('JWT Utilities', () => {
  const testPayload = {
    userId: 1,
    email: 'test@example.com'
  };

  describe('generateToken', () => {
    it('should generate a valid JWT token with correct payload', () => {
      const token = generateToken(testPayload);
      
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      
      // Decode token to verify payload
      const decoded = jwt.decode(token) as any;
      expect(decoded.userId).toBe(testPayload.userId);
      expect(decoded.email).toBe(testPayload.email);
    });

    it('should set JWT expiration to 7 days', () => {
      const token = generateToken(testPayload);
      const decoded = jwt.decode(token) as any;
      
      // Check that exp is set and is approximately 7 days from now
      expect(decoded.exp).toBeTruthy();
      const expiresIn = decoded.exp - decoded.iat;
      const sevenDaysInSeconds = 7 * 24 * 60 * 60;
      expect(expiresIn).toBe(sevenDaysInSeconds);
    });

    it('should use HS256 algorithm', () => {
      const token = generateToken(testPayload);
      const decoded = jwt.decode(token, { complete: true }) as any;
      
      expect(decoded.header.alg).toBe('HS256');
    });
  });

  describe('verifyToken', () => {
    it('should verify and decode a valid token', () => {
      const token = generateToken(testPayload);
      const result = verifyToken(token);
      
      expect(result).toBeTruthy();
      expect(result?.userId).toBe(testPayload.userId);
      expect(result?.email).toBe(testPayload.email);
    });

    it('should return null for expired token', () => {
      // Generate token with 0 second expiration
      const expiredToken = jwt.sign(
        testPayload,
        process.env.JWT_SECRET!,
        { algorithm: 'HS256', expiresIn: '0s' }
      );
      
      // Wait a moment to ensure expiration
      setTimeout(() => {
        const result = verifyToken(expiredToken);
        expect(result).toBeNull();
      }, 100);
    });

    it('should return null for invalid signature', () => {
      const token = generateToken(testPayload);
      // Tamper with the token by changing last character
      const tamperedToken = token.slice(0, -1) + 'X';
      
      const result = verifyToken(tamperedToken);
      expect(result).toBeNull();
    });

    it('should return null for malformed token', () => {
      const malformedToken = 'not.a.valid.jwt.token';
      const result = verifyToken(malformedToken);
      expect(result).toBeNull();
    });

    it('should return null for empty token', () => {
      const result = verifyToken('');
      expect(result).toBeNull();
    });
  });
});
