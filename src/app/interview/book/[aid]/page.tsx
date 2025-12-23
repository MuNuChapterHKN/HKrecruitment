import { compare, hash } from '@/lib/server/token';
import { getApplicantById } from '@/lib/services/applicants';
import { unauthorized } from 'next/navigation';

export default async function InterviewBookingPage({
  params,
  searchParams,
}: PageProps<'/interview/book/[aid]'>) {
  const { aid } = await params;
  const { token } = await searchParams;

  if (!aid || !token || Array.isArray(token)) unauthorized();
  console.log(aid, token);

  const applicant = await getApplicantById(aid);
  if (!applicant || !applicant.token) unauthorized();
  console.log(applicant);

  console.log('yay', await hash('ciao-come-va'));
  if (!(await compare(token, applicant.token))) unauthorized();

  return <div>you can now see this</div>;
}
