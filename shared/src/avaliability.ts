import { Person, Role } from "person";
import { TimeSlot } from "timeslot";
import * as Joi from "joi";
import { Action, ApplyAbilities } from "abilities";

export enum AvailabilityState {
  Subscribed = "subscribed",
  Confirmed = "confirmed",
  Cancelled = "cancelled",
}

export enum AvailabilityType {
  Available = "available",
  Unavailable = "unavailable",
}

export interface Availability {
  state: AvailabilityState;
  timeSlot: TimeSlot;
  member: Person;
  // assignedAt?: Date;
  // confirmedAt?: Date;
  // cancelledAt?: Date;
}

/* Validation schemas */

const updateAvailabilitySchema = Joi.object<Availability>({
  state: Joi.string()
    .valid(...Object.values(AvailabilityType))
    .required(),
  timeSlot: Joi.object<TimeSlot>({
    start: Joi.date().required(),
    end: Joi.date().required(),
  }).required(),
});

/* Abilities */

export const applyAbilitiesOnAvailability: ApplyAbilities = (
  user,
  { can, cannot }
) => {
  switch (user.role) {
    case Role.Admin:
      // Admin can do anything on any availability
      can(Action.Manage, "Availability");
      break;
    case Role.Supervisor:
    case Role.Member:
    case Role.Clerk:
      can(Action.Read, "Availability");
      can(Action.Update, "Availability", { userId: user.sub });
      break;
    case Role.Applicant:
      can(Action.Read, "Availability", { userId: user.sub });
      can(Action.Update, "Availability", { userId: user.sub });
      break;
    default:
      cannot(Action.Manage, "Availability");
  }
};
