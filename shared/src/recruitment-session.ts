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
  days: Date[];
  createdAt: Date;
  lastModified: Date;
}

/* Validation schemas */

export const createRecruitmentSessionSchema = Joi.object<RecruitmentSession>({
  state: Joi.string().valid("active", "concluded").required(),
  slotDuration: Joi.number().integer(),
  interviewStart: JoiDate.date().format("HH:mm").required(),
  interviewEnd: JoiDate.date().format("HH:mm").required(),
  days: Joi.array().items(JoiDate.format("YYYY-MM-DD")),
  lastModified: JoiDate.date().format("YYYY-MM-DD HH:mm").required(),
}).options({
  stripUnknown: true,
  abortEarly: false,
  presence: "required",
});

export const updateRecruitmentSessionSchema = Joi.object<RecruitmentSession>({
  state: Joi.string().valid("active", "concluded").optional(),
  slotDuration: Joi.number().integer(),
  interviewStart: JoiDate.date().format("YYYY-MM-DD HH:mm").optional(),
  interviewEnd: JoiDate.date().format("YYYY-MM-DD HH:mm").optional(),
  days: Joi.array().items(JoiDate.format("YYYY-MM-DD")).optional(),
  createdAt: JoiDate.date().format("YYYY-MM-DD HH:mm").optional(),
  lastModified: JoiDate.date().format("YYYY-MM-DD HH:mm").optional(),
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
    case Role.Clerk:
    case Role.Member:
      can(Action.Read, "RecruitmentSession");
      break;
    case Role.Applicant:
      cannot(Action.Manage, "RecruitmentSession");
      break;
    default:
      cannot(Action.Manage, "RecruitmentSession");
  }
};
