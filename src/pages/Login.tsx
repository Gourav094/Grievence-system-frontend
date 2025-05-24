
import React, { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/Layout/MainLayout';

const Login = () => {
  const { user, login, isLoading, error: authError } = useAuth();
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!email || !password) {
      setFormError('Please fill in all fields');
      return;
    }

    try {
      const success = await login(email, password, role);
      
      if (success) {
        toast({
          title: "Login successful!",
          description: "Welcome to the Grievance Management System",
        });
        navigate('/dashboard');
      } else {
        setFormError(authError || 'Invalid credentials. Please try again.');
      }
    } catch (error) {
      setFormError('An error occurred. Please try again.');
      console.error(error);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-md mx-auto mt-10">
        <div className="bg-card shadow-lg rounded-lg p-8 border border-border">
          <div className="text-center mb-8">
            <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <LogIn className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Login</h1>
            <p className="text-muted-foreground">Access your grievance portal account</p>
          </div>

          {formError && (
            <div className="bg-red-50 text-red-800 p-3 rounded-md mb-4 text-sm">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-input-wrapper">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="your@email.com"
                disabled={isLoading}
              />
            </div>

            <div className="form-input-wrapper">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="********"
                disabled={isLoading}
              />
            </div>
            <div className="form-input-wrapper">
              <label className="form-label">Login As</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="user"
                    checked={role === 'user'}
                    onChange={() => setRole('user')}
                    className="mr-2"
                    disabled={isLoading}
                  />
                  User
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="admin"
                    checked={role === 'admin'}
                    onChange={() => setRole('admin')}
                    className="mr-2"
                    disabled={isLoading}
                  />
                  Admin
                </label>
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full mt-6"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Demo credentials:
            </p>
            <div className="grid grid-cols-2 gap-4 mt-2 text-xs">
              <div className="bg-muted p-2 rounded">
                <p className="font-semibold">Admin</p>
                <p>admin@gmail.com</p>
                <p>admin</p>
              </div>
              <div className="bg-muted p-2 rounded">
                <p className="font-semibold">User</p>
                <p>user@google.com</p>
                <p>user123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Login;
