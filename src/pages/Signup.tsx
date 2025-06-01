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
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const [timer, setTimer] = useState(3);
  const MAX_ATTEMPTS = 5;
  const LOCKOUT_TIME = 60 * 1000; // 1 minute
  const lockoutTimer = React.useRef<NodeJS.Timeout | null>(null);

  // Auto-focus on email field
  const emailRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (emailRef.current) {
      emailRef.current.focus();
    }
  }, []);

  // Clean up lockout timer
  React.useEffect(() => {
    return () => {
      if (lockoutTimer.current) clearTimeout(lockoutTimer.current);
    };
  }, []);
  
  // Timer effect for redirect after success
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (successData && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    } else if (successData && timer === 0) {
      navigate('/login');
    }
    return () => clearInterval(interval);
  }, [successData, timer, navigate]);

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (isLocked) {
      setFormError('Account temporarily locked due to too many failed attempts. Please try again later.');
      return;
    }
    if (!name || !email || !password || !confirmPassword) {
      setFormError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    try {
      const result = await signup(name, email, password);
      let backendMessage = '';
      // Use a type guard function to avoid TS null errors
      function hasMessage(obj: unknown): obj is { message: string } {
        return (
          typeof obj === 'object' &&
          obj !== null &&
          'message' in obj &&
          typeof (obj as any).message === 'string'
        );
      }
      if (hasMessage(result)) {
        backendMessage = result.message;
      } else if (typeof result === 'string') {
        backendMessage = result;
      } else if (result === false) {
        backendMessage = '';
      }
      const msg = backendMessage.trim().toLowerCase();
      if (msg.includes('user registered successfully')) {
        setFailedAttempts(0);
        setSuccessData({
          message: backendMessage,
          username: name,
          email,
          role: 'user',
        });
        setTimer(3);
        setFormError('');
        return;
      }
      if (msg.includes('already exists') || msg.includes('duplicate') || msg.includes('taken')) {
        setFormError('This email is already registered. Please use a different email or login.');
        return;
      }
      if (backendMessage) {
        setFormError(backendMessage);
        return;
      }
      setFormError('Registration failed. Please try again.');
    } catch (error: any) {
      setFormError('A network or server error occurred. Please try again.');
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

          {successData ? (
            <div className="bg-green-50 text-green-800 p-4 rounded-md mb-4 text-sm whitespace-pre-line text-center">
              {successData.message}
              <br />Username: {successData.username}
              <br />Email: {successData.email}
              <br />Role: {successData.role}
              <br />Redirecting to login in {timer} second{timer !== 1 ? 's' : ''}...
            </div>
          ) : (
            <>
              {formError && (
                <div id="signup-error" className="bg-red-50 text-red-800 p-3 rounded-md mb-4 text-sm" role="alert">
                  {formError}
                </div>
              )}

              {authError && !formError && (
                <div className="bg-yellow-50 text-yellow-800 p-3 rounded-md mb-4 text-sm" role="alert">
                  {authError.includes('already exists') || authError.includes('duplicate')
                    ? 'This email is already registered. Please use a different email or login.'
                    : authError}
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
                    disabled={isLoading || isLocked}
                  />
                </div>

                <div className="form-input-wrapper">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    id="email"
                    type="email"
                    ref={emailRef}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                    placeholder="your@email.com"
                    disabled={isLoading || isLocked}
                    aria-invalid={!!formError}
                    aria-describedby="signup-error"
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
                    disabled={isLoading || isLocked}
                    aria-invalid={!!formError}
                    aria-describedby="signup-error"
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
                    disabled={isLoading || isLocked}
                    aria-invalid={!!formError}
                    aria-describedby="signup-error"
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
            </>
          )}

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
