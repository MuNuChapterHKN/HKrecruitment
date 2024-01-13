import {
  RecruitmentSession,
  RecruitmentSessionState,
  createRecruitmentSessionSchema,
  applyAbilitiesOnRecruitmentSession,
} from "./recruitment-session";
import { createMockAbility } from "./abilities.spec";
import { Action, UserAuth, checkAbility } from "./abilities";

describe("RecruitmentSession", () => {
  describe("createRecruitmentSessionSchema", () => {
    const mockRecSess: Partial<RecruitmentSession> = {
      state: RecruitmentSessionState.Active,
      slotDuration: 5,
      interviewStart: new Date("15:20"),
      interviewEnd: new Date("16:30"),
      days: [new Date("2024-12-23"), new Date("2024-12-23")],
      lastModified: new Date("2023-10-20 15:10"),
    };

    it("should allow a valid recruitment session", () => {
      expect(
        createRecruitmentSessionSchema.validate(mockRecSess)
      ).not.toHaveProperty("erroe");
    });

    it("should allow to not set optional fields", () => {
      const session: Partial<RecruitmentSession> = {
        ...mockRecSess,
        days: undefined,
        slotDuration: undefined,
      };
      expect(
        createRecruitmentSessionSchema.validate(session)
      ).not.toHaveProperty("error");
    });

    it("should require state", () => {
      const session: Partial<RecruitmentSession> = {
        ...mockRecSess,
        state: undefined,
      };
      const { error } = createRecruitmentSessionSchema.validate(session);
      expect(error).toBeDefined();
      expect(error.message).toMatch(/.+state.+ is required/);
    });

    it("should require interview start", () => {
      const session: Partial<RecruitmentSession> = {
        ...mockRecSess,
        interviewStart: undefined,
      };
      const { error } = createRecruitmentSessionSchema.validate(session);
      expect(error).toBeDefined();
      expect(error.message).toMatch(/.+interviewStart.+ is required/);
    });

    it("should require interview end", () => {
      const session: Partial<RecruitmentSession> = {
        ...mockRecSess,
        interviewEnd: undefined,
      };
      const { error } = createRecruitmentSessionSchema.validate(session);
      expect(error).toBeDefined();
      expect(error.message).toMatch(/.+interviewEnd.+ is required/);
    });

    it("CONTROLLA", () => {
      const session: Partial<RecruitmentSession> = {
        ...mockRecSess,
        lastModified: undefined,
      };
      const { error } = createRecruitmentSessionSchema.validate(session);
      expect(error).toBeDefined();
      expect(error.message).toMatch(/.+lastModified.+ is required/);
    });
  });
});
