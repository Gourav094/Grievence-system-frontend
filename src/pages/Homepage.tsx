
import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { FileText, CheckCircle, MessageSquare, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const Homepage = () => {
  const { user, login, isLoading, error: authError } = useAuth();
  if (user) {
      return <Navigate to="/dashboard" replace />;
    }
  return (
    
    <MainLayout>
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl mb-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Grievance Management Made Simple
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            Submit, track and resolve your complaints with our easy-to-use grievance management system.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button size="lg">
                Log In to Account
              </Button>
            </Link>
            <Link to="/signup">
              <Button variant="outline" size="lg">
                Create an Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our grievance management system makes it easy to submit and track your concerns until they're resolved.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
            <div className="bg-primary/10 w-12 h-12 flex items-center justify-center rounded-full mb-4">
              <FileText className="text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Submit</h3>
            <p className="text-muted-foreground">
              Fill out our simple form to submit your grievance with all necessary details.
            </p>
          </div>
          
          <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
            <div className="bg-primary/10 w-12 h-12 flex items-center justify-center rounded-full mb-4">
              <Search className="text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Track</h3>
            <p className="text-muted-foreground">
              Follow the progress of your grievance through our real-time tracking system.
            </p>
          </div>
          
          <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
            <div className="bg-primary/10 w-12 h-12 flex items-center justify-center rounded-full mb-4">
              <CheckCircle className="text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Resolve</h3>
            <p className="text-muted-foreground">
              Receive timely updates and resolutions to your submitted grievances.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 bg-muted rounded-xl my-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">What Our Users Say</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                <span className="font-bold text-primary">JD</span>
              </div>
              <div>
                <h4 className="font-bold">Jane Doe</h4>
                <p className="text-sm text-muted-foreground">User</p>
              </div>
            </div>
            <p className="text-muted-foreground">
              "I was impressed by how quickly my complaint was addressed. The tracking system kept me informed every step of the way."
            </p>
          </div>

          <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                <span className="font-bold text-primary">MS</span>
              </div>
              <div>
                <h4 className="font-bold">Mark Smith</h4>
                <p className="text-sm text-muted-foreground">User</p>
              </div>
            </div>
            <p className="text-muted-foreground">
              "This platform made it easy to submit my grievance and communicate with support. My issue was resolved within days."
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8">
            Create an account today and start submitting your grievances. Our team is ready to assist you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg">
                Create an Account
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg">
                Log In
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Homepage;
