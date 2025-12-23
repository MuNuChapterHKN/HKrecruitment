'use client';

import { useState } from 'react';
import { Timeslot } from '@/db/types';
import { AvailabilitiesTable } from './AvailabilitiesTable';

type AvailabilityClientProps = {
  timeslots: {
    id: string;
    recruitingSessionId: string;
    startingFrom: Date;
  }[];
  onSubmitAction?: (slots: Timeslot[]) => Promise<void>;
};

export function AvailabilityClient({
  timeslots,
  onSubmitAction,
}: AvailabilityClientProps) {
  const [selectedSlots, setSelectedSlots] = useState<Timeslot[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (!onSubmitAction) return;

    try {
      setIsSubmitting(true);
      await onSubmitAction(selectedSlots);
      setSelectedSlots([]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <AvailabilitiesTable
        timeslots={timeslots}
        onSelectionChange={setSelectedSlots}
      />

      <button
        className="px-4 py-2 bg-black text-white rounded-md text-sm disabled:opacity-60"
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Salvataggio...' : 'Submit'}
      </button>
    </div>
  );
}
