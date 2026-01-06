import { describe, it, expect } from 'vitest';
import type { User, ApiResponse, ApiError } from './index';

describe('shared-types', () => {
  it('should export User type', () => {
    const user: User = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(user.id).toBe('123');
    expect(user.email).toBe('test@example.com');
  });

  it('should export ApiResponse type', () => {
    const response: ApiResponse<string> = {
      data: 'test data',
      meta: {
        requestId: 'req-123',
        timestamp: new Date().toISOString(),
      },
    };
    expect(response.data).toBe('test data');
    expect(response.meta.requestId).toBe('req-123');
  });

  it('should export ApiError type', () => {
    const error: ApiError = {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
      },
      meta: {
        requestId: 'req-456',
      },
    };
    expect(error.error.code).toBe('VALIDATION_ERROR');
    expect(error.meta.requestId).toBe('req-456');
  });
});
