import {
  Person,
  Role,
  applyAbilitiesForPerson,
  createUserSchema,
} from "./person";
import { createMockAbility } from "./abilities.spec";
import { Action, UserAuth } from "./abilities";

describe("Person", () => {
  describe("createUserSchema", () => {
    const mockPerson: Partial<Person> = {
      firstName: "John",
      lastName: "Doe",
      sex: "M",
      email: "test@example.com",
      phone_no: "+1234567890",
      telegramId: "123456789",
      role: Role.Applicant,
    };
    it("should allow a valid person", () => {
      expect(createUserSchema.validate(mockPerson)).not.toHaveProperty("error");
    });

    it("should not allow to set oauthId", () => {
      const person: Partial<Person> = {
        ...mockPerson,
        oauthId: "123",
      };
      const { error } = createUserSchema.validate(person);
      expect(error.message).toMatch(/.+oauthId.+ is not allowed/);
    });

    it("should allow to not set optional fields", () => {
      const person: Partial<Person> = {
        ...mockPerson,
        phone_no: undefined,
        telegramId: undefined,
      };
      expect(createUserSchema.validate(person)).not.toHaveProperty("error");
    });

    it("should require firstName", () => {
      const person: Partial<Person> = {
        ...mockPerson,
        firstName: undefined,
      };
      const { error } = createUserSchema.validate(person);
      expect(error).toBeDefined();
      expect(error.message).toMatch(/.+firstName.+ is required/);
    });

    it("should require lastName", () => {
      const person: Partial<Person> = {
        ...mockPerson,
        lastName: undefined,
      };
      const { error } = createUserSchema.validate(person);
      expect(error).toBeDefined();
      expect(error.message).toMatch(/.+lastName.+ is required/);
    });

    it("should require sex", () => {
      const person: Partial<Person> = {
        ...mockPerson,
        sex: undefined,
      };
      const { error } = createUserSchema.validate(person);
      expect(error).toBeDefined();
      expect(error.message).toMatch(/.+sex.+ is required/);
    });

    it("should require email to be valid", () => {
      const person: Partial<Person> = {
        ...mockPerson,
        email: "invalid",
      };
      const { error } = createUserSchema.validate(person);
      expect(error).toBeDefined();
      expect(error.message).toMatch(/.+email.+ must be a valid email/);
    });

    it("should require phone_no to be valid", () => {
      const person: Partial<Person> = {
        ...mockPerson,
        phone_no: "+321",
      };
      const { error } = createUserSchema.validate(person);
      expect(error).toBeDefined();
      expect(error.message).toMatch(/.+phone_no.+ match/);
    });
  });

  //   describe("applyAbilitiesOnPerson", () => {
  //     const mockAbilityForPerson = (user: UserAuth) =>
  //       createMockAbility((builder) => {
  //         applyAbilitiesForPerson(user, builder);
  //       });
  //     it("should allow to read own person", () => {
  //       const mockAbility = mockAbilityForPerson({
  //         role: Role.Applicant,
  //         sub: "123",
  //       });

  //       const person: Person = {
  //         firstName: "John",
  //         lastName: "Doe",
  //         email: "test@example.com",
  //         oauthId: "123",
  //         sex: "F",
  //         role: Role.Applicant,
  //       };

  //       expect(mockAbility.can(Action.Read, person)).toBe(true);
  //     });
  //   });
});
