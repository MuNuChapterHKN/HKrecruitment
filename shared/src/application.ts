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
  academicYear: number;
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
  bscAcademicYear: Joi.number().integer().min(1).max(3).required(),
  bscGradesAvg: Joi.number().min(18).max(30).required(),
  cfu: Joi.number().integer().min(48).max(180).required(),
  grades: Joi.string().uri().required(),
});

const createMscApplication = Joi.object<MscApplication>({
  bscStudyPath: Joi.string().optional(),
  bscGradesAvg: Joi.number().min(18).max(30).optional(),
  mscStudyPath: Joi.string().required(),
  mscGradesAvg: Joi.number().min(18).max(30).required(),
  academicYear: Joi.number().integer().min(1).max(2).required(),
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
    presence: "required", // TODO: Check .required() on other Schemas
  });

export const updateApplicationSchema = Joi.object<Application>({
  notes: Joi.string().optional(),
  state: Joi.string()
    .valid(...Object.values(ApplicationState))
    .optional(),
});
