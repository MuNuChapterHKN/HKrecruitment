import type { AppSubject } from '@/lib/abilities';
import { Calendar, CalendarClock, Gauge, Headset, Users, FileText } from 'lucide-react';


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
      {
        label: 'Upcoming Interviews',
        href: '/me/interviews',
        icon: <Headset />,
        subject: 'UpcomingInterviewsPage',
      },
      {
        label: 'Templates',
        href: '/templates',
        icon: <FileText />,
        subject: 'TemplatesPage',
      },
    ],
  },
};
