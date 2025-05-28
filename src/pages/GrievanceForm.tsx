import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { grievanceApi } from '@/services/api';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { FileText, Send } from 'lucide-react';

const CATEGORIES = [
  'Service',
  'Billing',
  'Product',
  'Delivery',
  'Customer Support',
  'Technical Issue',
  'Other'
];

const GrievanceForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [createdBy, setCreatedBy] = useState(user?.name || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!title || !category || !description || !createdBy) {
      setFormError('Please fill in all required fields');
      return;
    }

    if (!user) {
      setFormError('You must be logged in to submit a grievance');
      return;
    }

    setIsSubmitting(true);

    try {
      const grievanceData = {
        title,
        description,
        category,
        status: 'pending',
        userId: user.id,
        userName: user.name,
        createdBy:user.name // ✅ New field included
      };

      const response = await grievanceApi.createGrievance(grievanceData);

      toast({
        title: "Grievance submitted!",
        description: `Your grievance #${response.id || 'XXXX'} has been submitted successfully.`
      });

      navigate(`/grievances/${response.id}`);
    } catch (error) {
      setFormError('An error occurred while submitting your grievance. Please try again.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout requireAuth allowedRoles={['user']}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-primary/10 p-2 rounded-full">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Submit a Grievance</h1>
            <p className="text-muted-foreground">Fill out the form below to submit your complaint or issue</p>
          </div>
        </div>

        {formError && (
          <div className="bg-red-50 text-red-800 p-4 rounded-md mb-6 text-sm">
            {formError}
          </div>
        )}

        <div className="bg-card shadow rounded-lg border border-border p-6">
          <form onSubmit={handleSubmit}>
            <div className="form-input-wrapper">
              <label htmlFor="title" className="form-label">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-input"
                placeholder="Brief title for your grievance"
                disabled={isSubmitting}
              />
            </div>

            <div className="form-input-wrapper">
              <label htmlFor="category" className="form-label">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-input"
                disabled={isSubmitting}
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-input-wrapper">
              <label htmlFor="description" className="form-label">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-input min-h-[150px]"
                placeholder="Provide detailed information about your grievance"
                disabled={isSubmitting}
              />
            </div>

            <div className="form-input-wrapper">
              <label htmlFor="createdBy" className="form-label">
                Created By <span className="text-red-500">*</span>
              </label>
              <input
                id="createdBy"
                type="text"
                value={createdBy}
                onChange={(e) => setCreatedBy(e.target.value)}
                className="form-input"
                placeholder="Enter your name"
                disabled={isSubmitting}
                readOnly // Optional: remove if user should be allowed to edit
              />
            </div>

            <div className="flex justify-end mt-6">
              <Button
                type="button"
                variant="outline"
                className="mr-2"
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                <Send className="mr-2 h-4 w-4" />
                {isSubmitting ? 'Submitting...' : 'Submit Grievance'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default GrievanceForm;
