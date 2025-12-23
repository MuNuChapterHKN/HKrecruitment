import Link from 'next/link';
import { listAllApplicants } from '@/lib/services/applicants';
import { Applicant } from '@/db/types';

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
            <div>
              <div className="font-semibold">
                {applicant.name} {applicant.surname}
              </div>
              <div className="text-sm text-muted-foreground">
                Application date:{' '}
                {applicant.createdAt
                  ? new Date(applicant.createdAt).toLocaleDateString()
                  : ''}
              </div>
            </div>

            <Link href={`/dashboard/candidates/${applicant.id}`}>
              <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md">
                View Details
              </button>
            </Link>
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
