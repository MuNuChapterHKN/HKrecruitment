'use client';

import { useState } from 'react';
import { toast } from 'sonner';
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

  async function handleSubmit() {
    if (!onSubmitAction) return;

    try {
      setIsSubmitting(true);
      const result = await onSubmitAction(selectedSlots);

      if (result.success) {
        toast.success('Availability submitted successfully!');
      } else {
        toast.error(result.error || 'Failed to submit availability');
      }
    } catch (error) {
      console.error(error);
      toast.error('An unexpected error occurred');
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
