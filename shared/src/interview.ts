import { Person, createUserSchema, updateUserSchema, Role } from "./person";
import { TimeSlot, createTimeSlotSchema } from "timeslot";
import { Application, createApplicationSchema, updateApplicationSchema } from "application";
import { Action, ApplyAbilities } from "./abilities";
import * as Joi from "joi";

export interface Interview {
    id: number;
    notes: string;
    created_at: Date;
    timeslot: TimeSlot;
    application: Application;
    interviewer_1: Person;
    interviewer_2: Person;
    optional_interviewer?: Person;
};

export const createInterviewSchema = Joi.object<Interview>({
    notes: Joi.string().required(),
    created_at: Joi.date().required(),
    interviewer_1: createUserSchema.required(),
    interviewer_2: createUserSchema.required(),
    optional_interviewer: createUserSchema.optional(),        
});

export const updateInterviewSchema = Joi.object<Interview>({
    notes: Joi.string().optional(),
    created_at: Joi.date().optional(),
    timeslot: createTimeSlotSchema.optional(),
    application: updateApplicationSchema.optional(),
    interviewer_1: updateUserSchema.optional(),
    interviewer_2: updateUserSchema.optional(),
    optional_interviewer: updateUserSchema.optional()
}); 

export const applyAbilitiesOnInterview: ApplyAbilities = (
    user,
    { can, cannot }
  ) => {
    if (user.role === Role.Admin || user.role === Role.Supervisor) {
      can(Action.Manage, "Interview");
    } 
    else{
      cannot(Action.Manage, "Interview")
    }
  };
  