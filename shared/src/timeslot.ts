import { Action, ApplyAbilities } from "./abilities";
import { Role } from "./person";
import Joi from "joi";

export interface TimeSlot {
  start: Date;
  end: Date;
}

/* Validation schemas */

export const createTimeSlotSchema = Joi.object<TimeSlot>({
  start: Joi.date().required(),
  end: Joi.date().required(),
}).options({
  stripUnknown: true,
  abortEarly: false,
  presence: "required",
});

/* Abilities */

export const applyAbilitiesOnTimeSlot: ApplyAbilities = (
  user,
  { can, cannot }
) => {
  switch (user.role) {
    case Role.Admin:
    case Role.Supervisor:
    case Role.Clerk:
      // TODO: Decide who can create/delete timeslots
      can(Action.Manage, "TimeSlot");
      break;
    case Role.Member:
    case Role.Applicant:
      can(Action.Read, "TimeSlot");
      break;
    default:
      cannot(Action.Manage, "TimeSlot");
  }
};
