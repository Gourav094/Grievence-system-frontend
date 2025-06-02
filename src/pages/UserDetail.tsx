import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import MainLayout from '@/components/Layout/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft } from 'lucide-react';

const UserDetail = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [updatedUser, setUpdatedUser] = useState({ username: '', email: '', role: '' });
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/admin/users/${id}`);
        setUser(response.data);
        setUpdatedUser(response.data);
      } catch (error) {
        toast({
          title: 'Error fetching user details',
          description: error.message,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, toast]);

  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:8080/api/admin/users/${id}`, updatedUser);
      toast({
        title: 'User updated successfully',
      });
      setEditing(false);
    } catch (error) {
      toast({
        title: 'Error updating user',
        description: error.message,
      });
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:8080/api/admin/users/${id}`);
      toast({
        title: 'User deleted successfully',
      });
      navigate('/user-list');
    } catch (error) {
      toast({
        title: 'Error deleting user',
        description: error.message,
      });
    }
  };

  if (!currentUser) return <MainLayout><div className="text-center py-20 text-lg text-muted-foreground">Loading...</div></MainLayout>;
  if (currentUser?.role !== 'admin') {
    return <MainLayout><div className="text-center text-red-500 py-20">Unauthorized: Only admins can access this page.</div></MainLayout>;
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto mt-10">
        <div className="bg-card shadow-lg rounded-lg p-8 border border-border">
          <div className="flex items-center mb-8 gap-4">
            <div className="mb-8">
              <button
                className="flex items-center gap-2 text-black hover:underline focus:outline-none mb-4"
                onClick={() => navigate(-1)}
                aria-label="Go back"
                style={{ minWidth: 0 }}
              >
                <ArrowLeft size={20} />
                <span className="font-medium">Back</span>
              </button>
              <h1 className="text-2xl font-bold mb-2">User Details</h1>
              <p className="text-muted-foreground">View and edit user information</p>
            </div>
            <div className="flex-1" />
          </div>
          {loading ? (
            <div className="text-center text-muted-foreground py-10">Loading...</div>
          ) : (
            <>
              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1 font-medium">Username</label>
                    <input
                      type="text"
                      value={updatedUser.username}
                      onChange={(e) => setUpdatedUser({ ...updatedUser, username: e.target.value })}
                      className="form-input w-full border border-border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Email</label>
                    <input
                      type="email"
                      value={updatedUser.email}
                      onChange={(e) => setUpdatedUser({ ...updatedUser, email: e.target.value })}
                      className="form-input w-full border border-border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Role</label>
                    <select
                      value={updatedUser.role}
                      onChange={(e) => setUpdatedUser({ ...updatedUser, role: e.target.value })}
                      className="form-select w-full border border-border rounded px-3 py-2"
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>
                  <div className="flex gap-4 mt-6 justify-end">
                    <Button onClick={handleUpdate} className="bg-primary text-white">Save</Button>
                    <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center md:gap-8">
                    <div className="flex-1">
                      <div className="mb-2">
                        <span className="font-semibold text-muted-foreground">Username:</span>
                        <span className="ml-2 text-lg font-medium">{user.username}</span>
                      </div>
                      <div className="mb-2">
                        <span className="font-semibold text-muted-foreground">Email:</span>
                        <span className="ml-2">{user.email}</span>
                      </div>
                      <div className="mb-2">
                        <span className="font-semibold text-muted-foreground">Role:</span>
                        <span className="ml-2">{user.role}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-6 justify-end">
                    <Button onClick={() => setEditing(true)} className="bg-primary text-white">Edit</Button>
                    <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default UserDetail;
