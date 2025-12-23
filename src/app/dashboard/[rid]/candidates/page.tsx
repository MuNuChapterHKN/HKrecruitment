import { listAllApplicants } from '@/lib/services/applicants';
import { Applicant } from '@/db/types';
import { DashboardLink } from '@/components/dashboard/DashboardLink';
import { getStageLabel } from '@/lib/stages';

export default async function CandidatesPage() {
  const applicants = await listAllApplicants();

  return (
    <main className="px-6 py-4">
      <h1 className="text-2xl font-bold mb-6">Candidates</h1>

      <div className="grid gap-4">
        {applicants.map((applicant: Applicant) => (
          <div
            key={applicant.id}
            className="bg-card rounded-lg shadow p-4 flex justify-between items-center"
          >
            <div className="flex gap-4">
              <div
                className="w-16 rounded-md flex items-center justify-center font-semibold text-white text-3xl"
                style={{ background: `var(--color-stage-${applicant.stage})` }}
              >
                {applicant.stage.toUpperCase()}
              </div>
              <div>
                <div className="font-semibold">
                  {applicant.name} {applicant.surname}
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>
                    Application date:{' '}
                    {applicant.createdAt
                      ? new Date(applicant.createdAt).toLocaleDateString()
                      : ''}
                  </p>
                  <p>Stage: {getStageLabel(applicant.stage)}</p>
                </div>
              </div>
            </div>

            <DashboardLink href={`/candidates/${applicant.id}`}>
              <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md">
                View Details
              </button>
            </DashboardLink>
          </div>
        ))}
        {applicants.length === 0 && (
          <div className="text-center text-muted-foreground">
            No candidates found.
          </div>
        )}
      </div>
    </main>
  );
}
