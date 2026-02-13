import { A } from '@/lib/abilities';
import { AuthUserRole } from '@/lib/auth';
import { Calendar, CalendarClock, Gauge, Users } from 'lucide-react';

export const LINKS: Record<
  string,
  A<{
    links: A<{ label: string; href: string; icon?: React.ReactNode }>[];
  }>
> = {
  platform: {
    canRead: AuthUserRole.Guest,
    links: [
      {
        label: 'Overview',
        href: '/',
        icon: <Gauge />,
        canRead: AuthUserRole.Guest,
      },
      {
        label: 'Candidates',
        href: '/candidates',
        icon: <Users />,
        canRead: AuthUserRole.Guest,
      },
      {
        label: 'Availability Overview',
        href: '/availability',
        icon: <CalendarClock />,
        canRead: AuthUserRole.Guest,
      },
      {
        label: 'My Availability',
        href: '/me/availability',
        icon: <Calendar />,
        canRead: AuthUserRole.Guest,
      },
    ],
  },
};
