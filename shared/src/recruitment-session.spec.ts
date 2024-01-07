import {
    RecruitmentSession,
    RecruitmentSessionState,
    createRecruitmentSessionSchema,
    applyAbilitiesOnRecruitmentSession
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
      lastModified: new Date("2000-10-20 15:10")
    };

    it("prova", () => {
      expect(createRecruitmentSessionSchema.validate(mockRecSess)).not.toHaveProperty("erroe");
    })


  })


})