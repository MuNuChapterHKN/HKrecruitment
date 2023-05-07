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
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),
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

export const applyAbilitiesForPerson: ApplyAbilities = (
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
  can(
    Action.Update,
    "Person",
    ["firstName", "lastName", "sex", "phone_no", "telegramId", "oauthId"],
    { oauthId: user.sub }
  );
  can(Action.Delete, "Person", { oauthId: user.sub });

  if (user.role === Role.Admin) {
    can(Action.Read, "Person");
    can(Action.Update, "Person", [
      "oauthId", // be careful when checking abilities on person, always override the provided oauthId with the one in the param
      "firstName",
      "lastName",
      "sex",
      "role",
      "email",
      "phone_no",
      "telegramId",
      "role",
    ]);
    can(Action.Delete, "Person");
  }
};

export type RoleChangeChecker = (prevRole: Role, nextRole: Role) => boolean;
/**
 * Given the role of an acting user, check if the role is allowed to change
 * the role of the target user, given prev and next role.
 */
export const getRoleChangeChecker =
  (actingRole: Role): RoleChangeChecker =>
  (prevRole, nextRole) => {
    if (prevRole === nextRole) {
      return true; // but why did you pass it
    }

    if (prevRole === Role.Applicant) {
      return false; // Applicants accounts can't be upgraded
    }

    if (nextRole === Role.Applicant) {
      return false; // Accounts can't be downgraded to applicant
    }

    if (nextRole === Role.None) {
      return false; // Role.None is not a valid role
    }

    switch (actingRole) {
      case Role.Admin:
        return prevRole !== Role.Admin; // Admin can't change own role or downgrade other admins
      default:
        return false;
    }
  };
