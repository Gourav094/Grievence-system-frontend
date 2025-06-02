
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LogOut, User } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { DialogFooter, DialogHeader } from '../ui/dialog';

const Header = () => {
  const { user, logout } = useAuth();
  const [userDetailsModalOpen, setUserDetailsModalOpen] = useState(false);

  const handleUserDetailsClick = () => {
    setUserDetailsModalOpen(true);
  };

  return (
    <>
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">
            Grievance Portal
          </Link>
          
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 cursor-pointer hover:bg-primary-foreground/10 p-2 rounded-md active:bg-primary-foreground/30" onClick={handleUserDetailsClick}>
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
      {/* User Details Dialog */}
      <Dialog.Root open={userDetailsModalOpen} onOpenChange={setUserDetailsModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 z-40" />
          <Dialog.Content className="fixed top-1/2 left-1/2 max-w-lg h-auto w-full bg-white p-6 rounded-md shadow-lg transform -translate-x-1/2 -translate-y-1/2 z-40">
            <Dialog.Title className="text-lg font-bold mb-2">User Details</Dialog.Title>
            <Dialog.Description className="mb-4 text-sm text-gray-500">
              Here are your account details.
            </Dialog.Description>
            <div className="mb-4">
              <p><strong>Name:</strong> {user?.name || "Unknown"}</p>
              <p><strong>Email:</strong> {user?.email || "Unknown"}</p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setUserDetailsModalOpen(false)}
                className="px-4 py-2 rounded bg-muted hover:bg-muted/80"
              >
                Close
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};

export default Header;
