import { Action, ApplyAbilities } from "./abilities";
import { Role } from "./person";
import * as Joi from "joi";
// import { TimeSlot } from "./slot";

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
  cv: string; // Link to cv
  itaLevel: LangLevel;

  bscApplication?: BscApplication;
  mscApplication?: MscApplication;
  phdApplication?: PhdApplication;
}

export interface BscApplication {
  bscStudyPath: string;
  bscAcademicYear: number;
  bscGradesAvg: number;
  grades: string; // Link to grades
  cfu: number;
}

export interface MscApplication {
  bscStudyPath: string;
  bscGradesAvg: number;
  mscStudyPath: string;
  mscGradesAvg: number;
  mscAcademicYear: number;
  grades: string; // Link to grades
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
  cv: Joi.string().uri().required(),
  itaLevel: Joi.string()
    .valid(...Object.values(LangLevel))
    .required(),
});

const createBscApplication = Joi.object<BscApplication>({
  bscStudyPath: Joi.string().max(255).required(),
  bscGradesAvg: Joi.number().min(18).max(30).required(),
  bscAcademicYear: Joi.number().integer().min(1).max(3).required(),
  cfu: Joi.number().integer().min(48).max(180).required(),
  grades: Joi.string().uri().required(),
});

const createMscApplication = Joi.object<MscApplication>({
  bscStudyPath: Joi.string().optional(),
  bscGradesAvg: Joi.number().min(18).max(30).optional(),
  mscStudyPath: Joi.string().required(),
  mscGradesAvg: Joi.number().min(18).max(30).required(),
  mscAcademicYear: Joi.number().integer().min(1).max(2).required(),
  cfu: Joi.number().integer().min(20).max(120).required(),
  grades: Joi.string().uri().required(),
});

const createPhdApplication = Joi.object<PhdApplication>({
  mscStudyPath: Joi.string().required(),
  phdDescription: Joi.string().max(255).required(),
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
      "cv",
      "itaLevel",
      "bscApplication",
      "mscApplication",
      "phdApplication",
    ]);

    can(Action.Update, "Application", ["state"], { applicantId: user.sub });
  } else if (user.role !== Role.None) {
    // Every other authenticated user can read and update applications
    can(Action.Read, "Application");
    can(Action.Update, "Application", ["state", "notes"]);
  }

  cannot(Action.Delete, "Application"); // No one can delete applications
};
