import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import * as authAPI from '../services/auth';

vi.mock('../services/auth');

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should throw error when useAuth is used outside AuthProvider', () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within AuthProvider');
  });

  it('should initialize with unauthenticated state when no token', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should load user when token exists in localStorage', async () => {
    const mockUser = {
      data: {
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
      },
      meta: {
        requestId: 'req-123',
        timestamp: '2026-01-06T12:00:00Z',
      },
    };
    vi.spyOn(authAPI, 'getCurrentUser').mockResolvedValue(mockUser);
    localStorage.setItem('vibeqa_token', 'existing-token');

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser.data.user);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should remove token when getCurrentUser fails', async () => {
    vi.spyOn(authAPI, 'getCurrentUser').mockRejectedValue(new Error('Unauthorized'));
    localStorage.setItem('vibeqa_token', 'invalid-token');

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem('vibeqa_token')).toBeNull();
  });

  it('should login successfully', async () => {
    const mockResponse = {
      data: {
        token: 'new-jwt-token',
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
      },
      meta: {
        requestId: 'req-123',
        timestamp: '2026-01-06T12:00:00Z',
      },
    };
    vi.spyOn(authAPI, 'login').mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await result.current.login('test@example.com', 'Password123!');

    await waitFor(() => {
      expect(result.current.user).toEqual(mockResponse.data.user);
      expect(result.current.isAuthenticated).toBe(true);
      expect(localStorage.getItem('vibeqa_token')).toBe('new-jwt-token');
    });
  });

  it('should signup successfully', async () => {
    const mockResponse = {
      data: {
        token: 'new-jwt-token',
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
      },
      meta: {
        requestId: 'req-123',
        timestamp: '2026-01-06T12:00:00Z',
      },
    };
    vi.spyOn(authAPI, 'signup').mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await result.current.signup('test@example.com', 'Password123!', 'Test User');

    await waitFor(() => {
      expect(result.current.user).toEqual(mockResponse.data.user);
      expect(result.current.isAuthenticated).toBe(true);
      expect(localStorage.getItem('vibeqa_token')).toBe('new-jwt-token');
    });
  });

  it('should logout successfully', async () => {
    const mockUser = {
      data: {
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
      },
      meta: {
        requestId: 'req-123',
        timestamp: '2026-01-06T12:00:00Z',
      },
    };
    vi.spyOn(authAPI, 'getCurrentUser').mockResolvedValue(mockUser);
    vi.spyOn(authAPI, 'logout').mockResolvedValue();
    localStorage.setItem('vibeqa_token', 'existing-token');

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    result.current.logout();

    await waitFor(() => {
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorage.getItem('vibeqa_token')).toBeNull();
    });
  });

  it('should logout even if API call fails', async () => {
    const mockUser = {
      data: {
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
      },
      meta: {
        requestId: 'req-123',
        timestamp: '2026-01-06T12:00:00Z',
      },
    };
    vi.spyOn(authAPI, 'getCurrentUser').mockResolvedValue(mockUser);
    vi.spyOn(authAPI, 'logout').mockRejectedValue(new Error('Network error'));
    localStorage.setItem('vibeqa_token', 'existing-token');

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    result.current.logout();

    await waitFor(() => {
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorage.getItem('vibeqa_token')).toBeNull();
    });
  });
});
