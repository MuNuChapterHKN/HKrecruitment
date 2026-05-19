import { listAllApplicants } from '@/lib/services/applicants';
import { ApplicantsListClient } from '@/components/applicants/ApplicantsListClient';
import { notFound } from 'next/navigation';
import { findOne } from '@/lib/services/recruitmentSessions';

export default async function CandidatesPage({
  params,
}: PageProps<'/dashboard/[rid]/candidates'>) {
  const { rid } = await params;
  const recruitmentSession = await findOne(rid);
  if (!recruitmentSession) notFound();
  const applicants = await listAllApplicants(rid);

  return (
    <main className="px-6 py-4">
      <ApplicantsListClient applicants={applicants} />
    </main>
  );
}
