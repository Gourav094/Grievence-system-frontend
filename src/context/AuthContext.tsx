
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/services/api';
import Cookies from 'js-cookie';

interface User {
  name: string;
  email: string;
  role?: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string, role?: 'admin' | 'user') => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
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

  const login = async (email: string, password: string, role:string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const regToken = Cookies.get('auth_token');
      console.log('Registration token:', regToken);

      const response = await authApi.login(email, password,role);

      if (response.token) {
        // Extract token (removing 'Bearer ' if present)
        const token = response.token.startsWith('Bearer ') 
          ? response.token.substring(7) 
          : response.token;

      // Store the token in a cookie
      Cookies.set('auth_token', token, { expires: 7 }); // Expires in 7 days

      // Format and store user info
      const userData: User = {
        name: response.username, // Use `username` from the response
        email: response.email,
        role: response.role,
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

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authApi.register(name, email, password);
      
      if (response.token) {
        // Extract token (removing 'Bearer ' if present)
        const token = response.token.startsWith('Bearer ') 
          ? response.token.substring(7) 
          : response.token;
        
        // Store registration token in a cookie
        Cookies.set('reg_token', token, { expires: 1 }); // Expires in 1 day
        
        // Auto-login after successful signup
        return await login(email, password, 'user');
      } else if (response.success) {
        // No token but success flag is true
        return await login(email, password, 'user');
      } else {
        throw new Error('Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError('Registration failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
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
