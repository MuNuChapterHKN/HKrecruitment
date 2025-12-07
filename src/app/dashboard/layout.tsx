import React from 'react';
import {
  SidebarProvider,
  SidebarTrigger,
  Separator,
  AbilityProvider,
  ModalPortal,
} from '@/components';
import { DashboardSidebar } from './Sidebar';

// Props del layout della dashboard
type DashboardLayoutProps = {
  children: React.ReactNode;
  breadcrumbs: React.ReactNode;
};

// ✅ Fake user per sviluppo locale (senza auth reale)
const DEV_USER = {
  id: '1',
  name: 'Dev User',
  email: 'dev@example.com',
  role: 'admin',
} as any;

export default function DashboardLayout({
  children,
  breadcrumbs,
}: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <AbilityProvider user={DEV_USER}>
        <DashboardSidebar user={DEV_USER} />
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
