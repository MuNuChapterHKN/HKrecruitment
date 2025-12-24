'use client';

import { useState, useEffect, useActionState } from 'react';
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
import {
  approveInterview,
  type ApproveInterviewState,
} from '@/lib/actions/interviews';
import { fetchAvailableInterviewers } from '@/lib/api/users';

export interface InterviewFormData {
  interviewers: string[];
}

const initialState: ApproveInterviewState = {
  message: '',
};

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
  const [state, formAction, pending] = useActionState(
    approveInterview,
    initialState
  );

  useEffect(() => {
    const fetchAvailableUsers = async () => {
      if (!applicant?.interviewId) {
        setIsLoading(false);
        return;
      }

      const result = await fetchAvailableInterviewers(applicant.interviewId);

      if (result.isErr()) {
        console.error('Error fetching available users:', result.error);
        setIsLoading(false);
        return;
      }

      const options: Option[] = result.value.map(
        (user: { id: string; name: string }) => ({
          value: user.id,
          label: user.name,
        })
      );

      setAvailableInterviewers(options);
      setIsLoading(false);
    };

    fetchAvailableUsers();
  }, [applicant?.interviewId]);

  useEffect(() => {
    if (state.success) {
      onClose();
    }
  }, [state.success, onClose]);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Approve Interview</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="applicantId" value={applicant?.id || ''} />
          <input
            type="hidden"
            name="interviewId"
            value={applicant?.interviewId || ''}
          />
          {formData.interviewers.map((interviewerId) => (
            <input
              key={interviewerId}
              type="hidden"
              name="interviewerIds"
              value={interviewerId}
            />
          ))}
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
          {state.message && (
            <p
              className={`text-sm ${state.success ? 'text-green-600' : 'text-red-600'}`}
              aria-live="polite"
            >
              {state.message}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={
                isLoading || pending || availableInterviewers.length === 0
              }
            >
              {pending ? 'Approving...' : 'Approve Interview'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
