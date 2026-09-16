import type { AppSubject } from '@/lib/abilities';
import { Calendar, CalendarClock, Gauge, Users } from 'lucide-react';

type SidebarLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
  subject: AppSubject;
};

export const LINKS: Record<string, { links: SidebarLink[] }> = {
  platform: {
    links: [
      {
        label: 'Overview',
        href: '/',
        icon: <Gauge />,
        subject: 'DashboardOverviewPage',
      },
      {
        label: 'Candidates',
        href: '/candidates',
        icon: <Users />,
        subject: 'CandidatesPage',
      },
      {
        label: 'Availability Overview',
        href: '/availability',
        icon: <CalendarClock />,
        subject: 'AvailabilityOverviewPage',
      },
      {
        label: 'My Availability',
        href: '/me/availability',
        icon: <Calendar />,
        subject: 'MyAvailabilityPage',
      },
    ],
  },
};
