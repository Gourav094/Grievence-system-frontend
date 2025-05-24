
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import MainLayout from '@/components/Layout/MainLayout';
import { 
  FileText, 
  ListChecks, 
  Search, 
  Clock, 
  CheckCircle, 
  Users, 
  AlertTriangle 
} from 'lucide-react';
import { 
  getAllGrievances, 
  getGrievancesByUser 
} from '@/services/grievanceService';
import { grievanceApi } from '@/services/api';

const Dashboard = () => {
  const { user } = useAuth();
  console.log("user info from dashboard", user);
  // Get grievances based on user role
  // const grievances = user?.role === 'admin' ? getAllGrievances() : getGrievancesByUser(user?.email || '');
  const [grievances, setGrievances] = React.useState([]);
  useEffect(() => {
    const fetchGrievances = async () => {
      try {
        const data = await grievanceApi.getAllGrievances();
        console.log("Fetched grievances:", data);
        setGrievances(data);
      } catch (error) {
        console.error("Error fetching grievances:", error);
      }
    };

    fetchGrievances();
  }
  , []);

  console.log("grievances from dashboard", grievances);
  const stats = {
    total: grievances.length,
    pending: grievances.filter(g => g.status === 'pending').length,
    inProgress: grievances.filter(g => g.status === 'in-progress').length,
    resolved: grievances.filter(g => g.status === 'resolved').length
  };

  const adminCards = [
    {
      title: "All Grievances",
      description: `${stats.total} total grievances`,
      icon: <ListChecks size={32} />,
      link: "/grievances",
      color: "bg-gradient-to-br from-primary to-blue-400"
    },
    {
      title: "Pending Review",
      description: `${stats.pending} grievances waiting`,
      icon: <Clock size={32} />,
      link: "/grievances?status=pending",
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

  return (
    <MainLayout requireAuth>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Welcome, {user?.name}</h1>
        <p className="text-muted-foreground">
          {user?.role === 'admin' 
            ? "Manage and respond to user grievances from your admin dashboard"
            : "Submit and track your grievances in one place"
          }
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <Link to={card.link} key={index}>
            <div className={`dashboard-card p-6 text-white ${card.color}`}>
              <div className="dashboard-card-icon">
                {card.icon}
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">{card.title}</h3>
                <p className="text-white/90">{card.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {user?.role === 'admin' && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Recent Grievances</h2>
          <div className="bg-card rounded-lg shadow border border-border overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Assigned to</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...grievances]
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 5)
                    .map((grievance) => (
                  <tr key={grievance.id} className="border-b border-border hover:bg-muted/50">
                    <td className="px-4 py-3">{grievance.id}</td>
                    <td className="px-4 py-3">{grievance.title}</td>
                    <td className="px-4 py-3">{grievance.createdBy}</td>
                    <td className="px-4 py-3">{grievance.assignedTo}</td>
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
                ))}
                {grievances.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      No grievances found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Dashboard;
