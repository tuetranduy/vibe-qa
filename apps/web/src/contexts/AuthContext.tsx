import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as authAPI from '../services/auth';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('vibeqa_token');
    if (token) {
      authAPI.getCurrentUser()
        .then((response) => {
          setUser(response.data.user);
        })
        .catch(() => {
          localStorage.removeItem('vibeqa_token');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authAPI.login(email, password);
    localStorage.setItem('vibeqa_token', response.data.token);
    setUser(response.data.user);
  };

  const signup = async (email: string, password: string, name: string) => {
    const response = await authAPI.signup(email, password, name);
    localStorage.setItem('vibeqa_token', response.data.token);
    setUser(response.data.user);
  };

  const logout = () => {
    authAPI.logout().catch(() => {
      // Proceed with client-side logout even if API call fails
    });
    localStorage.removeItem('vibeqa_token');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
