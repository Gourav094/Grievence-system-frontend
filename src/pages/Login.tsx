import React, { useState, useRef } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/Layout/MainLayout';
import ReCAPTCHA from 'react-google-recaptcha';

const Login = () => {
  const { user, login, isLoading, error: authError } = useAuth();
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const emailRef = useRef<HTMLInputElement>(null);

  // Auto-focus on email field
  React.useEffect(() => {
    if (emailRef.current) {
      emailRef.current.focus();
    }
  }, []);

  // Track failed attempts for lockout/rate limiting
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const MAX_ATTEMPTS = 5;
  const LOCKOUT_TIME = 60 * 1000; // 1 minute
  const lockoutTimer = useRef<NodeJS.Timeout | null>(null);

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleCaptchaChange = (token: string | null) => {
    if (!token) {
      setFormError('CAPTCHA expired. Please try again.');
    }
    setCaptchaToken(token);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!captchaToken) {
      setFormError('Please complete the CAPTCHA.');
      return;
    }

    if (isLocked) {
      setFormError('Account temporarily locked due to too many failed attempts. Please try again later.');
      return;
    }

    if (!email || !password) {
      setFormError('Please fill in all fields');
      return;
    }

    try {
      const success = await login(email, password, role, captchaToken);
      if (success) {
        setFailedAttempts(0);
        toast({
          title: "Login successful!",
          description: "Welcome to the Grievance Management System",
        });
        navigate('/dashboard');
      } else {
        setFailedAttempts(prev => prev + 1);
        if (failedAttempts + 1 >= MAX_ATTEMPTS) {
          setIsLocked(true);
          setFormError('Account temporarily locked due to too many failed attempts. Please try again in 1 minute.');
          lockoutTimer.current = setTimeout(() => {
            setIsLocked(false);
            setFailedAttempts(0);
          }, LOCKOUT_TIME);
        } else {
          setFormError(authError || 'Invalid credentials. Please try again.');
        }
      }
    } catch (error) {
      setFailedAttempts(prev => prev + 1);
      setFormError('A network or server error occurred. Please try again.');
      console.error(error);
    }
  };

  // Clean up lockout timer
  React.useEffect(() => {
    return () => {
      if (lockoutTimer.current) clearTimeout(lockoutTimer.current);
    };
  }, []);

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
            <div id="login-error" className="bg-red-50 text-red-800 p-3 rounded-md mb-4 text-sm" role="alert">
              {formError}
              {failedAttempts > 0 && !isLocked && (
                <div className="mt-1 text-xs text-red-600">Failed attempts: {failedAttempts} / {MAX_ATTEMPTS}</div>
              )}
            </div>
          )}

          {authError && !formError && (
            <div className="bg-yellow-50 text-yellow-800 p-3 rounded-md mb-4 text-sm" role="alert">
              {authError.includes('unauthorized')
                ? 'Invalid credentials. Please check your email and password.'
                : authError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
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
                aria-describedby="login-error"
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
                aria-describedby="login-error"
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

            <div className="mt-4">
              <ReCAPTCHA
                sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY!}
                onChange={handleCaptchaChange}
              />
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
                <p>user@gmail.com</p>
                <p>user</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Login;
