'use client';

import { AvailabilitiesTable } from '@/app/dashboard/[rid]/me/availability/AvailabilitiesTable';
import { Button } from '@/components/ui';
import { InterviewCard } from '@/components/dashboard';
import { useState } from 'react';
import type { InterviewInfo } from './page';

type TimeslotPeek = {
  id: string;
  startingFrom: Date;
  active: boolean;
  locked: boolean;
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="w-full max-w-4xl">
        <div className="rounded-lg bg-card p-4 sm:p-8">
          {!interview && (
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Book Your Interview
              </h1>
              <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                Hello {applicantName}, please select a timeslot for your
                interview.
              </p>
            </div>
          )}

          <div className="space-y-4 sm:space-y-6">
            {interview && (
              <InterviewCard
                interview={{
                  startingFrom: interview.startingFrom,
                  confirmed: interview.confirmed,
                  meetingId: interview.meetingId,
                }}
                interviewers={interview.interviewers}
                variant="default"
              />
            )}

            {!interview && (
              <>
                <AvailabilitiesTable
                  timeslots={selectedSlots}
                  onSelectionChange={setSelectedSlots}
                  maxSelections={1}
                />

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
