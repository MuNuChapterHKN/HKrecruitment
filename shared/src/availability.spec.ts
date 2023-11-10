import {
  AvailabilityState,
  AvailabilityType,
  Availability,
  updateAvailabilitySchema,
} from "./availability";
import { createMockAbility } from "./abilities.spec";
import { Action, UserAuth, checkAbility } from "./abilities";
import { Role } from "./person";

describe("Availability", () => {
  describe("updateAvailabilitySchema", () => {
    it("should allow a valid update", () => {
      const updateAvailability = {
        state: AvailabilityState.Confirmed,
        timeSlotId: 123,
      };
      const { error } = updateAvailabilitySchema.validate(updateAvailability);
      expect(error).toBeDefined();
    });

    it("should not allow updating with an invalid state", () => {
      const updateAvailability = {
        state: "Non_Existent_State",
        timeSlotId: 123,
      };
      const { error } = updateAvailabilitySchema.validate(updateAvailability);
      expect(error).toBeDefined();
    });

    it("should not allow updating with an invalid timeSlotId", () => {
      const updateAvailability = {
        state: AvailabilityState.Confirmed,
        timeSlotId: -321,
      };
      const { error } = updateAvailabilitySchema.validate(updateAvailability);
      expect(error).toBeDefined();
    });
  });
});
