import { Breadcrumbs } from './Breadcrumbs';
import { findOne } from '@/lib/services/recruitmentSessions';

type Props = {
  params: Promise<{
    rid: string;
  }>;
};

export default async function BreadcrumbsSlot(props: Props) {
  const { rid } = await props.params;
  const recruitment = await findOne(rid);

  return (
    <Breadcrumbs
      breadcrumbs={[
        {
          label: 'Dashboard',
          href: '/dashboard',
        },
        {
          label: recruitment
            ? `Y${recruitment.year} H${recruitment.semester}`
            : rid,
          href: `/dashboard/${rid}`,
        },
      ]}
    />
  );
}
