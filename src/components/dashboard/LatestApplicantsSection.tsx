import { ApplicantCard } from '@/components/dashboard/ApplicantCard';
import type { Applicant } from '@/db/types';

type LatestApplicantsSectionProps = {
  applicants: Applicant[];
};

export function LatestApplicantsSection({
  applicants,
}: LatestApplicantsSectionProps) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <h2 className="text-base font-semibold mb-4">Latest applicants</h2>
      {applicants.length === 0 ? (
        <p className="text-sm text-muted-foreground">No applicants yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <div className="flex gap-4 pb-2">
            {applicants.map((applicant) => (
              <ApplicantCard key={applicant.id} applicant={applicant} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
