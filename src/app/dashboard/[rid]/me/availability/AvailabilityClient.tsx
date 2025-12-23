'use client';

import { useState } from 'react';
import { TimeslotPeek } from './page';
import { AvailabilitiesTable } from './AvailabilitiesTable';

type AvailabilityClientProps = {
  timeslots: TimeslotPeek[];
  onSubmitAction?: (
    slots: TimeslotPeek[]
  ) => Promise<{ success: boolean; error?: string }>;
};

export function AvailabilityClient({
  timeslots,
  onSubmitAction,
}: AvailabilityClientProps) {
  const [selectedSlots, setSelectedSlots] = useState<TimeslotPeek[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  async function handleSubmit() {
    if (!onSubmitAction) return;

    try {
      setIsSubmitting(true);
      setMessage(null);
      const result = await onSubmitAction(selectedSlots);

      if (result.success) {
        setMessage({
          type: 'success',
          text: 'Availability submitted successfully!',
        });
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'Failed to submit availability',
        });
      }
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  }

  const activeCount = selectedSlots.filter((slot) => slot.active).length;

  return (
    <div className="flex flex-col items-center gap-4">
      <AvailabilitiesTable
        timeslots={timeslots}
        onSelectionChange={setSelectedSlots}
      />

      {message && (
        <div
          className={`px-4 py-2 rounded-md text-sm ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <button
        className="px-4 py-2 bg-black text-white rounded-md text-sm disabled:opacity-60"
        onClick={handleSubmit}
        disabled={isSubmitting || activeCount === 0}
      >
        {isSubmitting ? 'Salvataggio...' : `Submit (${activeCount} selected)`}
      </button>
    </div>
  );
}
