import * as Joi from "joi";
import { string } from "joi";

export enum Role {
  None = "none",
  Applicant = "applicant",
  Member = "member",
  Clerk = "clerk",
  Supervisor = "supervisor",
  Admin = "admin",
}

export interface Person {
  oauthId: string;
  firstName: string;
  lastName: string;
  sex: string;
  email: string;
  phone_no?: string;
  telegramId?: string;
  role: Role;
}

export const createUserSchema = Joi.object<Person>({
  oauthId: Joi.string().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  sex: Joi.string().required(),
  email: Joi.string().required(),
  phone_no: Joi.string()
    .regex(/^\+?[0-9]{8,15}$/)
    .optional(),
  telegramId: Joi.string().optional(),
  role: Joi.string()
    .valid("none", "applicant", "member", "clerk", "supervisor", "admin")
    .optional(),
});

export const updateUserSchema = Joi.object<Person>({
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  sex: Joi.string().optional(),
  phone_no: Joi.string()
    .regex(/^\+?[0-9]{8,15}$/)
    .optional(),
  telegramId: Joi.string().optional(),
  role: Joi.string()
    .valid("none", "applicant", "member", "clerk", "supervisor", "admin")
    .optional(),
});
