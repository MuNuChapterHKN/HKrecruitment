import { listAllUsers } from '@/lib/services/users';
import { auth } from '@/lib/server/auth';
import { headers } from 'next/headers';
import { requirePageAccess } from '@/lib/helpers/pageAuthorization';
import MembersTable from './MembersTable';

export default async function MembersPage({
  params,
}: {
  params: Promise<{ rid: string }> | { rid: string };
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) return null;

  const resolvedParams = await Promise.resolve(params);
  const { rid } = resolvedParams;

  await requirePageAccess(session.user.id, rid, 'MembersPage');

  const users = await listAllUsers();

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">Members</h1>

      <MembersTable users={users} rid={rid} />
    </main>
  );
}
