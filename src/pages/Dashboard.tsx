import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import MainLayout from '@/components/Layout/MainLayout';
import { 
  FileText, 
  ListChecks, 
  Search, 
  Clock, 
  CheckCircle, 
  Users, 
  AlertTriangle,
  Eye,
  UserPlus,
  BarChart3,
  PieChart
} from 'lucide-react';
import { 
  getAllGrievances, 
  getGrievancesByUser 
} from '@/services/grievanceService';
import { grievanceApi } from '@/services/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';

import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  // Use React Query for grievances
  const {
    data: grievances = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['grievances', user?.role, user?.name],
    queryFn: () =>
      user?.role === 'admin'
        ? grievanceApi.getAllGrievances()
        : grievanceApi.getAllGrievances(user?.name),
    enabled: !!user,
    staleTime: 1000 * 60 * 3, // Cache data for 5 minutes
    refetchOnWindowFocus: true, // Refetch data when the window regains focus
    refetchOnReconnect: true, 
    retry: 0 // Disable automatic retries
  });

  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');

  // Filtered grievances for admin table
  const filteredGrievances = React.useMemo(() => {
    return grievances.filter((g) => {
      const matchesSearch =
        !searchTerm ||
        g.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.createdBy?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || g.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [grievances, searchTerm, statusFilter]);

  const stats = {
    total: grievances.length,
    open: grievances.filter(g => g.status === 'open').length,
    inProgress: grievances.filter(g => g.status === 'in-progress').length,
    resolved: grievances.filter(g => g.status === 'resolved').length
  };

  // Pie chart data for status distribution
  const pieData = [
    { label: 'open', value: stats.open, color: '#fde047' },
    { label: 'In Progress', value: stats.inProgress, color: '#60a5fa' },
    { label: 'Resolved', value: stats.resolved, color: '#4ade80' },
    { label: 'Rejected', value: grievances.filter(g => g.status === 'rejected').length, color: '#f87171' },
  ];
  const totalPie = pieData.reduce((sum, d) => sum + d.value, 0);

  const adminCards = [
    {
      title: "All Grievances",
      description: `${stats.total} total grievances`,
      icon: <ListChecks size={32} />,
      link: "/grievances",
      color: "bg-gradient-to-br from-primary to-blue-400"
    },
    {
      title: "Open Review",
      description: `${stats.open} grievances waiting`,
      icon: <Clock size={32} />,
      link: "/grievances?status=open",
      // color: "bg-gradient-to-br from-yellow-300 to-orange-400"
      color: "bg-gradient-to-br from-[#fecf9f] via-[#fe7096] to-[#fd7cbf]"

    },
    {
      title: "In Progress",
      description: `${stats.inProgress} grievances`,
      icon: <AlertTriangle size={32} />,
      link: "/grievances?status=in-progress",
      color: "bg-gradient-to-br from-blue-400 to-blue-500"
    },
    {
      title: "Resolved Cases",
      description: `${stats.resolved} grievances resolved`,
      icon: <CheckCircle size={32} />,
      link: "/grievances?status=resolved",
      color: "bg-gradient-to-br from-green-300 to-blue-500"
    }
  ];

  const userCards = [
    {
      title: "Submit Grievance",
      description: "File a new complaint or issue",
      icon: <FileText size={32} />,
      link: "/grievances/new",
      color: "bg-gradient-to-br from-primary to-blue-400"
    },
    {
      title: "My Grievances",
      description: `${stats.total} total grievances`,
      icon: <ListChecks size={32} />,
      link: "/grievances",
      color: "bg-gradient-to-br from-blue-500 to-blue-700"
    },
    {
      title: "Track Status",
      description: "Check the status of your complaints",
      icon: <Search size={32} />,
      link: "/grievances/track",
      color: "bg-gradient-to-br from-purple-500 to-purple-700"
    }
  ];

  const cards = user?.role === 'admin' ? adminCards : userCards;

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [assignTo, setAssignTo] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState('');

  // Replace dummy adminList with real API call and state
  const [adminList, setAdminList] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);

  React.useEffect(() => {
    if (user?.role && user.role.toLowerCase() === 'admin') {
      setAdminLoading(true);
      import('@/services/api').then(({ adminApi }) => {
        adminApi.getAllAdmins()
          .then(setAdminList)
          .catch(() => setAdminList([]))
          .finally(() => setAdminLoading(false));
      });
    }
  }, [user]);

  // Assign handler (replace with real API call)
  const handleAssign = async () => {
    setAssignLoading(true);
    setAssignError('');
    try {

      await grievanceApi.updateGrievance(selectedGrievance.id, { assignedTo: assignTo });
      setAssignLoading(false);
      setAssignModalOpen(false);
      setAssignTo('');
      setSelectedGrievance(null);
      // Optionally refetch grievances or show a toast
      queryClient.invalidateQueries({ queryKey: ['grievances'] });
      toast({
        description: `Grievance has been successfully assigned to ${assignTo}.`,
      });


    } catch (e) {
      setAssignError('Failed to assign.');
      setAssignLoading(false);
    }
  };

  return (
    <MainLayout requireAuth allowedRoles={["admin", "user"]}>
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold mb-2 tracking-tight text-primary drop-shadow">Welcome, {user?.name}</h1>
        <p className="text-lg text-muted-foreground mb-2">
          {user?.role === 'admin' 
            ? "Manage and respond to user grievances from your admin dashboard"
            : "Submit and track your grievances in one place"
          }
        </p>
      </div>

      {/* --- Analytics Section --- */}
      {user?.role === 'admin' && (
        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Analytics Card (commented out as per request)
            <div className="bg-white rounded-2xl shadow-xl border border-border p-8 flex flex-col gap-6 items-center relative overflow-hidden">
              ...existing analytics card code...
            </div>
            */}
            {/* Recent Activity Feed removed as per previous request */}
          </div>
        </section>
      )}

      {user?.role !== 'admin' && (
        <>
          <h2 className="text-xl font-bold mb-4 text-primary/90">User Analytics</h2>
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl shadow p-6 flex flex-col items-center border border-border">
              <ListChecks className="text-primary mb-2" size={36} />
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-muted-foreground">Total Grievances</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl shadow p-6 flex flex-col items-center border border-border">
              <AlertTriangle className="text-yellow-600 mb-2" size={36} />
              <div className="text-2xl font-bold">{stats.inProgress}</div>
              <div className="text-muted-foreground">In Progress</div>
            </div>
            <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-xl shadow p-6 flex flex-col items-center border border-border">
              <CheckCircle className="text-green-600 mb-2" size={36} />
              <div className="text-2xl font-bold">{stats.resolved}</div>
              <div className="text-muted-foreground">Resolved</div>
            </div>
          </div>
          {/* <div className="mb-10 flex flex-col md:flex-row gap-4 items-center justify-center">
            <Link to="/grievances/new" className="inline-block">
              <button className="bg-primary text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-primary/90 transition">+ Submit New Grievance</button>
            </Link>
            <Link to="/grievances/track" className="inline-block w-full md:w-auto">
              <button className="bg-purple-100 text-purple-700 px-6 py-3 rounded-lg font-semibold shadow hover:bg-purple-200 border border-purple-400 transition w-full md:w-auto flex items-center justify-center gap-2">
                <Search size={20} /> Track Status
              </button>
            </Link>
          </div> */}
        </>
      )}

      {/* Card grid remains for both roles */}
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-4 text-primary/90">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
          {cards.map((card, index) => (
            <Link to={card.link} key={index} className="focus:outline-none">
              <div className={`relative group rounded-2xl p-7 shadow-lg border border-border bg-gradient-to-br ${card.color} transition-transform duration-200 hover:scale-105 hover:shadow-2xl overflow-hidden`}>
                <div className="absolute right-4 top-4 opacity-10 text-[80px] pointer-events-none select-none">
                  {card.icon}
                </div>
                <div className="relative z-10 flex flex-col items-start">
                  <div className="mb-4 flex items-center justify-center w-12 h-12 rounded-full bg-white/80 shadow">
                    {React.cloneElement(card.icon, { size: 32, className: 'text-primary' })}
                  </div>
                  <h3 className="text-2xl font-bold mb-1 text-white drop-shadow-lg">{card.title}</h3>
                  <p className="text-white/90 text-base font-medium drop-shadow">{card.description}</p>
                </div>
              </div>
            </Link>
          ))}
          {/* Only show Manage Users card to admin */}
          {user?.role === 'admin' && (
            <div className="card bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-md rounded-lg p-6 hover:shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer" onClick={() => navigate('/user-list')}>
              <h2 className="text-xl font-bold mb-2">Manage Users</h2>
              <p>View and manage all users</p>
            </div>
          )}
        </div>
      </div>

      {/* Admin: Modern Grievance Table with Filters and Actions */}
      {user?.role === 'admin' && (
        <div className="mt-10">
          {/* Dashboard enhancement: Analytics bar */}
          <div className="flex flex-col gap-2 mb-6">
            <div className="flex items-center gap-2 bg-muted rounded-lg px-4 py-2 shadow">
              <BarChart3 className="text-primary" size={20} />
              <span className="font-semibold">Analytics:</span>
              <span className="inline-flex items-center gap-1 text-xs font-medium bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Open: {stats.open}</span>
              <span className="inline-flex items-center gap-1 text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">In Progress: {stats.inProgress}</span>
              <span className="inline-flex items-center gap-1 text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded">Resolved: {stats.resolved}</span>
              <span className="inline-flex items-center gap-1 text-xs font-medium bg-red-100 text-red-800 px-2 py-1 rounded">Rejected: {grievances.filter(g => g.status === 'rejected').length}</span>
            </div>
            {/* Horizontal bar chart visualization */}
            <div className="w-full max-w-xl bg-gray-100 rounded h-4 flex overflow-hidden border border-border mt-2">
              <div
                className="bg-yellow-300 h-4 transition-all duration-500"
                style={{ width: `${stats.total ? (stats.open / stats.total) * 100 : 0}%` }}
                title={`Open: ${stats.open}`}
              />
              <div
                className="bg-blue-400 h-4 transition-all duration-500"
                style={{ width: `${stats.total ? (stats.inProgress / stats.total) * 100 : 0}%` }}
                title={`In Progress: ${stats.inProgress}`}
              />
              <div
                className="bg-green-400 h-4 transition-all duration-500"
                style={{ width: `${stats.total ? (stats.resolved / stats.total) * 100 : 0}%` }}
                title={`Resolved: ${stats.resolved}`}
              />
              <div
                className="bg-red-400 h-4 transition-all duration-500"
                style={{ width: `${stats.total ? (grievances.filter(g => g.status === 'rejected').length / stats.total) * 100 : 0}%` }}
                title={`Rejected: ${grievances.filter(g => g.status === 'rejected').length}`}
              />
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <h2 className="text-2xl font-bold">All Grievances</h2>
            <div className="flex gap-2 flex-wrap">
              <input
                type="text"
                placeholder="Search by title or user..."
                className="border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <select
                className="border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
              {/* Add more filters if needed */}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow border border-border overflow-x-auto">
            {isLoading ? (
              <div className="p-8 text-center text-lg">Loading grievances...</div>
            ) : error ? (
              <div className="p-8 text-center text-red-600">No Grievance Found.</div>
            ) : (
              <table className="w-full text-left min-w-[900px]">
                <thead>
                  <tr className="bg-muted text-muted-foreground text-sm">
                    <th className="px-4 py-3 font-semibold">ID</th>
                    <th className="px-4 py-3 font-semibold">Title</th>
                    <th className="px-4 py-3 font-semibold">User</th>
                    <th className="px-4 py-3 font-semibold">Assigned to</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Created</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[...filteredGrievances]
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((grievance) => (
                      <tr key={grievance.id} className="border-b border-border hover:bg-blue-50 transition">
                        <td className="px-4 py-3 font-mono text-xs">{grievance.id}</td>
                        <td className="px-4 py-3 font-medium max-w-[200px] truncate">{grievance.title}</td>
                        <td className="px-4 py-3">{grievance.createdBy}</td>
                        <td className="px-4 py-3">{grievance.assignedTo || <span className='text-muted-foreground'>Unassigned</span>}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold 
                            ${grievance.status === 'open' ? 'bg-yellow-100 text-yellow-800' : ''}
                            ${grievance.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : ''}
                            ${grievance.status === 'resolved' ? 'bg-green-100 text-green-800' : ''}
                            ${grievance.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                          `}>
                            {grievance.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs">{new Date(grievance.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3 flex gap-5">
                          <Link to={`/grievances/${grievance.id}`} className="text-primary hover:scale-110 transition duration-0" title="View">
                            <Eye size={20} />
                          </Link>
                          <button
                            className="text-blue-600 hover:scale-110 transition duration-0"
                            title="Assign"
                            onClick={() => { setSelectedGrievance(grievance); setAssignModalOpen(true); }}
                          >
                            <UserPlus size={20} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  {filteredGrievances.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                        No grievances found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Assign Modal */}
      <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Assign Grievance
              {selectedGrievance && (
                <span className="text-muted-foreground text-sm ml-2">#{selectedGrievance.id}</span>
              )}
            </DialogTitle>
            <DialogDescription>
              Assign this grievance to an admin for resolution.
            </DialogDescription>
          </DialogHeader>
          <div className="mb-4">
            <div className="font-semibold mb-2">Grievance:<span className="text-primary">{selectedGrievance?.title}</span></div>
            <label className="block mb-2 text-sm">Assign to:</label>
            {adminLoading ? (
              <div className="text-muted-foreground text-sm py-2">Loading admins...</div>
            ) : (
              <select
                className="w-full border rounded px-3 py-2"
                value={assignTo}
                onChange={e => setAssignTo(e.target.value)}
              >
                <option value="">Select admin</option>
                {adminList.map(admin => (
                  <option key={admin.id} value={admin.username}>{admin.username}</option>
                ))}
              </select>
            )}
            {assignError && <div className="text-red-600 text-xs mt-2">{assignError}</div>}
          </div>
          <DialogFooter>
            <button className="px-4 py-2 rounded bg-muted" onClick={() => setAssignModalOpen(false)} disabled={assignLoading}>Cancel</button>
            <button className="px-4 py-2 rounded bg-primary text-white" onClick={handleAssign} disabled={assignLoading || !assignTo}>
              {assignLoading ? 'Assigning...' : 'Assign'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Dashboard;

/*
// --- Suggestions for further dashboard UI enhancements ---
// 1. Recent Activity Feed: Show latest grievance updates, assignments, or comments.
// 2. Quick Actions: Buttons for common admin tasks (e.g., Assign All, Export CSV, Bulk Status Update).
// 3. Notifications/Alerts: Banner for unresolved or overdue grievances.
// 4. User Leaderboard: Top users by number of grievances submitted/resolved.
// 5. Trends Chart: Line or bar chart showing grievances over time (week/month).
// 6. Export/Download: Button to export grievances as CSV/Excel.
// 7. Customizable Widgets: Allow admins to add/remove dashboard widgets.
// 8. Filter by Date Range: Add date pickers to filter grievances by creation date.
// 9. Status Pie Chart: Visualize status distribution as a pie chart.
// 10. Assign Modal: Modal dialog for assigning grievances to admins.
*/
