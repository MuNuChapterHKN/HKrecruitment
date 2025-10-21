import { Applicant } from "@/db/types";

export interface BaseModalProps {
  applicant?: Applicant;
  onClose: () => void;
}
