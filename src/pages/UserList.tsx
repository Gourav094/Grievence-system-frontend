import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import MainLayout from '@/components/Layout/MainLayout';
import { ArrowLeft } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';

const UserList = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', email: '', role: '', password: '' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/admin/users');
        // Only show users with role 'USER'
        setUsers(response.data.filter((u) => u.role.toLowerCase() === 'user'));
      } catch (error) {
        toast({
          title: 'Error fetching users',
          description: error.message,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [toast]);

  const handleRowClick = async (id) => {
    setDialogLoading(true);
    setDialogOpen(true);
    try {
      const response = await axios.get(`http://localhost:8080/api/admin/users/${id}`);
      setSelectedUser(response.data);
    } catch (error) {
      toast({
        title: 'Error fetching user details',
        description: error.message,
      });
      setDialogOpen(false);
    } finally {
      setDialogLoading(false);
    }
  };

  const handleEditClick = async (user) => {
    setEditUser(user);
    setEditLoading(true);
    try {
      // Fetch full user details including password
      const response = await axios.get(`http://localhost:8080/api/admin/users/${user.id}`);
      const userDetails = response.data;
      setEditForm({
        username: userDetails.username,
        email: userDetails.email,
        role: userDetails.role,
        password: userDetails.password || '', // keep password in state, but do not show in UI
      });
      setEditDialogOpen(true);
    } catch (error) {
      toast({ title: 'Error fetching user details', description: error.message });
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditSave = async () => {
    setEditLoading(true);
    try {
      // Ensure payload includes id, password, and role is lowercase
      const payload = {
        id: editUser.id,
        username: editForm.username,
        email: editForm.email,
        role: editForm.role.toLowerCase(),
        password: editForm.password, // always send password, but do not allow editing
      };
      await axios.put(`http://localhost:8080/api/admin/users/${editUser.id}`, payload);
      toast({ title: 'User updated successfully' });
      setUsers((prev) => prev.map((u) => (u.id === editUser.id ? { ...u, ...payload } : u)));
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Update user error:', error);
      toast({ title: 'Error updating user', description: error.message });
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await axios.delete(`http://localhost:8080/api/admin/users/${userToDelete.id}`);
      toast({ title: 'User deleted successfully' });
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error) {
      toast({ title: 'Error deleting user', description: error.message });
    }
  };

  return (
    <MainLayout>
      {user?.role !== 'admin' ? (
        <p className="text-center text-red-500">Unauthorized: Only admins can access this page.</p>
      ) : (
        <div className="max-w-5xl mx-auto mt-10">
          <div className="bg-white shadow-xl rounded-2xl p-10 border border-border">
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
              <h1 className="text-3xl font-extrabold mb-1 text-primary drop-shadow">User Directory</h1>
              <p className="text-muted-foreground">Browse and manage all registered users</p>
            </div>
            {loading ? (
              <div className="text-center text-muted-foreground py-10">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="text-center text-muted-foreground py-10">No users found.</div>
            ) : (
              <div className="overflow-x-auto rounded-xl">
                <table className="min-w-full text-sm border border-border bg-white rounded-xl overflow-hidden text-left">
                  <thead>
                    <tr className="bg-muted text-muted-foreground text-base">
                      <th className="px-6 py-4 font-semibold text-left">ID</th>
                      <th className="px-6 py-4 font-semibold text-left">Username</th>
                      <th className="px-6 py-4 font-semibold text-left">Email</th>
                      <th className="px-6 py-4 font-semibold text-left">Role</th>
                      <th className="px-6 py-4 font-semibold text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, idx) => (
                      <tr
                        key={user.id}
                        className={`transition hover:bg-blue-50 cursor-pointer ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                        onClick={() => handleRowClick(user.id)}
                      >
                        <td className="px-6 py-4 border-b border-border font-mono align-middle">{user.id}</td>
                        <td className="px-6 py-4 border-b border-border font-medium align-middle">{user.username}</td>
                        <td className="px-6 py-4 border-b border-border align-middle">{user.email}</td>
                        <td className="px-6 py-4 border-b border-border align-middle">
                          <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 border-b border-border align-middle flex gap-2">
                          <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); handleEditClick(user); }}>Edit</Button>
                          <Button size="sm" variant="destructive" onClick={e => { e.stopPropagation(); handleDeleteUser(user); }}>Delete</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>User Details</DialogTitle>
                  <DialogDescription>View user information</DialogDescription>
                </DialogHeader>
                {dialogLoading ? (
                  <div className="text-center text-muted-foreground py-10">Loading...</div>
                ) : selectedUser ? (
                  <div className="space-y-4">
                    <div>
                      <span className="font-semibold text-muted-foreground">Username:</span>
                      <span className="ml-2 text-lg font-medium">{selectedUser.username}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-muted-foreground">Email:</span>
                      <span className="ml-2">{selectedUser.email}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-muted-foreground">Role:</span>
                      <span className="ml-2">
                        <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                          {selectedUser.role}
                        </span>
                      </span>
                    </div>
                  </div>
                ) : null}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Close</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Edit User</DialogTitle>
                  <DialogDescription>Update user information</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1 font-medium">Username</label>
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={e => setEditForm({ ...editForm, username: e.target.value })}
                      className="form-input w-full border border-border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                      className="form-input w-full border border-border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Role</label>
                    <select
                      value={editForm.role}
                      onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                      className="form-select w-full border border-border rounded px-3 py-2"
                    >
                      <option value="user">USER</option>
                      <option value="admin">ADMIN</option>
                    </select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleEditSave} disabled={editLoading} className="bg-primary text-white">
                    {editLoading ? 'Saving...' : 'Save'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Delete User</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this user? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <div className="mb-2">
                    <span className="font-semibold">Username:</span> {userToDelete?.username}
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold">Email:</span> {userToDelete?.email}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                  <Button variant="destructive" onClick={confirmDeleteUser}>Delete</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default UserList;
