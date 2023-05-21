import {
  Application,
  createApplicationSchema,
  updateApplicationSchema,
  applyAbilitiesOnApplication,
  LangLevel,
  ApplicationState,
  ApplicationType,
  applicationsConfig,
} from "./application";
import { createMockAbility } from "./abilities.spec";
import { Action, UserAuth, checkAbility } from "./abilities";
import { Role } from "./person";

describe("Application", () => {
  const mockApplication: Partial<Application> = {
    notes: "Notes",
    cv: {
      encoding: "7bit",
      mimetype: "application/pdf",
      size: 0,
    },
    itaLevel: LangLevel.B2,
  };

  const mockBscApplication: Partial<Application> = {
    ...mockApplication,
    type: ApplicationType.BSC,
    bscApplication: {
      bscStudyPath: "Electronic Engineering",
      bscAcademicYear: 1,
      bscGradesAvg: 27.8,
      cfu: 50,
    },
  };

  const mockMscApplication: Partial<Application> = {
    ...mockApplication,
    type: ApplicationType.MSC,
    mscApplication: {
      bscStudyPath: "Electronic Engineering",
      bscGradesAvg: 28.9,
      mscStudyPath: "Electronic Engineering II",
      mscAcademicYear: 1,
      mscGradesAvg: 28.6,
      cfu: 65,
    },
  };

  const mockPhdApplication: Partial<Application> = {
    ...mockApplication,
    type: ApplicationType.PHD,
    phdApplication: {
      mscStudyPath: "Electronic Engineering II",
      phdDescription: "Electronic Engineering III",
    },
  };

  const mockApplications = [
    mockBscApplication,
    mockMscApplication,
    mockPhdApplication,
  ]
    // Define toString method for each mockApplication, so as to print it in the test name
    .map((account) =>
      Object.assign(account, {
        toString: function () {
          return this.type;
        },
      })
    );

  describe("createApplicationSchema", () => {
    it.each(mockApplications)(
      `should allow a valid %s application`,
      (mockApplication) => {
        expect(
          createApplicationSchema.validate(mockApplication)
        ).not.toHaveProperty("error");
      }
    );

    it("should allow to not set optional fields", () => {
      const application: Partial<Application> = {
        ...mockMscApplication,
        notes: undefined,
      };
      expect(createApplicationSchema.validate(application)).not.toHaveProperty(
        "error"
      );
    });

    it.each(Object.values(ApplicationType))(
      `should require application-specific field for %s applications`,
      (applicationType) => {
        const { error } = createApplicationSchema.validate({
          ...mockApplication,
          type: applicationType,
        });
        expect(error).toBeDefined();
        expect(error.message).toMatch(
          `\"${applicationType}Application\" is required`
        );
      }
    );

    it("should require all required fields", () => {
      const application: Partial<Application> = {};
      const reqiredFields = ["type", "itaLevel"];
      const { error } = createApplicationSchema.validate(application);
      expect(error).toBeDefined();
      for (let requiredField of reqiredFields)
        expect(error.message).toMatch(`\"${requiredField}\" is required`);
    });

    it("should require required bscApplication-specific fields", () => {
      const application = {
        ...mockApplication,
        type: ApplicationType.BSC,
        bscApplication: {},
      };
      const reqiredFields = [
        "bscStudyPath",
        "bscAcademicYear",
        "bscGradesAvg",
        "cfu",
      ];
      const { error } = createApplicationSchema.validate(application);
      expect(error).toBeDefined();
      for (let requiredField of reqiredFields)
        expect(error.message).toMatch(
          new RegExp(`\"bscApplication.${requiredField}\\" is required`)
        );
    });

    it("should require required mscApplication-specific fields", () => {
      const application = {
        ...mockApplication,
        type: ApplicationType.MSC,
        mscApplication: {},
      };
      const reqiredFields = [
        "mscStudyPath",
        "mscGradesAvg",
        "mscAcademicYear",
        "cfu",
      ];
      const optionalFields = ["bscStudyPath", "bscGradesAvg"];
      const { error } = createApplicationSchema.validate(application);
      expect(error).toBeDefined();
      for (let requiredField of reqiredFields)
        expect(error.message).toMatch(
          new RegExp(`\"mscApplication.${requiredField}\\" is required`)
        );
      for (let optionalField of optionalFields)
        expect(error.message).not.toMatch(
          new RegExp(`\"mscApplication.${optionalField}\\" is required`)
        );
    });

    it("should not accept Bsc cfu, years, and grades lower than minimum threshold", () => {
      const application: Partial<Application> = {
        ...mockApplication,
        type: ApplicationType.BSC,
        bscApplication: {
          bscStudyPath: "Electronic Engineering",
          bscAcademicYear: -1,
          bscGradesAvg: -1,
          cfu: -1,
        },
      };
      const expectedMinValues = {
        bscAcademicYear: applicationsConfig.BSC.MIN_ACADEMIC_YEAR,
        bscGradesAvg: applicationsConfig.BSC.MIN_GRADE,
        cfu: applicationsConfig.BSC.MIN_CFU,
      };
      const { error } = createApplicationSchema.validate(application);
      expect(error).toBeDefined();
      for (let [field, minValue] of Object.entries(expectedMinValues))
        expect(error.message).toMatch(
          new RegExp(
            `\"bscApplication.${field}\\" must be greater than or equal to ${minValue}`
          )
        );
    });

    it("should not accept Msc cfu, years, and grades lower than minimum threshold", () => {
      const application: Partial<Application> = {
        ...mockApplication,
        type: ApplicationType.MSC,
        mscApplication: {
          bscStudyPath: "Electronic Engineering",
          mscStudyPath: "Electronic Engineering II",
          bscGradesAvg: -1,
          mscGradesAvg: -1,
          mscAcademicYear: -1,
          cfu: -1,
        },
      };
      const expectedMinValues = {
        bscGradesAvg: applicationsConfig.BSC.MIN_GRADE,
        mscGradesAvg: applicationsConfig.MSC.MIN_GRADE,
        mscAcademicYear: applicationsConfig.MSC.MIN_ACADEMIC_YEAR,
        cfu: applicationsConfig.MSC.MIN_CFU,
      };
      const { error } = createApplicationSchema.validate(application);
      expect(error).toBeDefined();
      for (let [field, minValue] of Object.entries(expectedMinValues))
        expect(error.message).toMatch(
          new RegExp(
            `\"mscApplication.${field}\\" must be greater than or equal to ${minValue}`
          )
        );
    });

    it("should not accept Bsc cfu, years, and grades higher than maximum threshold", () => {
      const application: Partial<Application> = {
        ...mockApplication,
        type: ApplicationType.BSC,
        bscApplication: {
          bscStudyPath: "Electronic Engineering",
          bscAcademicYear: 999,
          bscGradesAvg: 999,
          cfu: 999,
        },
      };
      const expectedMaxValues = {
        bscAcademicYear: applicationsConfig.BSC.MAX_ACADEMIC_YEAR,
        bscGradesAvg: applicationsConfig.BSC.MAX_GRADE,
        cfu: applicationsConfig.BSC.MAX_CFU,
      };
      const { error } = createApplicationSchema.validate(application);
      expect(error).toBeDefined();
      for (let [field, maxValue] of Object.entries(expectedMaxValues))
        expect(error.message).toMatch(
          new RegExp(
            `\"bscApplication.${field}\\" must be less than or equal to ${maxValue}`
          )
        );
    });

    it("should not accept Msc cfu, years, and grades higher than maximum threshold", () => {
      const application: Partial<Application> = {
        ...mockApplication,
        type: ApplicationType.MSC,
        mscApplication: {
          bscStudyPath: "Electronic Engineering",
          mscStudyPath: "Electronic Engineering II",
          bscGradesAvg: 999,
          mscGradesAvg: 999,
          mscAcademicYear: 999,
          cfu: 999,
        },
      };
      const expectedMaxValues = {
        bscGradesAvg: applicationsConfig.BSC.MAX_GRADE,
        mscGradesAvg: applicationsConfig.MSC.MAX_GRADE,
        mscAcademicYear: applicationsConfig.MSC.MAX_ACADEMIC_YEAR,
        cfu: applicationsConfig.MSC.MAX_CFU,
      };
      const { error } = createApplicationSchema.validate(application);
      expect(error).toBeDefined();
      for (let [field, maxValue] of Object.entries(expectedMaxValues))
        expect(error.message).toMatch(
          new RegExp(
            `\"mscApplication.${field}\\" must be less than or equal to ${maxValue}`
          )
        );
    });

    describe("updateApplicationSchema", () => {
      it("should allow a valid update", () => {
        const mockUpdate: Partial<Application> = {
          notes: "NOTES",
          state: ApplicationState.Finalized,
        };
        expect(updateApplicationSchema.validate(mockUpdate)).not.toHaveProperty(
          "error"
        );
      });

      it("should allow to not set optional fields", () => {
        const mockUpdate: Partial<Application> = {};
        expect(updateApplicationSchema.validate(mockUpdate)).not.toHaveProperty(
          "error"
        );
      });
    });

    describe("applyAbilitiesOnApplication", () => {
      const mockAbilityForApplication = (user: UserAuth) =>
        createMockAbility((builder) => {
          applyAbilitiesOnApplication(user, builder);
        });

      it("should allow admins to perform all operations (except delete) on applications", () => {
        const mockAbility = mockAbilityForApplication({
          role: Role.Admin,
          sub: "123",
        });

        const application = {
          ...mockBscApplication,
          applicantId: "456",
        };

        const expectedAllowedActions = Object.values(Action).filter(
          (action) => action != Action.Delete
        );
        for (const action of expectedAllowedActions)
          expect(
            checkAbility(mockAbility, action, application, "Application")
          ).toBe(true);
      });

      it("should allow to read own application", () => {
        const mockAbility = mockAbilityForApplication({
          role: Role.Applicant,
          sub: "123",
        });

        const application = {
          ...mockBscApplication,
          applicantId: "123",
        };

        expect(
          checkAbility(mockAbility, Action.Read, application, "Application")
        ).toBe(true);
      });

      it("should not allow non-members to read not own applications", () => {
        const nonMemberRoles = [Role.None, Role.Applicant];
        for (const role of nonMemberRoles) {
          const mockAbility = mockAbilityForApplication({
            role: role,
            sub: "123",
          });

          const application = {
            ...mockBscApplication,
            applicantId: "567",
          };

          expect(
            checkAbility(mockAbility, Action.Read, application, "Application")
          ).toBe(false);
        }
      });

      it("should allow only applicants to submit new applications", () => {
        for (const role of Object.values(Role)) {
          const mockAbility = mockAbilityForApplication({
            role: role,
            sub: "123",
          });

          const application = {
            type: ApplicationType.PHD,
            itaLevel: LangLevel.B2,
            phdApplication: {
              mscStudyPath: "mscStudyPath",
              phdDescription: "phdDescription",
            },
          };

          const expected = role == Role.Applicant || role == Role.Admin;
          expect(
            checkAbility(mockAbility, Action.Create, application, "Application")
          ).toBe(expected);
        }
      });

      it("should not allow applicants to submit invalid applications data", () => {
        const mockAbility = mockAbilityForApplication({
          role: Role.Applicant,
          sub: "123",
        });

        const application = {
          ...mockBscApplication,
          // Invalid application fields
          state: ApplicationState.Finalized,
        };

        expect(
          checkAbility(mockAbility, Action.Create, application, "Application")
        ).toBe(false);
      });

      it("should allow to update own application", () => {
        const mockAbility = mockAbilityForApplication({
          role: Role.Applicant,
          sub: "123",
        });

        const application = {
          state: ApplicationState.RefusedByApplicant,
          applicantId: "123",
        };

        expect(
          checkAbility(mockAbility, Action.Update, application, "Application", [
            "applicantId",
          ])
        ).toBe(true);
      });

      it("should not allow to update other's application", () => {
        const mockAbility = mockAbilityForApplication({
          role: Role.Applicant,
          sub: "123",
        });

        const application = {
          state: ApplicationState.RefusedByApplicant,
          applicantId: "456",
        };

        expect(
          checkAbility(mockAbility, Action.Update, application, "Application", [
            "applicantId",
          ])
        ).toBe(false);
      });

      it("should allow members to update an application", () => {
        const memberRoles = [Role.Clerk, Role.Member, Role.Supervisor];
        for (const memberRole of memberRoles) {
          const mockAbility = mockAbilityForApplication({
            role: memberRole,
            sub: "123",
          });

          const application = {
            state: ApplicationState.Accepted,
            notes: "No comments",
          };

          expect(
            checkAbility(
              mockAbility,
              Action.Update,
              application,
              "Application",
              ["applicantId"]
            )
          ).toBe(true);
        }
      });

      it("should not allow members to update invalid fields of an application", () => {
        const memberRoles = [Role.Clerk, Role.Member, Role.Supervisor];
        for (const memberRole of memberRoles) {
          const mockAbility = mockAbilityForApplication({
            role: memberRole,
            sub: "123",
          });

          const application = {
            itaLevel: LangLevel.B2,
            type: ApplicationType.PHD,
          };

          expect(
            checkAbility(
              mockAbility,
              Action.Update,
              application,
              "Application",
              ["applicantId"]
            )
          ).toBe(false);
        }
      });

      it("should not allow anyone to delete applications", () => {
        for (const role of Object.values(Role)) {
          const mockAbility = mockAbilityForApplication({
            role: role,
            sub: "123",
          });

          const application = {
            ...mockBscApplication,
            applicantId: "567",
          };

          expect(
            checkAbility(mockAbility, Action.Delete, application, "Application")
          ).toBe(false);
        }
      });
    });
  });
});
