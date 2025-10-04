'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
// Note: Toast functionality temporarily commented out for build compatibility
// import { toast } from '@/components/ui/use-toast';

interface ReportButtonProps {
  contentType: 'article' | 'vote' | 'comment' | 'user';
  contentId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ReportButton: React.FC<ReportButtonProps> = ({ 
  contentType, 
  contentId, 
  size = 'sm', 
  className = '' 
}) => {
  const { data: session } = useSession() || { data: null };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [description, setDescription] = useState('');

  const reasons = [
    { value: 'spam', label: 'Spam or promotional content' },
    { value: 'inappropriate', label: 'Inappropriate or offensive content' },
    { value: 'misinformation', label: 'Misinformation or fake news' },
    { value: 'harassment', label: 'Harassment or bullying' },
    { value: 'vote_manipulation', label: 'Vote manipulation or gaming' },
    { value: 'other', label: 'Other (please specify)' }
  ];

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-2',
    lg: 'text-base px-4 py-2'
  };

  const handleSubmitReport = async () => {
    if (!selectedReason || !description.trim()) {
      console.warn('Missing Information: Please select a reason and provide a description.');
      // toast({
      //   title: 'Missing Information',
      //   description: 'Please select a reason and provide a description.',
      //   variant: 'destructive',
      // } as any);
      return;
    }

    setIsSubmitting(true);

    try {
      // Get user ID or create anonymous ID
      const userId = (session as any)?.user?.id || 
                     localStorage.getItem('anonymous_user_id') || 
                     `anon_${Math.random().toString(36).substring(2)}`;

      if (!(session as any)?.user?.id) {
        localStorage.setItem('anonymous_user_id', userId);
      }

      const response = await fetch('/api/moderation/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reporterId: userId,
          contentType,
          contentId,
          reason: selectedReason,
          description: description.trim()
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log('Report Submitted: Thank you for helping keep our community safe.');
        // toast({
        //   title: 'Report Submitted',
        //   description: 'Thank you for helping keep our community safe. We\'ll review your report soon.',
        //   variant: 'default',
        // } as any);

        // Reset form and close modal
        setSelectedReason('');
        setDescription('');
        setIsModalOpen(false);
      } else {
        throw new Error(result.error || 'Failed to submit report');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      console.error('Report Failed: Unable to submit report. Please try again later.');
      // toast({
      //   title: 'Report Failed',
      //   description: 'Unable to submit report. Please try again later.',
      //   variant: 'destructive',
      // } as any);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Report Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className={`
          ${sizeClasses[size]}
          ${className}
          inline-flex items-center gap-1 rounded-lg border border-gray-300 dark:border-zinc-600 
          bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-gray-400
          hover:bg-gray-100 dark:hover:bg-zinc-700 hover:text-gray-700 dark:hover:text-gray-300
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900
        `}
        title="Report content"
        aria-label="Report this content"
      >
        <span>🚨</span>
        <span className="hidden sm:inline">Report</span>
      </button>

      {/* Report Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Report Content
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl"
                  aria-label="Close modal"
                >
                  ×
                </button>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Help us maintain community standards by reporting inappropriate content.
              </p>

              {/* Reason Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Why are you reporting this {contentType}?
                </label>
                <select
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-zinc-700 dark:text-white"
                  required
                >
                  <option value="">Select a reason...</option>
                  {reasons.map((reason) => (
                    <option key={reason.value} value={reason.value}>
                      {reason.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Please provide more details
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-zinc-700 dark:text-white"
                  rows={4}
                  placeholder="Describe the issue with this content..."
                  required
                  minLength={10}
                  maxLength={500}
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {description.length}/500 characters (minimum 10)
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReport}
                  disabled={isSubmitting || !selectedReason || description.trim().length < 10}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>

              <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                <p>
                  Your report will be reviewed by our moderation team. 
                  False reports may result in restrictions on your account.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReportButton;