
import React, { useState } from 'react';
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
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const GrievanceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch grievance details
  const { 
    data: grievance, 
    isLoading,
    error 
  } = useQuery({
    queryKey: ['grievance', id],
    queryFn: () => grievanceApi.getGrievanceById(id || ''),
    enabled: !!id
  });

  // Status update mutation
  const updateStatusMutation = useMutation({
    mutationFn: (newStatus: GrievanceStatus) => {
      return grievanceApi.createGrievance({ 
        ...grievance,
        id: grievance.id,
        status: newStatus 
      });
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
    mutationFn: (commentText: string) => {
      return grievanceApi.addComment({ 
        grievanceId: grievance.id,
        text: commentText,
        userId: user?.id || '',
        userName: user?.name || '',
        isAdmin: user?.role === 'admin'
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
  const hasPermission = user?.role === 'admin' || grievance.userId === user?.id;
  
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
    
    if (!comment.trim()) return;
    
    try {
      addCommentMutation.mutate(comment);
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive"
      });
    }
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
              </div>
            </div>
            <div>
              <span className={`
                ${grievance.status === 'pending' ? 'grievance-status-pending' : ''}
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
                  variant={grievance.status === 'pending' ? 'default' : 'outline'}
                  onClick={() => handleStatusChange('pending')}
                  disabled={updateStatusMutation.isPending}
                >
                  Pending
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
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <MessageSquare className="mr-2 h-5 w-5" />
              Comments & Updates
            </h2>

            <div className="space-y-4 mb-6">
              {grievance.comments && grievance.comments.length > 0 ? (
                grievance.comments.map((comment: any) => (
                  <div 
                    key={comment.id} 
                    className={`p-4 rounded-lg ${
                      comment.isAdmin 
                        ? 'bg-primary/10 border border-primary/20' 
                        : 'bg-muted'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium">
                        {comment.userName} {comment.isAdmin && '(Admin)'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <p className="text-sm">{comment.text}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No comments yet.
                </div>
              )}
            </div>

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
        </div>
      </div>
    </MainLayout>
  );
};

export default GrievanceDetail;
