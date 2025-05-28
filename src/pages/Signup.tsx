
import React, { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/Layout/MainLayout';

const Signup = () => {
  const { user, signup, isLoading, error: authError } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  
  // Redirect if already logged in
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    if (!name || !email || !password || !confirmPassword) {
      setFormError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    
    try {
      const success = await signup(name, email, password);
      console.log("success from signup --> ", success);
      if (success) {
        toast({
          title: "Registration successful!",
          description: "Welcome to the Grievance Management System",
        });
        navigate('/dashboard');
      } else {
        console.log("error from signup --> ", authError);
        setFormError(authError || 'This email is already registered. Please use a different email or login.');
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
              <UserPlus className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Sign Up</h1>
            <p className="text-muted-foreground">Create your grievance portal account</p>
          </div>

          {formError && (
            <div className="bg-red-50 text-red-800 p-3 rounded-md mb-4 text-sm">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-input-wrapper">
              <label htmlFor="name" className="form-label">Full Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                placeholder="John Doe"
                disabled={isLoading}
              />
            </div>

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
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input"
                placeholder="********"
                disabled={isLoading}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full mt-6"
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Signup;
