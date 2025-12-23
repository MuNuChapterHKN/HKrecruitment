import { findLatest } from '@/lib/services/recruitmentSessions';
import { redirect } from 'next/navigation';

export default async function DashboardHomepage() {
  const latestRecruitment = await findLatest();

  if (latestRecruitment) redirect('/dashboard/' + latestRecruitment.id);

  return (
    <>
      <h1>No recruitments found!</h1>
      <p>Make a new one by pressing the button below</p>
      <button>New Recruitment Session</button>
    </>
  );
}
