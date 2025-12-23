'use client';

import { AvailabilitiesTable } from '@/app/dashboard/[rid]/me/availability/AvailabilitiesTable';
import { Button } from '@/components/ui';
import { useState } from 'react';
import type { InterviewInfo } from './page';

type TimeslotPeek = {
  id: string;
  startingFrom: Date;
  active: boolean;
};

type InterviewBookingClientProps = {
  timeslots: TimeslotPeek[];
  applicantName: string;
  interview: InterviewInfo | null;
  onSubmitAction: (timeslotId: string) => Promise<void>;
};

export function InterviewBookingClient({
  timeslots,
  applicantName,
  interview,
  onSubmitAction,
}: InterviewBookingClientProps) {
  const [selectedSlots, setSelectedSlots] = useState<TimeslotPeek[]>(timeslots);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const selected = selectedSlots.find((slot) => slot.active);
    if (!selected) {
      setError('Please select a timeslot');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmitAction(selected.id);
    } catch (err) {
      setError('Failed to book interview. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'full',
      timeStyle: 'short',
    }).format(new Date(date));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="w-full max-w-4xl">
        <div className="rounded-lg bg-card p-4 sm:p-8">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Book Your Interview
            </h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              Hello {applicantName}, please select a timeslot for your
              interview.
            </p>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {interview && (
              <div className="rounded-lg border bg-muted/50 p-4">
                <h2 className="mb-3 text-lg font-semibold">
                  Your Interview Details
                </h2>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-muted-foreground font-medium">
                      Date & Time:
                    </span>
                    <span>{formatDateTime(interview.startingFrom)}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-muted-foreground font-medium">
                      Status:
                    </span>
                    <span
                      className={
                        interview.confirmed
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-yellow-600 dark:text-yellow-400'
                      }
                    >
                      {interview.confirmed
                        ? 'Confirmed'
                        : 'Pending confirmation'}
                    </span>
                  </div>
                  {interview.meetingId && (
                    <div className="flex items-start gap-2">
                      <span className="text-muted-foreground font-medium">
                        Meeting Link:
                      </span>
                      <a
                        href={interview.meetingId}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Join interview
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!interview && (
              <>
                <div className="overflow-x-auto">
                  <AvailabilitiesTable
                    timeslots={selectedSlots}
                    onSelectionChange={setSelectedSlots}
                    maxSelections={1}
                  />
                </div>

                {error && (
                  <div className="rounded-md border border-destructive bg-destructive/10 p-3">
                    <p className="text-destructive text-sm font-medium">
                      {error}
                    </p>
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
        </div>
      </div>
    </div>
  );
}
