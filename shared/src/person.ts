import * as Joi from "joi";
import { Action, ApplyAbilities } from "./abilities";

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

export const applyAbilitiesOnPerson: ApplyAbilities = (
  user,
  { can, cannot }
) => {
  can(Action.Read, "Person", { oauthId: user.sub });
  can(
    Action.Create,
    "Person",
    [
      "oauthId",
      "firstName",
      "lastName",
      "sex",
      "email",
      "phone_no",
      "telegramId",
    ],
    { oauthId: user.sub }
  );
  // can(
  //   Action.Update,
  //   "Person",
  //   ["firstName", "lastName", "sex", "phone_no", "telegramId"],
  //   { oauthId: user.sub }
  // );
  can(Action.Delete, "Person", { oauthId: user.sub });

  if (user.role === Role.Admin) {
    can(Action.Manage, "Person"); // Admin can do anything on any user
  }

  cannot(Action.Update, "Person", ["oauthId"]); // No one can update oauthId
};
