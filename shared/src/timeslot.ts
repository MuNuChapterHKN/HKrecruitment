import { Action, ApplyAbilities } from "./abilities";
import { Role } from "./person";

export interface TimeSlot {
  id: number;
  start: Date;
  end: Date;
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
