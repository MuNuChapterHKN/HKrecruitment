import { listAllApplicants } from '@/lib/services/applicants';
import { notFound } from 'next/navigation';
import { findOne } from '@/lib/services/recruitmentSessions';
import { STAGES } from '@/db/schema';
import type { ApplicationStage } from '@/db/types';
import { CandidatesListClient } from './CandidatesListClient';
import { sanitizeText } from '@/lib/sanitize';

export default async function CandidatesPage({
  params,
}: PageProps<'/dashboard/[rid]/candidates'>) {
  const { rid } = await params;
  const recruitmentSession = await findOne(rid);
  if (!recruitmentSession) notFound();

  const applicants = await listAllApplicants(rid);
  const applicantsClient = applicants.map((applicant) => ({
    id: applicant.id,
    name: sanitizeText(applicant.name),
    surname: sanitizeText(applicant.surname),
    email: sanitizeText(applicant.email),
    course: sanitizeText(applicant.course),
    degreeLevel: applicant.degreeLevel,
    stage: applicant.stage,
    createdAt: applicant.createdAt ? applicant.createdAt.toISOString() : null,
  }));

  return (
    <main className="px-6 py-4">
      <CandidatesListClient
        applicants={applicantsClient}
        stages={[...STAGES]}
      />
    </main>
  );
}
