import {
  RecruitmentSession,
  RecruitmentSessionState,
  createRecruitmentSessionSchema,
  applyAbilitiesOnRecruitmentSession,
  updateRecruitmentSessionSchema,
} from "./recruitment-session";
import { createMockAbility } from "./abilities.spec";
import { Action, UserAuth, checkAbility } from "./abilities";
import { expression } from "joi";

describe("Recruitment Session", () => {
  describe("createRecruitmentSessionSchema", () => {
    const mockRecSess: Partial<RecruitmentSession> = {
      state: RecruitmentSessionState.Active,
      slotDuration: 5,
      interviewStart: "2024-10-05 11:55" as unknown as Date,
      interviewEnd: "2024-10-29 16:30" as unknown as Date,
      days: ["2024-10-23" as unknown as Date, "2024-10-20" as unknown as Date],
      lastModified: "2023-10-20 15:10" as unknown as Date,
    };

    it("should allow a valid recruitment session", () => {
      expect(
        createRecruitmentSessionSchema.validate(mockRecSess)
      ).not.toHaveProperty("error");
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

    it("should require last modified", () => {
      const session: Partial<RecruitmentSession> = {
        ...mockRecSess,
        lastModified: undefined,
      };
      const { error } = createRecruitmentSessionSchema.validate(session);
      expect(error).toBeDefined();
      expect(error.message).toMatch(/.+lastModified.+ is required/);
    });

    it("check interview start type: should be 11:55", () => {
      expect(mockRecSess.interviewStart).toMatch("11:55");
    });
  });

  describe("updateRecruitmentSessionSchema", () => {
    it("should allow a valild update", () => {
      const mockUpdate: Partial<RecruitmentSession> = {
        state: RecruitmentSessionState.Concluded,
        interviewEnd: "2023-10-26 19:30" as unknown as Date,
      };
      expect(
        updateRecruitmentSessionSchema.validate(mockUpdate)
      ).not.toHaveProperty("error");
    });

    it("should allow not to set optional fields", () => {
      const mockUpdate: Partial<RecruitmentSession> = {};
      expect(
        updateRecruitmentSessionSchema.validate(mockUpdate)
      ).not.toHaveProperty("error");
    });
  });
});
