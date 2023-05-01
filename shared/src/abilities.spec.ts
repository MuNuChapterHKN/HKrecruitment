import {
  AbilityBuilder,
  createMongoAbility,
  defineAbility,
} from "@casl/ability";
import { Action, AppAbility, checkAbility } from "./abilities";
import { Person, Role } from "./person";

export const createMockAbility = (
  abilityFun: (abilityBuilder: AbilityBuilder<AppAbility>) => void
): AppAbility => {
  const builder = new AbilityBuilder<AppAbility>(createMongoAbility);
  abilityFun(builder);
  return builder.build();
};

describe("checkAbilities", () => {
  it("should return true if action is allowed", () => {
    const mockAbility = createMockAbility(({ can }) => {
      can(Action.Manage, "Person");
    });
    const person: Person = {
      firstName: "John",
      lastName: "Doe",
      email: "example@hknpolito.org",
      oauthId: "123",
      sex: "M",
      role: Role.Applicant,
    };
    expect(checkAbility(mockAbility, Action.Manage, person, "Person")).toBe(
      true
    );
  });

  it("should return false if action is allowed but not on field", () => {
    const mockAbility = createMockAbility(({ can }) => {
      can(Action.Update, "Person", ["firstName", "lastName"]);
    });
    const person: Partial<Person> = {
      firstName: "John",
      lastName: "Doe",
      sex: "M",
    };
    expect(checkAbility(mockAbility, Action.Update, person, "Person")).toBe(
      false
    );
  });
});
