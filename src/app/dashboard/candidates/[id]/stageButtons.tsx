import type { ApplicationStage, Applicant } from "@/db/types";
import { dismissModal, openModal } from "@/components/modals";

import {
  ApproveInterviewModal,
  LimboModal,
  SubmitReportModal,
  AssignAreaModal,
  RejectModal,
  RemoveLimboModal
} from "@/components/dashboard";

export interface StageButton {
  text: string;
  className: string;
  callback: (applicant: Applicant) => void;
}

const limboButton: StageButton = {
  text: "Move to Limbo",
  className: "bg-yellow-600 hover:bg-yellow-700",
  callback: (applicant: Applicant) =>
    openModal(<LimboModal onClose={() => dismissModal()} applicant={applicant} />)
};

export const stageButtons: Record<ApplicationStage, StageButton[]> = {
  a: [
    {
      text: "Accept Application",
      className: "bg-green-600 hover:bg-green-700",
      callback: (applicant) => {
        // TODO: Implement direct action for accept
        console.log("Accept action for", applicant.id);
      }
    },
    limboButton
  ],
  b: [
    limboButton
  ],
  c: [
    {
      text: "Approve Interview",
      className: "bg-blue-600 hover:bg-blue-700",
      callback: (applicant) =>
        openModal(<ApproveInterviewModal onClose={() => dismissModal()} applicant={applicant} />)
    },
    limboButton
  ],
  d: [
    {
      text: "Submit Interview Report",
      className: "bg-purple-600 hover:bg-purple-700",
      callback: (applicant) =>
        openModal(<SubmitReportModal onClose={() => dismissModal()} applicant={applicant} />)
    },
    limboButton
  ],
  e: [
    {
      text: "Assign to Area",
      className: "bg-green-600 hover:bg-green-700",
      callback: (applicant) =>
        openModal(<AssignAreaModal onClose={() => dismissModal()} applicant={applicant} />)
    },
    {
      text: "Reject",
      className: "bg-red-600 hover:bg-red-700",
      callback: (applicant) =>
        openModal(<RejectModal onClose={() => dismissModal()} applicant={applicant} />)
    },
    limboButton
  ],
  f: [
    limboButton
  ],
  z: [
    {
      text: "Remove from Limbo",
      className: "bg-blue-600 hover:bg-blue-700",
      callback: (applicant) =>
        openModal(<RemoveLimboModal onClose={() => dismissModal()} applicant={applicant} />)
    }
  ],
  s: []
};


