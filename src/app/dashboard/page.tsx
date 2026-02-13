import { findLatest } from '@/lib/services/recruitmentSessions';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function DashboardHomepage() {
  const latestRecruitment = await findLatest();

  if (latestRecruitment) redirect('/dashboard/' + latestRecruitment.id);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/20">
      <div className="w-full max-w-md text-center">
        <div className="rounded-lg border bg-card p-8 shadow-lg">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">
              No Recruitments Found
            </h1>
            <p className="text-muted-foreground mt-3 text-base">
              Get started by creating your first recruitment session
            </p>
          </div>
          <Button asChild size="lg" className="w-full">
            <Link href="/dashboard/recruitments/new">
              New Recruitment Session
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
