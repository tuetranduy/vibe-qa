import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { AuthProvider } from '../contexts/AuthContext';
import * as authAPI from '../services/auth';

vi.mock('../services/auth');

const TestComponent = () => <div>Protected Content</div>;
const LoginComponent = () => <div>Login Page</div>;

const renderProtectedRoute = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginComponent />} />
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <TestComponent />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should show loading state while checking authentication', () => {
    vi.spyOn(authAPI, 'getCurrentUser').mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );
    localStorage.setItem('vibeqa_token', 'fake-token');

    window.history.pushState({}, '', '/protected');
    renderProtectedRoute();

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should redirect to login when not authenticated', async () => {
    vi.spyOn(authAPI, 'getCurrentUser').mockRejectedValue(new Error('Unauthorized'));

    window.history.pushState({}, '', '/protected');
    renderProtectedRoute();

    await screen.findByText(/login page/i);
    expect(screen.queryByText(/protected content/i)).not.toBeInTheDocument();
  });

  it('should render children when authenticated', async () => {
    vi.spyOn(authAPI, 'getCurrentUser').mockResolvedValue({
      data: {
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
      },
      meta: {
        requestId: 'req-123',
        timestamp: '2026-01-06T12:00:00Z',
      },
    });
    localStorage.setItem('vibeqa_token', 'valid-token');

    window.history.pushState({}, '', '/protected');
    renderProtectedRoute();

    await screen.findByText(/protected content/i);
    expect(screen.queryByText(/login page/i)).not.toBeInTheDocument();
  });

  it('should redirect when token is invalid', async () => {
    vi.spyOn(authAPI, 'getCurrentUser').mockRejectedValue({
      response: { status: 401 },
    });
    localStorage.setItem('vibeqa_token', 'invalid-token');

    window.history.pushState({}, '', '/protected');
    renderProtectedRoute();

    await screen.findByText(/login page/i);
    expect(localStorage.getItem('vibeqa_token')).toBeNull();
  });
});
