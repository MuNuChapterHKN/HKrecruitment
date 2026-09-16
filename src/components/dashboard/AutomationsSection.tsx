import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import type { AutomationRun } from '@/lib/services/dashboard';

type AutomationsSectionProps = {
  automations: AutomationRun[];
};

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return 'just now';
  if (diffMin === 1) return '1 min ago';
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH === 1) return '1 hour ago';
  return `${diffH} hours ago`;
}

function formatDuration(ms: number): string {
  if (ms === 0) return '—';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function AutomationsSection({ automations }: AutomationsSectionProps) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <h2 className="text-base font-semibold mb-4">Automations</h2>
      {automations.length === 0 ? (
        <p className="text-sm text-muted-foreground">No automations found.</p>
      ) : (
        <ul className="divide-y divide-border">
          {automations.map((run) => (
            <li key={run.id} className="flex items-center gap-3 py-2.5">
              {run.status === 'success' && (
                <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
              )}
              {run.status === 'running' && (
                <Loader2 className="size-4 shrink-0 animate-spin text-blue-500" />
              )}
              {run.status === 'failed' && (
                <AlertCircle className="size-4 shrink-0 text-rose-500" />
              )}
              <span className="flex-1 text-sm font-medium">{run.name}</span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {formatDuration(run.durationMs)}
              </span>
              <span className="text-xs text-muted-foreground tabular-nums w-24 text-right">
                {formatRelativeTime(run.lastRunAt)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
