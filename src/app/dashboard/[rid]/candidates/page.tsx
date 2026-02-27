import { listAllApplicants } from '@/lib/services/applicants';
import { ApplicationStage } from '@/db/types';
import { CandidatesListClient } from './CandidatesListClient';
import { notFound } from 'next/navigation';
import { findOne } from '@/lib/services/recruitmentSessions';

export default async function CandidatesPage({
  params,
}: PageProps<'/dashboard/[rid]/candidates'>) {
  const { rid } = await params;
  const recruitmentSession = await findOne(rid);
  if (!recruitmentSession) notFound();

  const applicants = await listAllApplicants(rid);
  // ...existing code...

  return (
    <main className="px-6 py-4">
      <CandidatesListClient
        applicants={applicants}
        stages={['a', 'b', 'c', 'd', 'e', 'f', 'z', 's']}
      />
    </main>
  );
}
