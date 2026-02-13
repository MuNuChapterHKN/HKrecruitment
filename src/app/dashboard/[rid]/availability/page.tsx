'use server';

import { AggregatedAvailabilityTable } from './AggregatedAvailabilityTable';
import { findWithAggregatedAvailability } from '@/lib/services/timeslots';
import { findOne } from '@/lib/services/recruitmentSessions';
import { notFound } from 'next/navigation';

export type TimeslotWithAvailability = {
  id: string;
  startingFrom: Date;
  totalUsers: number;
  firstTimeUsers: number;
  userNames: string[];
  firstTimeUserNames: string[];
  interviews: {
    meetingId: string;
    applicant: { name: string; surname: string };
    interviewers: string[];
  }[];
};

export default async function AvailabilityOverviewPage({
  params,
}: PageProps<'/dashboard/[rid]/availability'>) {
  const { rid } = await params;
  const recruitmentSession = await findOne(rid);
  if (!recruitmentSession) notFound();

  const timeslots = await findWithAggregatedAvailability(rid);

  return (
    <main className="px-6 py-4">
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">
            Availability Overview
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Overview of all interviewer availability for this recruitment
            session.
          </p>
        </header>

        <AggregatedAvailabilityTable timeslots={timeslots} />
      </div>
    </main>
  );
}
