import type { ReactNode } from 'react';
import {
  SidebarProvider,
  SidebarTrigger,
  Separator,
  AbilityProvider,
  ModalPortal,
} from '@/components';
import { DashboardSidebar } from './Sidebar';
import { auth } from '@/lib/server/auth';
import { headers } from 'next/headers';

type DashboardLayoutProps = {
  children: ReactNode;
  breadcrumbs: ReactNode;
};

export default async function DashboardLayout({
  children,
  breadcrumbs,
}: DashboardLayoutProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  const { user } = session;

  return (
    <SidebarProvider>
      <AbilityProvider user={user}>
        <DashboardSidebar user={user} />
        <main className="w-full">
          <div className="w-full flex h-12 items-center gap-2 px-2 py-2 border-b-1 border-border bg-sidebar">
            <SidebarTrigger className="cursor-pointer" />
            <Separator orientation="vertical" className="mr-2" />
            {breadcrumbs}
          </div>
          {children}
        </main>
        <ModalPortal />
      </AbilityProvider>
    </SidebarProvider>
  );
}
