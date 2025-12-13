import { listAllUsers } from '@/lib/services/users';
import UsersTable from './UsersTable';

export default async function UsersPage() {
  const users = await listAllUsers();

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">Members</h1>

      <UsersTable users={users} />
    </main>
  );
}
