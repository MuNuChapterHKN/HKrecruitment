import {
  AbilityBuilder,
  AbilityClass,
  createMongoAbility,
  PureAbility,
  subject,
} from "@casl/ability";
import { applyAbilitiesForPerson, Person, Role } from "./person";
import { Application, applyAbilitiesOnApplication } from "./application";
import { applyAbilitiesOnAvailability, Availability } from "./availability";
import { TimeSlot } from "./timeslot";
import { RecruitmentSession } from "recruitment-session";
import { applyAbilitiesOnRecruitmentSession } from "recruitment-session";

export interface UserAuth {
  sub: string;
  role: Role;
}

export enum Action {
  Manage = "manage",
  Create = "create",
  Read = "read",
  Update = "update",
  Delete = "delete",
}
type SubjectsTypes =
  | Partial<Person>
  | Partial<Application>
  | Partial<Availability>
  | Partial<TimeSlot>
  | Partial<RecruitmentSession>;
type SubjectNames =
  | "Person"
  | "Application"
  | "Availability"
  | "TimeSlot"
  | "RecruitmentSession";
export type Subjects = SubjectsTypes | SubjectNames;

export type AppAbility = PureAbility<[Action, Subjects]>;
export const AppAbility = PureAbility as AbilityClass<AppAbility>;

export type ApplyAbilities = (
  user: UserAuth,
  { can, cannot }: AbilityBuilder<AppAbility>
) => void;

export const abilityForUser = (user: UserAuth): AppAbility => {
  const builder = new AbilityBuilder<AppAbility>(createMongoAbility);

  applyAbilitiesForPerson(user, builder);
  applyAbilitiesOnApplication(user, builder);
  applyAbilitiesOnAvailability(user, builder);
  applyAbilitiesOnRecruitmentSession(user, builder);

  const { build } = builder;
  return build();
};

export const checkAbility = (
  ability: AppAbility,
  action: Action,
  subjectObj: SubjectsTypes,
  subjectName: SubjectNames,
  conditions: String[] = []
): boolean => {
  const subj = subject(subjectName, subjectObj);

  return (
    ability.can(action, subj) &&
    Object.keys(subj)
      .filter((field) => !conditions.includes(field))
      .every((field) => ability.can(action, subj, field))
  );
};
