import { auth } from '@/lib/server/auth';
import { headers } from 'next/headers';
import type { ReactNode } from 'react';

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  /* Check Auth */
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) return null;

  return <>{children}</>;
}
