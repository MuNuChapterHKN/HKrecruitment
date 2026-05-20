import type { CourseCount } from '@/lib/services/dashboard';

type CourseSummaryProps = {
  courseCounts: CourseCount[];
  limit?: number;
};

export function CourseSummary({ courseCounts, limit = 8 }: CourseSummaryProps) {
  const total = courseCounts.reduce((sum, c) => sum + c.count, 0);
  const visible = courseCounts.slice(0, limit);
  const hidden = courseCounts.length - visible.length;

  return (
    <div className="rounded-lg border bg-card p-4">
      <h2 className="text-base font-semibold mb-4">Applicants per course</h2>
      {total === 0 ? (
        <p className="text-sm text-muted-foreground">No applicants yet.</p>
      ) : (
        <>
          <ul className="space-y-3">
            {visible.map(({ course, count }) => {
              const pct = total > 0 ? (count / total) * 100 : 0;
              return (
                <li key={course} className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="flex-1 truncate" title={course}>
                      {course}
                    </span>
                    <span className="font-medium tabular-nums">{count}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
          {hidden > 0 && (
            <p className="text-xs text-muted-foreground mt-3">
              +{hidden} other{hidden !== 1 ? 's' : ''}
            </p>
          )}
        </>
      )}
    </div>
  );
}
