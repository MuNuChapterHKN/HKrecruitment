'use server';

import { AvailabilityClient } from './AvailabilityClient';
import { findAll } from '@/lib/services/timeslots';

export default async function AvailabilityPage() {
  const timeslots = await findAll();

  return (
    <main className="px-6 py-4">
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">
            Interview availability
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Seleziona le tue disponibilità settimanali per le interview.
          </p>
        </header>

        <AvailabilityClient timeslots={timeslots} />
      </div>
    </main>
  );
}
