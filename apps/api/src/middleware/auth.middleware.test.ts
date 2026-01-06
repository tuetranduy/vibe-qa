import { Request, Response, NextFunction } from 'express';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { authMiddleware } from './auth.middleware';
import { verifyToken } from '../utils/jwt';

// Mock jwt utility
vi.mock('../utils/jwt');

describe('authMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {}
    };
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };
    mockNext = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should attach user to req.user and call next() with valid token', () => {
    const mockDecoded = { userId: 1, email: 'test@example.com' };
    vi.mocked(verifyToken).mockReturnValue(mockDecoded);

    mockRequest.headers = {
      authorization: 'Bearer valid-token-123'
    };

    authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(verifyToken).toHaveBeenCalledWith('valid-token-123');
    expect(mockRequest.user).toEqual({ id: 1, email: 'test@example.com' });
    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should return 401 when Authorization header is missing', () => {
    mockRequest.headers = {};

    authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Missing authentication token'
      },
      meta: expect.objectContaining({
        requestId: expect.any(String),
        timestamp: expect.any(String)
      })
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 when Authorization header is malformed (no Bearer prefix)', () => {
    mockRequest.headers = {
      authorization: 'invalid-token-123'
    };

    authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid authorization format'
      },
      meta: expect.objectContaining({
        requestId: expect.any(String),
        timestamp: expect.any(String)
      })
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 when verifyToken returns null (invalid token)', () => {
    vi.mocked(verifyToken).mockReturnValue(null);

    mockRequest.headers = {
      authorization: 'Bearer invalid-token'
    };

    authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(verifyToken).toHaveBeenCalledWith('invalid-token');
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired token'
      },
      meta: expect.objectContaining({
        requestId: expect.any(String),
        timestamp: expect.any(String)
      })
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 when verifyToken returns null (expired token)', () => {
    vi.mocked(verifyToken).mockReturnValue(null);

    mockRequest.headers = {
      authorization: 'Bearer expired-token'
    };

    authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(verifyToken).toHaveBeenCalledWith('expired-token');
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired token'
      },
      meta: expect.objectContaining({
        requestId: expect.any(String),
        timestamp: expect.any(String)
      })
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 when Authorization header has Bearer but no token', () => {
    mockRequest.headers = {
      authorization: 'Bearer '
    };

    authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid authorization format'
      },
      meta: expect.objectContaining({
        requestId: expect.any(String),
        timestamp: expect.any(String)
      })
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should include requestId and timestamp in meta for all error responses', () => {
    mockRequest.headers = {};

    authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.json).toHaveBeenCalledWith({
      error: expect.any(Object),
      meta: {
        requestId: expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i),
        timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
      }
    });
  });
});
