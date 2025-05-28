import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import MainLayout from '@/components/Layout/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { grievanceApi } from '@/services/api';
import { GrievanceStatus } from '@/services/grievanceService';
import { Button } from '@/components/ui/button';
import { Search, FileText, Filter } from 'lucide-react';

const GrievanceList = () => {
  const { user } = useAuth();

  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') as GrievanceStatus | null;

  const [searchTerm, setSearchTerm] = useState('');
  const [currentStatus, setCurrentStatus] = useState<GrievanceStatus | 'all'>(statusFilter || 'all');

  const { data: grievances = [], isLoading, error } = useQuery({
    queryKey: ['grievances'],
    queryFn: () => grievanceApi.getAllGrievances(user.name),
  });

  const filteredGrievances = useMemo(() => {
    return grievances.filter((grievance: any) => {
      const matchesSearch =
        grievance.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grievance.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grievance.id?.toString().toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = currentStatus === 'all' || grievance.status === currentStatus;

      return matchesSearch && matchesStatus;
    });
  }, [grievances, searchTerm, currentStatus]);

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      try {
        const results = await grievanceApi.searchGrievances(searchTerm);
        console.log('Search results:', results);
      } catch (error) {
        console.error('Error searching:', error);
      }
    }
  };

  return (
    <MainLayout requireAuth>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{user?.role === 'admin' ? 'All Grievances' : 'My Grievances'}</h1>
          <p className="text-muted-foreground">Manage and track all grievances in the system</p>
        </div>

        {user?.role === 'user' && (
          <Link to="/grievances/new">
            <Button>
              <FileText className="mr-2 h-4 w-4" />
              New Grievance
            </Button>
          </Link>
        )}
      </div>

      <div className="bg-card rounded-lg shadow border border-border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search grievances..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-muted-foreground" />
            <select
              value={currentStatus}
              onChange={(e) => setCurrentStatus(e.target.value as GrievanceStatus | 'all')}
              className="form-input py-2 px-3 rounded-md border border-border text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-pulse text-lg">Loading grievances...</div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-lg text-red-700 mb-6">
          Failed to load grievances. Please try again later.
        </div>
      ) : (
        <div className="bg-card rounded-lg shadow border border-border overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Title</th>
                {user?.role === 'admin' && <th className="px-4 py-3">Created By</th>}
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGrievances.length > 0 ? (
                filteredGrievances.map((grievance: any) => (
                  <tr key={grievance.id} className="border-b border-border hover:bg-muted/50">
                    <td className="px-4 py-3">{grievance.id}</td>
                    <td className="px-4 py-3">{grievance.title}</td>
                    {user?.role === 'admin' && (
                      <td className="px-4 py-3">
                        {grievance.userName || grievance.createdBy || 'Unknown'}
                      </td>
                    )}
                    <td className="px-4 py-3">{grievance.category}</td>
                    <td className="px-4 py-3">
                      <span className={`
                        ${grievance.status === 'pending' ? 'grievance-status-pending' : ''}
                        ${grievance.status === 'in-progress' ? 'grievance-status-inprogress' : ''}
                        ${grievance.status === 'resolved' ? 'grievance-status-resolved' : ''}
                        ${grievance.status === 'rejected' ? 'grievance-status-rejected' : ''}
                      `}>
                        {grievance.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {new Date(grievance.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <Link 
                        to={`/grievances/${grievance.id}`}
                        className="text-primary hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={user?.role === 'admin' ? 7 : 6} className="px-4 py-8 text-center text-muted-foreground">
                    No grievances found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </MainLayout>
  );
};

export default GrievanceList;
