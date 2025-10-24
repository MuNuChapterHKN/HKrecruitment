import { listAllUsers } from '@/lib/models/users';

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
