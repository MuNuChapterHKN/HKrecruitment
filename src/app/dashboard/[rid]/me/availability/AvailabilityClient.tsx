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
  const [selectedSlots, setSelectedSlots] = useState<TimeslotPeek[]>(timeslots);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (!onSubmitAction) return;

    try {
      setIsSubmitting(true);
      const activeSlots = selectedSlots.filter((slot) => slot.active);
      const result = await onSubmitAction(activeSlots);

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

  const initialActiveIds = timeslots
    .filter((slot) => slot.active)
    .map((slot) => slot.id)
    .sort();
  const currentActiveIds = selectedSlots
    .filter((slot) => slot.active)
    .map((slot) => slot.id)
    .sort();

  const hasChanges =
    initialActiveIds.length !== currentActiveIds.length ||
    initialActiveIds.some((id, index) => id !== currentActiveIds[index]);

  return (
    <div className="flex flex-col items-center gap-4">
      <AvailabilitiesTable
        timeslots={timeslots}
        onSelectionChange={setSelectedSlots}
      />

      <div className="flex flex-col items-center gap-2">
        <button
          className="px-4 py-2 bg-black text-white rounded-md text-sm disabled:opacity-60"
          onClick={handleSubmit}
          disabled={isSubmitting || !hasChanges}
        >
          {isSubmitting ? 'Saving...' : `Submit (${activeCount} selected)`}
        </button>

        {!hasChanges && !isSubmitting && (
          <p className="text-sm text-gray-500">
            Your availability is already up to date.
          </p>
        )}
      </div>
    </div>
  );
}
