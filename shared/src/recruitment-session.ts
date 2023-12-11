import { AvailabilityState } from "availability";
import { Action, ApplyAbilities } from "./abilities";
import { Role } from "./person";
import DateExtension from "@joi/date";
import * as Joi from "joi";

const JoiDate = Joi.extend(DateExtension);


export enum RecruitmentSessionState {
  Active = "active",
  Concluded = "concluded",
}


// import BaseJoi from "joi";

export interface RecruitmentSession {
  state: RecruitmentSessionState;
  slotDuration: number;
  interviewStart: Date;
  interviewEnd: Date;
  days: [Date];
  createdAt: Date;
  lastModified: Date;
}

/* Validation schemas */

export const createRecruitmentSessionSchema = Joi.object<RecruitmentSession> ({
  state: Joi.string()
    .valid("active", "concluded")
    .required(),
  slotDuration: Joi.number()
    .integer(),
  interviewStart: JoiDate.date().format("YYYY-MM-DD HH:mm").required(),
  interviewEnd: JoiDate.date().format("YYYY-MM-DD HH:mm").required(),
    // days:
    lastModified: JoiDate.date().format("YYYY-MM-DD HH:mm").required()
}).options({
  stripUnknown: true,
  abortEarly: false,
  presence: "required",
});

export const updateRecruitmentSessionSchema = Joi.object<RecruitmentSession> ({
  state: Joi.string()
  .valid("active", "concluded")
  .optional(),
slotDuration: Joi.number()
  .integer(),
  interviewStart: JoiDate.date().format("YYYY-MM-DD HH:mm").optional(),
  interviewEnd: JoiDate.date().format("YYYY-MM-DD HH:mm").optional(),
  // days:
  // .optional(),
  createdAt: JoiDate.date().format("YYYY-MM-DD HH:mm").optional(),
  lastModified: JoiDate.date().format("YYYY-MM-DD HH:mm").optional()
});



/* Abilities */

export const applyAbilitiesOnRecruitmentSession: ApplyAbilities = (
  user,
  { can, cannot }
) => {
  can(Action.Manage, "RecruitmentSession");
  switch (user.role) {
    case Role.Admin:
    case Role.Supervisor:
      can(Action.Manage, "RecruitmentSession");
      break;
    case Role.Clerk: // puo o non puo ??????
    case Role.Member:
    case Role.Applicant:
      can(Action.Read, "RecruitmentSession");
      break;
    default:
      cannot(Action.Manage, "RecruitmentSession");
  }
};