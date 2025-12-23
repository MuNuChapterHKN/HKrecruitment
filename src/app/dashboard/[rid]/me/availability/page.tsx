'use server';

import { AvailabilityClient } from './AvailabilityClient';
import { findAll, findForUser } from '@/lib/services/timeslots';
import { submitAvailability } from '@/lib/actions/availability';
import { auth } from '@/lib/server/auth';
import { headers } from 'next/headers';
import { findOne } from '@/lib/services/recruitmentSessions';
import { notFound } from 'next/navigation';

export type TimeslotPeek = {
  id: string;
  startingFrom: Date;
  active: boolean;
};

export default async function AvailabilityPage({
  params,
}: PageProps<'/dashboard/[rid]/me/availability'>) {
  /* Check Auth */
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) return null;
  const { user } = session;

  const { rid } = await params;
  const recruitmentSession = await findOne(rid);
  if (!recruitmentSession) notFound();

  const allTimeslots = await findAll(rid);
  const userTimeslotIds = await findForUser(user.id);

  const timeslots: TimeslotPeek[] = allTimeslots.map((ts) => ({
    id: ts.id,
    startingFrom: ts.startingFrom,
    active: userTimeslotIds.includes(ts.id),
  }));

  async function handleSubmit(slots: TimeslotPeek[]) {
    'use server';
    const timeslotIds = slots
      .filter((slot) => slot.active)
      .map((slot) => slot.id);
    return submitAvailability(timeslotIds);
  }

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

        <AvailabilityClient
          timeslots={timeslots}
          onSubmitAction={handleSubmit}
        />
      </div>
    </main>
  );
}
