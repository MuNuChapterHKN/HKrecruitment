import { Action, ApplyAbilities } from "./abilities";
import { Person, Role } from "./person";
import * as Joi from "joi";

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
  timeSlotId: number;
  member: Person;
  // assignedAt?: Date;
  // confirmedAt?: Date;
  // cancelledAt?: Date;
}

/* Validation schemas */

export const updateAvailabilitySchema = Joi.object<Availability>({
  state: Joi.string()
    .valid(...Object.values(AvailabilityType))
    .required(),
  timeSlotId: Joi.number().positive().required(),
}).options({
  stripUnknown: true,
  abortEarly: false,
  presence: "required",
});

/* Abilities */

export const applyAbilitiesOnAvailability: ApplyAbilities = (
  user,
  { can, cannot }
) => {
  switch (user.role) {
    case Role.Admin:
    case Role.Supervisor:
      can(Action.Manage, "Availability");
      break;
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
