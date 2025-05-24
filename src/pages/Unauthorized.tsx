
import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          You don't have permission to access the requested page. Please contact an administrator if you believe this is an error.
        </p>
        <div className="space-x-4">
          <Button onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
          <Button variant="outline" onClick={() => navigate('/')}>
            Go to Home
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default Unauthorized;
