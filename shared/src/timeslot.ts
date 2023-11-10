import { Action, ApplyAbilities } from "./abilities";
import { Role } from "./person";
import DateExtension from "@joi/date";
import * as Joi from "joi";
const JoiDate = Joi.extend(DateExtension);

// import BaseJoi from "joi";
// const Joi = BaseJoi.extend(JoiDate);

export interface TimeSlot {
  start: Date;
  end: Date;
}

/* Validation schemas */

export const createTimeSlotSchema = Joi.object<TimeSlot>({
  start: JoiDate.date().format("YYYY-MM-DD HH:mm").required(),
  end: JoiDate.date().format("YYYY-MM-DD HH:mm").required(),
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
  can(Action.Manage, "TimeSlot");
  // switch (user.role) {
  //   case Role.Admin:
  //   case Role.Supervisor:
  //   case Role.Clerk:
  //     // TODO: Decide who can create/delete timeslots
  //     can(Action.Manage, "TimeSlot");
  //     break;
  //   case Role.Member:
  //   case Role.Applicant:
  //     can(Action.Read, "TimeSlot");
  //     break;
  //   default:
  //     cannot(Action.Manage, "TimeSlot");
  // }
};
