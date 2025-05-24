
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LogOut, User } from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          Grievance Portal
        </Link>
        
        {user ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 cursor-pointer hover:bg-primary-foreground/10 p-2 rounded-md active:bg-primary-foreground/30">
              <User size={16} />
              <span>
                {user.name}
              </span>
            </div>
            <button 
              onClick={logout}
              className="flex items-center gap-1 px-3 py-1 rounded-md bg-primary-foreground text-primary hover:bg-opacity-90 transition-colors"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Link 
              to="/login" 
              className="px-4 py-1 rounded-md bg-primary-foreground text-primary hover:bg-opacity-90 transition-colors"
            >
              Login
            </Link>
            <Link 
              to="/signup" 
              className="px-4 py-1 rounded-md border border-primary-foreground hover:bg-primary-foreground/10 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
