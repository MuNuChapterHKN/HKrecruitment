import { TimeSlot } from "./timeslot";
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
  id: number;
  state: AvailabilityState;
  lastModified: Date;
  timeSlot: TimeSlot;
  user: Person;
}

/* Validation schemas */

export const insertAvailabilitySchema = Joi.object({
  timeSlotId: Joi.number().required(),
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
      can(Action.Create, "Availability");
      can(Action.Read, "Availability");
      can(Action.Delete, "Availability");
      cannot(Action.Update, "Availability");
      break;
    case Role.Applicant:
    default:
      cannot(Action.Manage, "Availability");
  }
};
