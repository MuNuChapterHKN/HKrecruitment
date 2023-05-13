import { Action, ApplyAbilities } from "./abilities";
import { Role } from "./person";
import * as Joi from "joi";
// import { TimeSlot } from "./slot";

export const applicationsConfig = {
  BSC: {
    MIN_GRADE: 18,
    MAX_GRADE: 30,
    MIN_CFU: 48,
    MAX_CFU: 180,
    MIN_ACADEMIC_YEAR: 1,
    MAX_ACADEMIC_YEAR: 3,
  },
  MSC: {
    MIN_GRADE: 18,
    MAX_GRADE: 30,
    MIN_CFU: 20,
    MAX_CFU: 120,
    MIN_ACADEMIC_YEAR: 1,
    MAX_ACADEMIC_YEAR: 2,
  },
  PHD: {
    DESC_LENGTH: 255,
  },
};

export enum ApplicationState {
  New = "new",
  Accepted = "accepted",
  Rejected = "rejected",
  Confirmed = "confirmed",
  Finalized = "finalized",
  RefusedByApplicant = "refused_by_applicant",
}

export enum ApplicationType {
  BSC = "bsc",
  MSC = "msc",
  PHD = "phd",
}

export enum LangLevel {
  B2 = "B2",
  C1 = "C1",
  C2 = "C2",
  NativeSpeaker = "native_speaker",
}

export interface Application {
  type: ApplicationType;
  id: number;
  state: ApplicationState;
  notes?: string;
  cv: any; // CV file
  grades?: any; // Grades file
  itaLevel: LangLevel;

  bscApplication?: BscApplication;
  mscApplication?: MscApplication;
  phdApplication?: PhdApplication;
}

export interface BscApplication {
  bscStudyPath: string;
  bscAcademicYear: number;
  bscGradesAvg: number;
  cfu: number;
}

export interface MscApplication {
  bscStudyPath: string;
  bscGradesAvg: number;
  mscStudyPath: string;
  mscGradesAvg: number;
  mscAcademicYear: number;
  cfu: number;
}

export interface PhdApplication {
  mscStudyPath: string;
  phdDescription: string;
}

/* Validation schemas */

const BaseApplication = Joi.object<Application>({
  type: Joi.string()
    .valid(...Object.values(ApplicationType))
    .required(),
  notes: Joi.string().optional(),
  itaLevel: Joi.string()
    .valid(...Object.values(LangLevel))
    .required(),
});

const createBscApplication = Joi.object<BscApplication>({
  bscStudyPath: Joi.string().max(255).required(),
  bscGradesAvg: Joi.number()
    .min(applicationsConfig.BSC.MIN_GRADE)
    .max(applicationsConfig.BSC.MAX_GRADE)
    .required(),
  bscAcademicYear: Joi.number()
    .integer()
    .min(applicationsConfig.BSC.MIN_ACADEMIC_YEAR)
    .max(applicationsConfig.BSC.MAX_ACADEMIC_YEAR)
    .required(),
  cfu: Joi.number()
    .integer()
    .min(applicationsConfig.BSC.MIN_CFU)
    .max(applicationsConfig.BSC.MAX_CFU)
    .required(),
});

const createMscApplication = Joi.object<MscApplication>({
  bscStudyPath: Joi.string().optional(),
  bscGradesAvg: Joi.number()
    .min(applicationsConfig.BSC.MIN_GRADE)
    .max(applicationsConfig.BSC.MAX_GRADE)
    .optional(),
  mscStudyPath: Joi.string().required(),
  mscGradesAvg: Joi.number()
    .min(applicationsConfig.MSC.MIN_GRADE)
    .max(applicationsConfig.MSC.MAX_GRADE)
    .required(),
  mscAcademicYear: Joi.number()
    .integer()
    .min(applicationsConfig.MSC.MIN_ACADEMIC_YEAR)
    .max(applicationsConfig.MSC.MAX_ACADEMIC_YEAR)
    .required(),
  cfu: Joi.number()
    .integer()
    .min(applicationsConfig.MSC.MIN_CFU)
    .max(applicationsConfig.MSC.MAX_CFU)
    .required(),
});

const createPhdApplication = Joi.object<PhdApplication>({
  mscStudyPath: Joi.string().required(),
  phdDescription: Joi.string()
    .max(applicationsConfig.PHD.DESC_LENGTH)
    .required(),
});

export const createApplicationSchema = BaseApplication.keys({
  bscApplication: createBscApplication.when("type", {
    is: "bsc",
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
  mscApplication: createMscApplication.when("type", {
    is: "msc",
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
  phdApplication: createPhdApplication.when("type", {
    is: "phd",
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
})
  .label("type")
  .options({
    stripUnknown: true,
    abortEarly: false,
    presence: "required",
  });

export const updateApplicationSchema = Joi.object<Application>({
  notes: Joi.string().optional(),
  state: Joi.string()
    .valid(...Object.values(ApplicationState))
    .optional(),
}).options({
  stripUnknown: true,
  abortEarly: false,
  presence: "required",
});

export const applyAbilitiesOnApplication: ApplyAbilities = (
  user,
  { can, cannot }
) => {
  if (user.role === Role.Admin) {
    can(Action.Manage, "Application"); // Admin can do anything on any application
  } else if (user.role === Role.Applicant) {
    can(Action.Read, "Application", { applicantId: user.sub });

    can(Action.Create, "Application", [
      "type",
      "notes",
      "itaLevel",
      "bscApplication",
      "mscApplication",
      "phdApplication",
    ]);

    can(Action.Update, "Application", ["state"], { applicantId: user.sub });
  } else if (user.role !== Role.None) {
    // Every other authenticated user can read and update applications
    can(Action.Read, "Application");
    can(Action.Update, "Application", ["state", "notes"], {});
  }

  cannot(Action.Delete, "Application"); // No one can delete applications
};
