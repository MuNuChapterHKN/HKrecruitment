import {
  AbilityBuilder,
  AbilityClass,
  createMongoAbility,
  PureAbility,
  subject,
} from "@casl/ability";
import { applyAbilitiesOnPerson, Person, Role } from "./person";
import { Application, applyAbilitiesOnApplication } from "./application";

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
type SubjectsTypes = Partial<Person> | Partial<Application>;
type SubjectNames = "Person" | "Application";
export type Subjects = SubjectsTypes | SubjectNames;

export type AppAbility = PureAbility<[Action, Subjects]>;
export const AppAbility = PureAbility as AbilityClass<AppAbility>;

export type ApplyAbilities = (
  user: UserAuth,
  { can, cannot }: AbilityBuilder<AppAbility>
) => void;

export const abilityForUser = (user: UserAuth): AppAbility => {
  const builder = new AbilityBuilder<AppAbility>(createMongoAbility);

  applyAbilitiesOnPerson(user, builder);
  applyAbilitiesOnApplication(user, builder);

  const { build } = builder;
  return build();
};

export const checkAbility = (
  ability: AppAbility,
  Action: Action,
  subjectObj: SubjectsTypes,
  subjectName: SubjectNames
): boolean => {
  const subj = subject(subjectName, subjectObj);
  return (
    ability.can(Action, subj) &&
    Object.keys(subject).every((field) => ability.can(Action, subj, field))
  );
};
