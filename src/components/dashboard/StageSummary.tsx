import { getStageColor, getStageLabel } from '@/lib/stages';
import type { StageCount } from '@/lib/services/dashboard';

type StageSummaryProps = {
  stageCounts: StageCount[];
};

export function StageSummary({ stageCounts }: StageSummaryProps) {
  const total = stageCounts.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="rounded-lg border bg-card p-4">
      <h2 className="text-base font-semibold mb-4">Candidates per stage</h2>
      {total === 0 ? (
        <p className="text-sm text-muted-foreground">No candidates yet.</p>
      ) : (
        <ul className="space-y-3">
          {stageCounts.map(({ stage, count }) => {
            const pct = total > 0 ? (count / total) * 100 : 0;
            return (
              <li key={stage} className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <span
                    className="w-3 h-3 rounded-sm shrink-0"
                    style={{ backgroundColor: getStageColor(stage) }}
                  />
                  <span className="flex-1 truncate">
                    {getStageLabel(stage)}
                  </span>
                  <span className="font-medium tabular-nums">{count}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: getStageColor(stage),
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
