import { Availability } from "availability";
import { Action, ApplyAbilities } from "./abilities";
import { Role } from "./person";
import { RecruitmentSession } from "recruitment-session";

export interface TimeSlot {
  id: number;
  start: Date;
  end: Date;
  recruitmentSession: RecruitmentSession;
  availabilities: Availability[];
}

/* Abilities */

export const applyAbilitiesOnTimeSlot: ApplyAbilities = (
  user,
  { can, cannot }
) => {
  can(Action.Manage, "TimeSlot");
  switch (user.role) {
    case Role.Admin:
    case Role.Supervisor:
      can(Action.Manage, "TimeSlot");
      break;
    case Role.Clerk:
    case Role.Member:
    case Role.Applicant:
      can(Action.Read, "TimeSlot");
      break;
    default:
      cannot(Action.Manage, "TimeSlot");
  }
};
