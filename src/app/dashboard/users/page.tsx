import UsersTable from './UsersTable';

export default async function UsersPage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">Members</h1>

      <UsersTable />
    </main>
  );
}
