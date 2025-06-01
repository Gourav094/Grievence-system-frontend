import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/services/api';
import Cookies from 'js-cookie';

interface User {
  name: string;
  email: string;
  role?: 'admin' | 'user';
  id: string; // Added id property to User interface
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string, role?: 'admin' | 'user', captchaToken?: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<any>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const token = Cookies.get('auth_token');
    const storedUser = localStorage.getItem('user');
    
    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error('Failed to parse stored user', e);
        localStorage.removeItem('user');
        Cookies.remove('auth_token');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role?: string, captchaToken?: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.login(email, password, role, captchaToken);

      if (response.token) {
        const token = response.token.startsWith('Bearer ')
          ? response.token.substring(7)
          : response.token;

        Cookies.set('auth_token', token, { expires: 7 });

        const userData: User = {
          name: response.username,
          email: response.email,
          role: response.role,
          id: response.id,
        };

        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        return true;
      } else {
        throw new Error('Login failed - no token received');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Invalid credentials. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<any> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.register(name, email, password);
      // If backend returns a message, treat as success
      if (response && typeof response === 'object' && 'message' in response && response.message) {
        setIsLoading(false);
        return { message: response.message };
      }
      // If backend returns a token (legacy/auto-login)
      if (response && response.token) {
        const token = response.token.startsWith('Bearer ')
          ? response.token.substring(7)
          : response.token;
        Cookies.set('reg_token', token, { expires: 1 });
        setIsLoading(false);
        // Optionally, auto-login here if you want
        // return await login(email, password, 'user');
        return { message: 'User registered successfully' };
      }
      setIsLoading(false);
      return { message: 'Registration failed. Please try again.' };
    } catch (error: any) {
      console.error('Signup error:', error);
      setError('Registration failed. Please try again.');
      setIsLoading(false);
      // Try to extract backend error message
      if (error.response && error.response.data && error.response.data.message) {
        return { message: error.response.data.message };
      }
      return { message: 'Registration failed. Please try again.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    Cookies.remove('auth_token');
    Cookies.remove('reg_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, error, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
