import {
  Person,
  Role,
  applyAbilitiesForPerson,
  getRoleChangeChecker,
  createUserSchema,
} from "./person";
import { createMockAbility } from "./abilities.spec";
import { Action, UserAuth, checkAbility } from "./abilities";

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

  describe("applyAbilitiesOnPerson", () => {
    const mockAbilityForPerson = (user: UserAuth) =>
      createMockAbility((builder) => {
        applyAbilitiesForPerson(user, builder);
      });
    it("should allow to read own person", () => {
      const mockAbility = mockAbilityForPerson({
        role: Role.Applicant,
        sub: "123",
      });

      const person: Person = {
        firstName: "John",
        lastName: "Doe",
        email: "test@example.com",
        oauthId: "123",
        sex: "F",
        role: Role.Applicant,
      };

      expect(checkAbility(mockAbility, Action.Read, person, "Person")).toBe(
        true
      );
    });

    it("should not allow to read other person to non-admins", () => {
      const mockAbility = mockAbilityForPerson({
        role: Role.Applicant,
        sub: "123",
      });

      const person: Person = {
        firstName: "John",
        lastName: "Doe",
        email: "",
        oauthId: "321",
        sex: "F",
        role: Role.Applicant,
      };

      expect(checkAbility(mockAbility, Action.Read, person, "Person")).toBe(
        false
      );
    });

    it("should allow to create own person", () => {
      const mockAbility = mockAbilityForPerson({
        role: Role.Applicant,
        sub: "123",
      });

      const person: Partial<Person> = {
        firstName: "John",
        lastName: "Doe",
        email: "test@example.com",
        oauthId: "123",
        sex: "F",
      };

      expect(checkAbility(mockAbility, Action.Create, person, "Person")).toBe(
        true
      );
    });

    it("should not allow to create other person to anyone", () => {
      const mockAbilityAdmin = mockAbilityForPerson({
        role: Role.Admin,
        sub: "123",
      });

      const mockAbilityApplicant = mockAbilityForPerson({
        role: Role.Applicant,
        sub: "123",
      });

      const person: Partial<Person> = {
        firstName: "John",
        lastName: "Doe",
        email: "test@example.com",
        oauthId: "321",
        sex: "F",
      };

      expect(
        checkAbility(mockAbilityAdmin, Action.Create, person, "Person")
      ).toBe(false);

      expect(
        checkAbility(mockAbilityApplicant, Action.Create, person, "Person")
      ).toBe(false);
    });

    it("should allow to update own person", () => {
      const mockAbility = mockAbilityForPerson({
        role: Role.Applicant,
        sub: "123",
      });

      const person: Partial<Person> = {
        firstName: "John",
        lastName: "Doe",
        sex: "F",
        phone_no: undefined,
        telegramId: undefined,
        oauthId: "123",
      };

      expect(checkAbility(mockAbility, Action.Update, person, "Person")).toBe(
        true
      );
    });

    // TODO: implement these tests
    it("should not allow to update own role to non-admins", () => {});

    it("should not allow to update own email to non-admins", () => {});

    it("should allow admins to update any person", () => {
      const mockAbility = mockAbilityForPerson({
        role: Role.Admin,
        sub: "123",
      });

      const person: Partial<Person> = {
        firstName: "John",
        lastName: "Doe",
      };

      expect(checkAbility(mockAbility, Action.Update, person, "Person")).toBe(
        true
      );
    });

    it("should allow admins to update role, except to Role.None", () => {
      const mockAbility = mockAbilityForPerson({
        role: Role.Admin,
        sub: "123",
      });

      const person: Partial<Person> = {
        oauthId: "321",
        role: Role.Clerk,
      };

      expect(checkAbility(mockAbility, Action.Update, person, "Person")).toBe(
        true
      );
    });
  });

  describe("checkRoleChange", () => {
    it("should allow admin to change any role, except admin", () => {
      expect(getRoleChangeChecker(Role.Admin)(Role.Member, Role.Clerk)).toBe(
        true
      );
      expect(getRoleChangeChecker(Role.Admin)(Role.Admin, Role.Clerk)).toBe(
        false
      );
    });

    it("should not allow non-admins to change role", () => {
      for (const role of [
        Role.None,
        Role.Applicant,
        Role.Member,
        Role.Clerk,
        Role.Supervisor,
      ]) {
        expect(getRoleChangeChecker(role)(Role.Member, Role.Clerk)).toBe(false);
      }
    });

    it("should not allow anyone to downgrade role to Applicant or to upgrade Applicant to another role", () => {
      for (const role of [
        Role.None,
        Role.Member,
        Role.Clerk,
        Role.Supervisor,
        Role.Admin,
      ]) {
        expect(
          getRoleChangeChecker(Role.Supervisor)(role, Role.Applicant)
        ).toBe(false);
        expect(
          getRoleChangeChecker(Role.Supervisor)(Role.Applicant, role)
        ).toBe(false);
      }
    });
  });
});
