import {
  AbilityBuilder,
  AbilityClass,
  createMongoAbility,
  PureAbility,
  subject,
} from "@casl/ability";
import { applyAbilitiesForPerson, Person, Role } from "./person";

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
type SubjectsTypes = Partial<Person>;
type SubjectNames = "Person";
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

  const { build } = builder;
  return build();
};

export const checkAbility = (
  ability: AppAbility,
  action: Action,
  subjectObj: SubjectsTypes,
  subjectName: SubjectNames
): boolean => {
  const subj = subject(subjectName, subjectObj);
  return (
    ability.can(action, subj) &&
    Object.keys(subj).every((field) => ability.can(action, subj, field))
  );
};
