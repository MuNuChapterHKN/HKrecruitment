import { getTimeslots } from './queries';
import { AvailabilityClient } from './availabilityClient';

export default async function AvailabilityPage() {
  const timeslots = await getTimeslots();

  return (
    <main className="px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-6">
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
