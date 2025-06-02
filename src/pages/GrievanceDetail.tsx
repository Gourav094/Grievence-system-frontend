import React, { useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { grievanceApi } from '@/services/api';
import { GrievanceStatus } from '@/services/grievanceService';
import MainLayout from '@/components/Layout/MainLayout';
import { 
  ArrowLeft, 
  MessageSquare, 
  Calendar, 
  Send, 
  User,
  Clock,
  Pencil,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const GrievanceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Fetch grievance details
  const {
    data: grievance,
    isLoading,
    error
  } = useQuery({
    queryKey: ['grievance', id],
    queryFn: () => grievanceApi.getGrievanceById(id || ''),
    enabled: !!id && !!user,
  });

  // Status update mutation
  const updateStatusMutation = useMutation({
    mutationFn: (newStatus: GrievanceStatus) => {
      return grievanceApi.updateGrievance(grievance.id, { status: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grievance', id] });
      toast({
        title: "Status updated",
        description: "Grievance status has been successfully updated"
      });
    }
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: () => {
      return grievanceApi.addComment({ 
        grievanceId: grievance.id,
        username: user?.name || '',
        comment: comment
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grievance', id] });
      setComment('');
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully"
      });
    }
  });

  // Update comment mutation
  const updateCommentMutation = useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) => {
      return grievanceApi.updateComment({ id, text });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grievance', id] });
      toast({
        title: "Comment updated",
        description: "Your comment has been updated successfully"
      });
    }
  });

  const handleUpdateComment = (commentId: string, newText: string) => {
    if (!newText.trim()) {
      toast({
        title: "Error",
        description: "Comment cannot be empty",
        variant: "destructive"
      });
      return;
    }
    updateCommentMutation.mutate({ id: commentId, text: newText });
  };

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => {
      return grievanceApi.deleteComment(commentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grievance', id] });
      toast({
        title: "Comment deleted",
        description: "Your comment has been deleted successfully"
      });
    }
  });

  const handleDeleteComment = (commentId: string) => {
    setDeleteConfirmId(commentId);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      deleteCommentMutation.mutate(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const cancelDelete = () => setDeleteConfirmId(null);

  // Handle loading state
  if (isLoading) {
    return (
      <MainLayout requireAuth>
        <div className="flex justify-center py-12">
          <div className="animate-pulse text-lg">Loading grievance details...</div>
        </div>
      </MainLayout>
    );
  }

  // Handle error state
  if (error || !grievance) {
    return (
      <MainLayout requireAuth>
        <div className="text-center p-10">
          <h2 className="text-2xl font-bold mb-4">Grievance Not Found</h2>
          <p className="mb-6">The grievance you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button onClick={() => navigate('/grievances')}>
            Back to Grievances
          </Button>
        </div>
      </MainLayout>
    );
  }

  // Check if user has permission to view this grievance
  const hasPermission = user?.role === 'admin' || grievance.createdBy === user?.name;
  console.log('User:', user);
  
  if (!hasPermission) {
    return (
      <MainLayout requireAuth>
        <div className="text-center p-10">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="mb-6">You don't have permission to view this grievance.</p>
          <Button onClick={() => navigate('/grievances')}>
            Back to Grievances
          </Button>
        </div>
      </MainLayout>
    );
  }

  const handleStatusChange = async (newStatus: GrievanceStatus) => {
    if (user?.role !== 'admin') return;
    updateStatusMutation.mutate(newStatus);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast({
        title: "Error",
        description: "Comment cannot be empty",
        variant: "destructive"
      });
      return;
    }
    try {
      addCommentMutation.mutate();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive"
      });
    }
  };

  const handleEditClick = (comment: any) => {
    setEditingCommentId(comment.commentId);
    setEditingText(comment.comment);
    setTimeout(() => editInputRef.current?.focus(), 100);
  };

  const handleEditSave = (commentId: string) => {
    if (editingText.trim()) {
      handleUpdateComment(commentId, editingText);
      setEditingCommentId(null);
      setEditingText('');
    }
  };

  const handleEditCancel = () => {
    setEditingCommentId(null);
    setEditingText('');
  };

  return (
    <MainLayout requireAuth>
      <div className="mb-6">
        <Link to="/grievances" className="inline-flex items-center text-primary hover:underline">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Grievances
        </Link>
      </div>

      <div className="bg-card shadow-md rounded-lg border border-border overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold mb-2">{grievance.title}</h1>
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="flex items-center">
                  <User className="mr-1 h-4 w-4" />
                  {grievance.userName || grievance.createdBy || "Unknown"}
                </span>
                <span className="flex items-center">
                  <Calendar className="mr-1 h-4 w-4" />
                  {new Date(grievance.createdAt).toLocaleDateString()}
                </span>
                <span className="flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  {new Date(grievance.createdAt).toLocaleTimeString()}
                </span>
                <span className="flex items-center">
                  <User className="mr-1 h-4 w-4" />
                  Assigned To: {grievance.assignedTo || "Unassigned"}
              </span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className={`
                ${grievance.status === 'open' ? 'grievance-status-open' : ''}
                ${grievance.status === 'in-progress' ? 'grievance-status-inprogress' : ''}
                ${grievance.status === 'resolved' ? 'grievance-status-resolved' : ''}
                ${grievance.status === 'rejected' ? 'grievance-status-rejected' : ''}
              `}>
                {grievance.status}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-sm font-medium text-muted-foreground mb-2">Category</h2>
            <p>{grievance.category}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-sm font-medium text-muted-foreground mb-2">Description</h2>
            <p className="whitespace-pre-line">{grievance.description}</p>
          </div>

          {/* Admin Actions */}
          {user?.role === 'admin' && (
            <div className="my-6 pt-6 border-t border-border">
              <h2 className="text-lg font-medium mb-4">Update Status</h2>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={grievance.status === 'open' ? 'default' : 'outline'}
                  onClick={() => handleStatusChange('open')}
                  disabled={updateStatusMutation.isPending}
                >
                  Open
                </Button>
                <Button
                  variant={grievance.status === 'in-progress' ? 'default' : 'outline'}
                  onClick={() => handleStatusChange('in-progress')}
                  disabled={updateStatusMutation.isPending}
                >
                  In Progress
                </Button>
                <Button
                  variant={grievance.status === 'resolved' ? 'default' : 'outline'}
                  onClick={() => handleStatusChange('resolved')}
                  disabled={updateStatusMutation.isPending}
                >
                  Resolved
                </Button>
                <Button
                  variant={grievance.status === 'rejected' ? 'default' : 'outline'}
                  onClick={() => handleStatusChange('rejected')}
                  disabled={updateStatusMutation.isPending}
                >
                  Rejected
                </Button>
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="mt-8 pt-6 border-t border-border">
          

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment}>
              <div className="form-input-wrapper">
                <label htmlFor="comment" className="form-label">Add a Comment</label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="form-input min-h-[100px]"
                  placeholder="Type your comment here..."
                  disabled={addCommentMutation.isPending}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={!comment.trim() || addCommentMutation.isPending}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {addCommentMutation.isPending ? 'Sending...' : 'Send Comment'}
                </Button>
              </div>
            </form>
          </div>

          <hr className="my-6 border-border" />
          <h2 className="text-lg font-medium mb-4 flex items-center">
              <MessageSquare className="mr-2 h-5 w-5" />
              Comments & Updates
            </h2>

          <div className="space-y-6 mb-10 w-full mx-auto mt-5">
                {grievance.comments && grievance.comments.length > 0 ? (
                [...grievance.comments].reverse().map((comment: any) => {
                  const isCurrentUser = user?.name === comment.userName;
                  return (
                  <div
                    key={comment.commentId}
                    className={`flex items-start gap-4 bg-white rounded-xl border shadow-md p-5 transition-all duration-150 relative hover:shadow-lg ${
                    comment.isAdmin
                      ? 'border-primary/40'
                      : isCurrentUser
                      ? 'border-blue-200'
                      : 'border-border'
                    }`}
                    style={{ minHeight: 96, marginBottom: 16 }}
                  >
                    {/* Avatar/Initials */}
                      <div className="flex-shrink-0 w-11 h-11 rounded-full bg-gradient-to-br from-gray-200 to-gray-100 flex items-center justify-center font-bold text-lg text-primary border border-gray-300 shadow-sm">
                        {comment.userName ? comment.userName[0].toUpperCase() : '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold truncate text-base">{comment.userName}</span>
                          {comment.isAdmin && <span className="text-xs text-primary ml-1 font-medium">(Admin)</span>}
                          <span className="text-xs text-muted-foreground ml-auto whitespace-nowrap">{new Date(comment.createdAt).toLocaleString()}</span>
                        </div>
                        {editingCommentId === comment.commentId ? (
                          <div className="flex gap-2 mt-1">
                            <input
                              ref={editInputRef}
                              className="form-input flex-1"
                              value={editingText}
                              onChange={e => setEditingText(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') handleEditSave(comment.commentId);
                                if (e.key === 'Escape') handleEditCancel();
                              }}
                            />
                            <Button size="sm" onClick={() => handleEditSave(comment.commentId)} disabled={updateCommentMutation.isPending}>Save</Button>
                            <Button size="sm" variant="outline" onClick={handleEditCancel}>Cancel</Button>
                          </div>
                        ) : (
                          <p className="text-sm whitespace-pre-line break-words mt-1 text-gray-700">{comment.comment}</p>
                        )}
                      </div>
                      {(user?.role === 'admin'|| 'user' || comment.userName === user?.name) && (
                        <div className="flex flex-col sm:flex-row gap-2 items-center ml-3 mt-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditClick(comment)}
                            disabled={editingCommentId !== null}
                            className="hover:bg-blue-50"
                            aria-label="Edit comment"
                          >
                            <Pencil className="w-4 h-4 text-blue-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteComment(comment.commentId)}
                            disabled={editingCommentId !== null}
                            className="hover:bg-red-50"
                            aria-label="Delete comment"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No comments yet.
                </div>
              )}
            </div>
        </div>
        
      </div>

            
      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={cancelDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Comment?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelDelete}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteCommentMutation.isPending}>
              {deleteCommentMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default GrievanceDetail;
