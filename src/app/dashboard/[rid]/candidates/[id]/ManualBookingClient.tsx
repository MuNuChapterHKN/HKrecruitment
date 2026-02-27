'use client';

import { AvailabilitiesTable } from '@/app/dashboard/[rid]/me/availability/AvailabilitiesTable';
import { Button } from '@/components/ui';
import { useState } from 'react';

type TimeslotPeek = {
  id: string;
  startingFrom: Date;
  active: boolean;
  locked: boolean;
};

type ManualBookingClientProps = {
  timeslots: TimeslotPeek[];
  hasExistingInterview: boolean;
  onSubmitAction: (timeslotId: string) => Promise<void>;
};

export function ManualBookingClient({
  timeslots,
  hasExistingInterview,
  onSubmitAction,
}: ManualBookingClientProps) {
  const [selectedSlots, setSelectedSlots] = useState<TimeslotPeek[]>(timeslots);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    const selected = selectedSlots.find((slot) => slot.active);
    if (!selected) {
      setError('Please select a timeslot');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      await onSubmitAction(selected.id);
      setSuccess(true);
    } catch (err) {
      setError('Failed to book interview. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-lg border bg-green-50 dark:bg-green-950/30 p-6">
        <h2 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
          Interview Booked Successfully
        </h2>
        <p className="text-sm text-green-700 dark:text-green-300">
          The interview has been scheduled. The page will refresh to show the
          updated details.
        </p>
      </div>
    );
  }

  if (hasExistingInterview) {
    return (
      <div className="rounded-lg border bg-muted/30 p-6">
        <h2 className="text-lg font-semibold mb-2">
          Interview Already Scheduled
        </h2>
        <p className="text-sm text-muted-foreground">
          This candidate already has an interview scheduled. Check the Details
          tab for more information.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {timeslots.length === 0 ? (
        <div className="rounded-lg border bg-yellow-50 dark:bg-yellow-950/30 p-6">
          <h2 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
            No Available Timeslots
          </h2>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            There are currently no timeslots with sufficient interviewer
            availability. Please create new timeslots or ensure interviewers
            have submitted their availability.
          </p>
        </div>
      ) : (
        <>
          <AvailabilitiesTable
            timeslots={selectedSlots}
            onSelectionChange={setSelectedSlots}
            maxSelections={1}
          />

          {error && (
            <div className="rounded-md border border-destructive bg-destructive/10 p-3">
              <p className="text-destructive text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? 'Booking...' : 'Confirm Booking'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
