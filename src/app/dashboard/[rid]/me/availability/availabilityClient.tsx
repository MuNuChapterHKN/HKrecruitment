'use client';

import { useState } from 'react';
import { AvailabilitiesTable, type SelectedSlot } from './availabilitiesTable';
import { saveAvailability } from './actions';

// 👇 NUOVO: tipo delle props che arrivano da page.tsx
type AvailabilityClientProps = {
  timeslots: {
    id: string;
    recruitingSessionId: string;
    startingFrom: Date;
  }[];
};

// 👇 NUOVO: accettiamo le props e le destrutturiamo
export function AvailabilityClient({ timeslots }: AvailabilityClientProps) {
  const [selectedSlots, setSelectedSlots] = useState<SelectedSlot[]>([]);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    try {
      setIsSubmitting(true);
      const result = await saveAvailability(selectedSlots);
      setMessage(`Salvate ${result.inserted} disponibilità.`);
    } catch (error) {
      console.error(error);
      setMessage('Errore durante il salvataggio.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Per ora NON usiamo ancora timeslots dentro la tabella,
          ma ce li abbiamo disponibili se ci servono dopo */}
      <AvailabilitiesTable onSelectionChange={setSelectedSlots} />

      <button
        className="px-4 py-2 bg-black text-white rounded-md text-sm disabled:opacity-60"
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Salvataggio...' : 'Submit'}
      </button>

      {message && <p className="text-green-600 text-sm">{message}</p>}
    </div>
  );
}
