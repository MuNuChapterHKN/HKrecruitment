import { listAllApplicants } from '@/lib/services/applicants';
import { ApplicantsListClient } from '@/components/applicants/ApplicantsListClient';
import { notFound } from 'next/navigation';
import { findOne } from '@/lib/services/recruitmentSessions';
import { auth } from '@/lib/server/auth';
import { headers } from 'next/headers';
import { requirePageAccess } from '@/lib/helpers/pageAuthorization';

export default async function CandidatesPage({
  params,
}: PageProps<'/dashboard/[rid]/candidates'>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) return null;

  const { rid } = await params;

  await requirePageAccess(session.user.id, rid, 'CandidatesPage');

  const recruitmentSession = await findOne(rid);
  if (!recruitmentSession) notFound();
  const applicants = await listAllApplicants(rid);

  return (
    <main className="px-6 py-4">
      <ApplicantsListClient applicants={applicants} />
    </main>
  );
}
