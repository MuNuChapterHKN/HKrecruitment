import { Award, Medal, Trophy } from 'lucide-react';
import { headers } from 'next/headers';
import Link from 'next/link';

import { auth } from '@/lib/server/auth';
import { requirePageAccess } from '@/lib/helpers/pageAuthorization';
import { getRecruiterLeaderboard } from '@/lib/services/leaderboard';

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <Trophy className="h-6 w-6 text-amber-500" aria-label="First place" />
    );
  }

  if (rank === 2) {
    return (
      <Medal className="h-6 w-6 text-slate-400" aria-label="Second place" />
    );
  }

  if (rank === 3) {
    return (
      <Award className="h-6 w-6 text-amber-700" aria-label="Third place" />
    );
  }

  return (
    <span className="flex h-6 w-6 items-center justify-center text-sm font-semibold text-muted-foreground">
      {rank}
    </span>
  );
}

export default async function LeaderboardPage({
  params,
}: PageProps<'/dashboard/[rid]/leaderboard'>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  const { rid } = await params;

  await requirePageAccess(session.user.id, rid, 'LeaderboardPage');

  const leaderboardData = await getRecruiterLeaderboard(rid);

  const leaderboard = leaderboardData.map((entry) => ({
    ...entry,
    rank:
      leaderboardData.findIndex(
        (candidate) => candidate.interviewCount === entry.interviewCount
      ) + 1,
  }));

  return (
    <main className="p-6">
      <header className="mb-6">
        <div className="flex items-center gap-3">
          <Trophy className="h-7 w-7" />

          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Recruiter Leaderboard
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Interview activity for the current recruitment session.
            </p>
          </div>
        </div>
      </header>

      {leaderboard.length === 0 ? (
        <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
          No interviews have been assigned yet.
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((recruiter) => {
            const rank = recruiter.rank;

            return (
              <div
                key={recruiter.userId}
                className="flex w-full gap-4 rounded-lg border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex w-10 shrink-0 justify-center pt-1">
                  <RankIcon rank={rank} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h2 className="text-lg font-semibold">
                        {recruiter.name}
                      </h2>

                      <p className="text-sm text-muted-foreground">
                        Rank #{rank}
                      </p>
                    </div>

                    <div className="rounded-full border bg-muted px-3 py-1 text-sm font-semibold">
                      {recruiter.interviewCount}{' '}
                      {recruiter.interviewCount === 1
                        ? 'interview'
                        : 'interviews'}
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="mb-2 text-sm font-medium">
                      Candidates interviewed
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {recruiter.candidates.map((candidate) => (
                        <Link
                          key={candidate.id}
                          href={`/dashboard/${rid}/candidates/${candidate.id}`}
                          className="rounded-md bg-muted px-2.5 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground hover:underline"
                        >
                          {candidate.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
