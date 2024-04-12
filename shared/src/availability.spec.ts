import {
  AvailabilityState,
  Availability,
  insertAvailabilitySchema,
  applyAbilitiesOnAvailability,
} from "./availability";
import { createMockAbility } from "./abilities.spec";
import { Action, UserAuth, checkAbility } from "./abilities";
import { Role } from "./person";

const mockAbilityForAvailability = (user: UserAuth) =>
  createMockAbility((builder) => {
    applyAbilitiesOnAvailability(user, builder);
  });

const mockAvailability = {
  id: 1,
  state: AvailabilityState.Free,
  lastModified: new Date(),
  timeSlot: {
    start: new Date(2024, 0, 1, 10, 0, 0),
    end: new Date(2024, 0, 1, 11, 0, 0),
    id: 1,
    availabilities: [],
  },
  user: {
    firstName: "John",
    lastName: "Doe",
    oauthId: "123",
    role: Role.Member,
  },
};

describe("Availability", () => {
  Object.values(Role).forEach((role: Role) => {
    describe("should allow only HKN members to read, create, and delete availabilities", () => {
      const mockAbility = mockAbilityForAvailability({ role, sub: "123" });
      it(`should allow only Admin and Supervisors to update availabilities [${role}]`, () => {
        expect(
          checkAbility(
            mockAbility,
            Action.Update,
            mockAvailability,
            "Availability"
          )
        ).toBe([Role.Admin, Role.Supervisor].includes(role));
      });
      it(`should allow only HKN members to read, create, and delete availabilities [${role}]`, () => {
        expect(
          checkAbility(
            mockAbility,
            Action.Read,
            mockAvailability,
            "Availability"
          )
        ).toBe(![Role.Applicant, Role.None].includes(role));
        expect(
          checkAbility(
            mockAbility,
            Action.Create,
            mockAvailability,
            "Availability"
          )
        ).toBe(![Role.Applicant, Role.None].includes(role));
        expect(
          checkAbility(
            mockAbility,
            Action.Delete,
            mockAvailability,
            "Availability"
          )
        ).toBe(![Role.Applicant, Role.None].includes(role));
      });
    });
  });

  describe("insertAvailabilitySchema", () => {
    it("should allow creating a valid availability", () => {
      const validAvailability = {
        timeSlotId: 1,
      };

      const { error } = insertAvailabilitySchema.validate(validAvailability);
      expect(error).toBeUndefined();
    });

    it("should not allow creating an availability without a timeSlotId", () => {
      const invalidAvailability = {};

      const { error } = insertAvailabilitySchema.validate(invalidAvailability);
      expect(error).toBeDefined();
    });
  });
});
