import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Header from './Header';

interface MainLayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
  allowedRoles?: ("admin" | "user")[];
}

const MainLayout = ({ 
  children, 
  requireAuth = false,
  allowedRoles = ["admin", "user"] 
}: MainLayoutProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-xl">Loading...</div>
      </div>
    );
  }

  // If auth is required and user is not logged in, redirect to login
  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  // If user is logged in but not allowed based on role (case-insensitive for admin)
  if (user && requireAuth && !allowedRoles.map(r => r.toLowerCase()).includes(user.role?.toLowerCase())) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>
      <footer className="bg-muted py-4 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Grievance Management System
      </footer>
    </div>
  );
};

export default MainLayout;
