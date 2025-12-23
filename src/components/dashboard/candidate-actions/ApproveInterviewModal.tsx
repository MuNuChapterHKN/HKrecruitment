'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  MultiSelect,
  type Option,
} from '@/components';
import type { BaseModalProps } from './types';

export interface InterviewFormData {
  interviewers: string[];
}

export default function ApproveInterviewModal({
  applicant,
  onClose,
}: BaseModalProps) {
  const [formData, setFormData] = useState<InterviewFormData>({
    interviewers: [],
  });
  const [availableInterviewers, setAvailableInterviewers] = useState<Option[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAvailableUsers = async () => {
      if (!applicant?.interviewId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/users/available/interview/${applicant.interviewId}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch available users');
        }

        const users = await response.json();
        const options: Option[] = users.map(
          (user: { id: string; name: string }) => ({
            value: user.id,
            label: user.name,
          })
        );

        setAvailableInterviewers(options);
      } catch (error) {
        console.error('Error fetching available users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailableUsers();
  }, [applicant?.interviewId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.interviewers.length === 0) {
      alert('Please select at least one interviewer');
      return;
    }

    console.log(
      'Approving interview with interviewers:',
      formData.interviewers
    );

    onClose();
    setFormData({ interviewers: [] });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Approve Interview</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-2">
              Select Interviewers
            </label>
            {isLoading ? (
              <div className="text-sm text-muted-foreground">
                Loading available interviewers...
              </div>
            ) : availableInterviewers.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No interviewers available for this timeslot
              </div>
            ) : (
              <>
                <MultiSelect
                  options={availableInterviewers}
                  onValueChange={(values) => {
                    console.log('Interviewers selected:', values);
                    setFormData({ ...formData, interviewers: values });
                  }}
                  defaultValue={formData.interviewers}
                  placeholder="Choose interviewers..."
                  maxCount={2}
                />
                {formData.interviewers.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.interviewers.length} interviewer
                    {formData.interviewers.length !== 1 ? 's' : ''} selected
                  </p>
                )}
              </>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isLoading || availableInterviewers.length === 0}
            >
              Approve Interview
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
