
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import { getGrievanceById } from '@/services/grievanceService';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

const GrievanceTrack = () => {
  const navigate = useNavigate();
  const [grievanceId, setGrievanceId] = useState('');
  const [error, setError] = useState('');

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!grievanceId.trim()) {
      setError('Please enter a grievance ID');
      return;
    }

    const grievance = getGrievanceById(grievanceId.trim());
    // console.log("grievance from track --> ", grievanceId);
    if (grievanceId) {
      navigate(`/grievances/${grievanceId}`);
    } else {
      setError('Grievance not found. Please check the ID and try again.');
    }
  };

  return (
    <MainLayout requireAuth>
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <Search className="h-16 w-16 mx-auto text-primary mb-4" />
          <h1 className="text-2xl font-bold mb-2">Track Your Grievance</h1>
          <p className="text-muted-foreground">
            Enter your grievance ID to check its current status
          </p>
        </div>

        <div className="bg-card shadow-lg rounded-lg border border-border p-6">
          {error && (
            <div className="bg-red-50 text-red-800 p-4 rounded-md mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleTrack}>
            <div className="form-input-wrapper">
              <label htmlFor="grievanceId" className="form-label">
                Grievance ID
              </label>
              <input
                id="grievanceId"
                type="text"
                value={grievanceId}
                onChange={(e) => setGrievanceId(e.target.value)}
                className="form-input"
                placeholder="e.g. g1, g2, etc."
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter the ID that was provided when you submitted your grievance
              </p>
            </div>

            <Button type="submit" className="w-full mt-4">
              <Search className="mr-2 h-4 w-4" />
              Track Grievance
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="font-medium mb-2">Don't have your Grievance ID?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              You can view all your submitted grievances by visiting the "My Grievances" page.
            </p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/grievances')}
            >
              View All My Grievances
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default GrievanceTrack;
