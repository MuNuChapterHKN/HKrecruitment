import { auth } from '@/lib/server/auth';
import { headers } from 'next/headers';
import {
  findOne,
  findUserRoleForSession,
} from '@/lib/services/recruitmentSessions';
import { AuthUserRole } from '@/lib/server/authTypes';
import { notFound } from 'next/navigation';
import { GuestOverview } from './GuestOverview';
import { MemberOverview } from './MemberOverview';
import { ClerkOverview } from './ClerkOverview';
import { AdminOverview } from './AdminOverview';

export default async function Dashboard({
  params,
}: PageProps<'/dashboard/[rid]'>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) return null;

  const { rid } = await params;
  const recruitmentSession = await findOne(rid);
  if (!recruitmentSession) notFound();

  const role = await findUserRoleForSession(session.user.id, rid);

  if (role === AuthUserRole.Admin) {
    return <AdminOverview />;
  }

  if (role === AuthUserRole.Clerk) {
    return <ClerkOverview />;
  }

  if (role === AuthUserRole.Member) {
    return <MemberOverview />;
  }

  return <GuestOverview />;
}
