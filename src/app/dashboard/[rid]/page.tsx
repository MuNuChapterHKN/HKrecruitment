import { findOne } from '@/lib/services/recruitmentSessions';
import { listAllApplicants } from '@/lib/services/applicants';
import { notFound } from 'next/navigation';
import { getStageColor } from '@/lib/stages';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

export default async function Dashboard({
  params,
}: PageProps<'/dashboard/[rid]'>) {
  const { rid } = await params;
  const recruitmentSession = await findOne(rid);
  if (!recruitmentSession) notFound();

  const applicants = await listAllApplicants(rid);
  const total = applicants.length;
  const accepted = applicants.filter((a) => a.accepted).length;
  const stageCounts: Record<string, number> = {};
  applicants.forEach((a) => {
    stageCounts[a.stage] = (stageCounts[a.stage] || 0) + 1;
  });

  // Import stageLabels for all possible stages
  import { stageLabels } from '@/lib/stages';

  return (
    <main className="px-6 py-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Recruitment Overview</h1>
      <div className="flex flex-col md:flex-row gap-8 w-full items-start">
        <div className="flex flex-col gap-6 w-full md:w-1/3 min-w-[320px] flex-grow">
          <Card className="transition-transform hover:scale-[1.025] hover:shadow-lg min-w-[320px] flex-grow">
            <CardHeader>
              <CardTitle className="text-5xl font-extrabold tracking-tight mb-2 whitespace-normal break-words">
                {total}
              </CardTitle>
              <CardDescription className="text-base whitespace-normal break-words">
                Total Applicants
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="transition-transform hover:scale-[1.025] hover:shadow-lg min-w-[320px] flex-grow">
            <CardHeader>
              <CardTitle className="text-5xl font-extrabold tracking-tight mb-2 whitespace-normal break-words">
                {accepted}
              </CardTitle>
              <CardDescription className="text-base whitespace-normal break-words">
                Accepted
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
        <Card className="w-full md:w-2/3">
          <CardHeader>
            <CardTitle className="text-xl font-bold tracking-tight text-left">
              Applicants by Stage
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 w-full">
            {Object.entries(stageLabels).map(([stage, label]) => (
              <div
                key={stage}
                className="flex items-center gap-4 px-6 py-3 rounded-lg w-full border border-border bg-background"
              >
                <span
                  className="inline-block w-4 h-4 rounded-full mr-2 border border-border"
                  style={{ background: getStageColor(stage) }}
                  aria-label={label}
                />
                <span className="text-xl font-bold w-10 text-left">
                  {stageCounts[stage] || 0}
                </span>
                <span className="text-base font-medium flex-1 text-left">
                  {label}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
