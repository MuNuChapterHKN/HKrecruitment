import type { ApplicationStage } from '@/db/types';

export const INTERVIEW_STAGE = 'c';
export const INTERVIEW_BOOKING_STAGE = 'b';
export const INTERVIEW_AWAITING_INTERVIEW = 'd';

export const stageLabels: Record<ApplicationStage, string> = {
  a: 'Pending Application Review',
  b: 'Awaiting',
  c: 'Approving Interview Booking',
  d: 'Awaiting Interview Result',
  e: 'Choosing Area or Rejection',
  f: 'Announce the Outcome',
  z: 'Limbo',
  s: 'Approved Member',
};

export function getStageLabel(stage: ApplicationStage): string {
  return stageLabels[stage];
}

export const stageColors: Record<string, string> = {
  a: '#f43f5e',
  b: '#f97316',
  c: '#eab308',
  d: '#8b5cf6',
  e: '#06b6d4',
  f: '#3b82f6',
  s: '#10b981',
  z: '#71717a',
};

export function getStageColor(stage: ApplicationStage): string {
  return stageColors[stage];
}
