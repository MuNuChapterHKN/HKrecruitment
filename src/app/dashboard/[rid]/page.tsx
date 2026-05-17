import { notFound } from 'next/navigation';
import { getDashboardData } from '@/lib/services/dashboard';
import { ActivityChart } from '@/components/dashboard/ActivityChart';
import { StageSummary } from '@/components/dashboard/StageSummary';
import { CourseSummary } from '@/components/dashboard/CourseSummary';
import { AutomationsSection } from '@/components/dashboard/AutomationsSection';
import { LatestApplicantsSection } from '@/components/dashboard/LatestApplicantsSection';

export default async function Dashboard({
  params,
}: PageProps<'/dashboard/[rid]'>) {
  const { rid } = await params;
  const data = await getDashboardData(rid);
  if (!data.session) notFound();

  const {
    session,
    activity,
    stageCounts,
    courseCounts,
    latestApplicants,
    automations,
  } = data;

  return (
    <main className="px-6 py-4 space-y-6">
      <header>
        <h1 className="text-2xl font-bold">
          Recruitment {session.year} · Semester {session.semester}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of activity and pipeline for the current session.
        </p>
      </header>

      <section className="rounded-lg border bg-card p-4">
        <h2 className="text-base font-semibold mb-4">Applicant activity</h2>
        <ActivityChart activity={activity} />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StageSummary stageCounts={stageCounts} />
        <CourseSummary courseCounts={courseCounts} />
      </section>

      <AutomationsSection automations={automations} />

      <LatestApplicantsSection applicants={latestApplicants} />
    </main>
  );
}
