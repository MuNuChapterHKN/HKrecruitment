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
import {
  findAllAsOptions,
  findOne,
  findUserRoleForSession,
} from '@/lib/services/recruitmentSessions';
import { notFound } from 'next/navigation';

type DashboardLayoutProps = {
  children: ReactNode;
  breadcrumbs: ReactNode;
  params: Promise<{
    rid: string;
  }>;
};

export default async function DashboardLayout({
  children,
  breadcrumbs,
  params,
}: DashboardLayoutProps) {
  /* Check Auth */
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) return null;
  const { user } = session;

  /* Check Recruitment Session */
  const { rid } = await params;
  const recruitment = await findOne(rid);
  if (!recruitment) notFound();

  /* Get All Recruitments as Options for Sidebar */
  const recruitmentOptions = await findAllAsOptions();

  /* Resolve user role for this recruitment session (if any) */
  const sessionRole = await findUserRoleForSession(user.id, rid);

  const userForAbility = {
    ...user,
    role: sessionRole,
  };

  return (
    <SidebarProvider>
      <AbilityProvider user={userForAbility}>
        <DashboardSidebar
          user={userForAbility}
          recruitment={{ selected: recruitment, options: recruitmentOptions }}
        />
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
