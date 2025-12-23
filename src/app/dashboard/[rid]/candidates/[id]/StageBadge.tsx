'use client';

import {
  Badge,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui';
import { stageLabels, getStageColor } from '@/lib/stages';
import type { ApplicationStage } from '@/db/types';

type StageBadgeProps = {
  stage: ApplicationStage;
};

const stageOrder = ['a', 'b', 'c', 'd', 'e', 'f', 's'];

export function StageBadge({ stage }: StageBadgeProps) {
  const currentStageIndex = stageOrder.indexOf(stage);

  const isPreviousStage = (stageKey: string) => {
    if (stageKey === 'z') return false;
    const stageIndex = stageOrder.indexOf(stageKey);
    return stageIndex !== -1 && stageIndex < currentStageIndex;
  };

  const regularStages = Object.entries(stageLabels).filter(
    ([key]) => key !== 'z'
  );
  const limboStage = Object.entries(stageLabels).find(([key]) => key === 'z');

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          className="px-4 py-2 text-sm font-medium rounded-full cursor-help"
          style={{ backgroundColor: getStageColor(stage) }}
        >
          Stage {stage.toUpperCase()}
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs p-4">
        <div className="space-y-2.5">
          <div className="font-semibold text-sm mb-3">All Stages:</div>
          {regularStages.map(([stageKey, label]) => {
            const isGrayedOut = isPreviousStage(stageKey);
            return (
              <div
                key={stageKey}
                className={`flex items-center gap-2.5 text-xs ${
                  stageKey === stage ? 'font-bold' : ''
                } ${isGrayedOut ? 'opacity-40' : ''}`}
              >
                <span
                  className="w-6 h-6 rounded flex items-center justify-center text-white font-medium text-xs shrink-0"
                  style={{
                    backgroundColor: getStageColor(
                      stageKey as ApplicationStage
                    ),
                  }}
                >
                  {stageKey.toUpperCase()}
                </span>
                <span>{label}</span>
              </div>
            );
          })}

          {limboStage && (
            <>
              <div className="border-t border-border/50 my-3" />
              <div
                className={`flex items-center gap-2.5 text-xs ${
                  limboStage[0] === stage ? 'font-bold' : ''
                }`}
              >
                <span
                  className="w-6 h-6 rounded flex items-center justify-center text-white font-medium text-xs shrink-0"
                  style={{
                    backgroundColor: getStageColor(
                      limboStage[0] as ApplicationStage
                    ),
                  }}
                >
                  {limboStage[0].toUpperCase()}
                </span>
                <span>{limboStage[1]}</span>
              </div>
            </>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
