import type { ApplicationStage } from "@/db/types";

export interface StageConfig {
  label: string;
  buttons: Array<{
    text: string;
    color: string;
    hoverColor: string;
    action: string;
  }>;
}

export const stageConfig: Record<ApplicationStage, StageConfig> = {
  a: {
    label: "Pending Application Review",
    buttons: [
      { text: "Accept Application", color: "bg-green-600", hoverColor: "hover:bg-green-700", action: "accept" },
      { text: "Move to Limbo", color: "bg-yellow-600", hoverColor: "hover:bg-yellow-700", action: "limbo" }
    ]
  },
  b: {
    label: "Awaiting",
    buttons: [
      { text: "Move to Limbo", color: "bg-yellow-600", hoverColor: "hover:bg-yellow-700", action: "limbo" }
    ]
  },
  c: {
    label: "Approving Interview Booking",
    buttons: [
      { text: "Approve Interview", color: "bg-blue-600", hoverColor: "hover:bg-blue-700", action: "approve_interview" },
      { text: "Move to Limbo", color: "bg-yellow-600", hoverColor: "hover:bg-yellow-700", action: "limbo" }
    ]
  },
  d: {
    label: "Awaiting Interview Result",
    buttons: [
      { text: "Submit Interview Report", color: "bg-purple-600", hoverColor: "hover:bg-purple-700", action: "submit_report" },
      { text: "Move to Limbo", color: "bg-yellow-600", hoverColor: "hover:bg-yellow-700", action: "limbo" }
    ]
  },
  e: {
    label: "Choosing Area or Rejection",
    buttons: [
      { text: "Assign to Area", color: "bg-green-600", hoverColor: "hover:bg-green-700", action: "assign_area" },
      { text: "Reject", color: "bg-red-600", hoverColor: "hover:bg-red-700", action: "reject" },
      { text: "Move to Limbo", color: "bg-yellow-600", hoverColor: "hover:bg-yellow-700", action: "limbo" }
    ]
  },
  f: {
    label: "Announce the Outcome",
    buttons: [
      { text: "Move to Limbo", color: "bg-yellow-600", hoverColor: "hover:bg-yellow-700", action: "limbo" }
    ]
  },
  z: {
    label: "Limbo",
    buttons: [
      { text: "Remove from Limbo", color: "bg-blue-600", hoverColor: "hover:bg-blue-700", action: "remove_limbo" }
    ]
  },
  s: {
    label: "Approved Member",
    buttons: []
  }
};

export function getStageLabel(stage: ApplicationStage): string {
  return stageConfig[stage]?.label || "unknown stage";
}