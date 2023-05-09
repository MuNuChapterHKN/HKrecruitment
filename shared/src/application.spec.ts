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

describe("Application", () => {
  const mockApplication: Partial<Application> = {
    notes: "Notes",
    cv: {
      // TODO Better tests for cv?
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
      grades: {
        encoding: "7bit",
        mimetype: "application/pdf",
        size: 0,
      },
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
      grades: {
        encoding: "7bit",
        mimetype: "application/pdf",
        size: 0,
      },
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
      const person: Partial<Application> = {
        ...mockMscApplication,
        notes: undefined,
      };
      expect(createApplicationSchema.validate(person)).not.toHaveProperty(
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

    it("should require required fields", () => {
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
  });
});
