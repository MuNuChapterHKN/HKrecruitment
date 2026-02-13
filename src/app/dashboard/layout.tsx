import { auth } from '@/lib/server/auth';
import { headers } from 'next/headers';

export default async function DashboardLayout({
  children,
}: LayoutProps<'/dashboard'>) {
  /* Check Auth */
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) return null;

  return <>{children}</>;
}
