import { listAllUsers } from '@/lib/services/users';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const users = await listAllUsers();

  return (
    <div>
      {users.map((u) => (
        <h2 key={u.id}>{u.name}</h2>
      ))}
    </div>
  );
}
