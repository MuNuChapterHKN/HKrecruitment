import type { ApplicationStage } from "@/db/types";

export const stageLabels: Record<ApplicationStage, string> = {
  a: "Pending Application Review",
  b: "Awaiting",
  c: "Approving Interview Booking",
  d: "Awaiting Interview Result",
  e: "Choosing Area or Rejection",
  f: "Announce the Outcome",
  z: "Limbo",
  s: "Approved Member"
};

export function getStageLabel(stage: ApplicationStage): string {
  return stageLabels[stage];
}