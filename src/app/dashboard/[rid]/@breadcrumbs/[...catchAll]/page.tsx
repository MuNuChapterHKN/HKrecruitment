import { capitalize } from '@/lib/utils';
import { Breadcrumbs } from '../Breadcrumbs';
import { findOne } from '@/lib/services/recruitmentSessions';
import { getApplicantById } from '@/lib/services/applicants';

type Props = {
  params: Promise<{
    catchAll: string[];
    rid: string;
  }>;
};

export default async function BreadcrumbsSlot(props: Props) {
  const { catchAll, rid } = await props.params;

  const breadcrumbs = await Promise.all(
    catchAll.map(async (part, i, a) => {
      let label = capitalize(part);

      if (part === rid) {
        const recruitment = await findOne(rid);
        if (recruitment) {
          label = `Y${recruitment.year} H${recruitment.semester}`;
        }
      } else if (i > 0 && a[i - 1] === 'candidates') {
        const candidate = await getApplicantById(part);
        if (candidate) {
          label = `${candidate.name} ${candidate.surname}`;
        }
      }

      return {
        label,
        href: '/' + a.slice(0, i + 1).join('/'),
      };
    })
  );

  return <Breadcrumbs breadcrumbs={breadcrumbs} />;
}
