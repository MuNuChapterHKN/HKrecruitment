import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui';
import { getStageLabel } from '@/lib/stages';
import type { ApplicationStage } from '@/db/types';

type StageHistoryItem = {
  id: string;
  stage: ApplicationStage;
  processed: boolean;
  createdAt: Date;
  deletedAt: Date | null;
  assignedBy: {
    id: string;
    name: string;
    image: string | null;
  } | null;
};

type StageHistoryProps = {
  history: StageHistoryItem[];
};

export function StageHistory({ history }: StageHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No stage history available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((item) => (
        <div
          key={item.id}
          className={`bg-muted/30 rounded-lg border p-4 ${
            item.deletedAt ? 'line-through opacity-60' : ''
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-lg">
                  {getStageLabel(item.stage)}
                </h3>
                <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                  Stage {item.stage.toUpperCase()}
                </span>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>
                  <span className="font-medium">Created:</span>{' '}
                  {new Date(item.createdAt).toLocaleString()}
                </div>
                {item.deletedAt && (
                  <div>
                    <span className="font-medium">Deleted:</span>{' '}
                    {new Date(item.deletedAt).toLocaleString()}
                  </div>
                )}
                <div>
                  <span className="font-medium">Processed:</span>{' '}
                  {item.processed ? 'Yes' : 'No'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {item.assignedBy ? (
                <>
                  <Avatar className="size-8">
                    {item.assignedBy.image && (
                      <AvatarImage
                        src={item.assignedBy.image}
                        alt={item.assignedBy.name}
                      />
                    )}
                    <AvatarFallback className="text-xs">
                      {item.assignedBy.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {item.assignedBy.name}
                  </span>
                </>
              ) : (
                <span className="text-sm font-medium text-muted-foreground">
                  SYSTEM
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
