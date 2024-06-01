import { Person, createUserSchema, updateUserSchema, Role } from "./person";
import { TimeSlot } from "./timeslot";
import {
  Application,
  createApplicationSchema,
  updateApplicationSchema,
} from "./application";
import { Action, ApplyAbilities } from "./abilities";
import * as Joi from "joi";

export interface Interview {
  id: number;
  notes: string;
  createdAt: Date;
  timeslot: TimeSlot;
  application: Application;
  interviewer1: Person;
  interviewer2: Person;
  optionalInterviewer?: Person;
}

export const createInterviewSchema = Joi.object<Interview>({
  notes: Joi.string().required(),
  createdAt: Joi.date().required(),
  interviewer1: createUserSchema.required(),
  interviewer2: createUserSchema.required(),
  optionalInterviewer: createUserSchema.optional(),
});

export const updateInterviewSchema = Joi.object<Interview>({
  notes: Joi.string().optional(),
  createdAt: Joi.date().optional(),
  //timeslot: updateTimeSlotSchema.optional(),
  application: updateApplicationSchema.optional(),
  interviewer1: updateUserSchema.optional(),
  interviewer2: updateUserSchema.optional(),
  optionalInterviewer: updateUserSchema.optional(),
});

export const applyAbilitiesOnInterview: ApplyAbilities = (
  user,
  { can, cannot }
) => {
  if (user.role === Role.Admin || user.role === Role.Supervisor) {
    can(Action.Manage, "Interview");
  } else {
    cannot(Action.Manage, "Interview");
  }
};
