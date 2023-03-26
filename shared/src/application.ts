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

export enum LangLevel {
  // A1 = "A1",
  // A2 = "A2",
  // B1 = "B1",
  B2 = "B2",
  C1 = "C1",
  C2 = "C2",
  NativeSpeaker = "native_speaker",
}

export interface Application {
  id: string;
  submission: Date;
  state: ApplicationState;
  lastModified: Date;
  notes?: string;
  cv: string; // Link to cv
  // availability: TimeSlot[];
  itaLevel: LangLevel;
}

export interface BscApplication extends Application {
  studyPath: string;
  academicYear: number;
  cfu: number;
  grades: string; // Link to grades
  gradesAvg: number;
}

export interface MscApplication extends Application {
  bscStudyPath: string;
  bscGradesAvg: number;

  mscStudyPath: string;
  mscGradesAvg: number;
  academicYear: number;
  cfu: number;
  grades: string; // Link to grades
}

export interface PhdApplication extends Application {
  mscStudyPath: string;
  phdDescription: string;
}

/* Validation schemas */

const BaseApplication = Joi.object<Application>({
  submission: Joi.date().required(),
  state: Joi.string().valid(Object.values(ApplicationState)).required(),
  lastModified: Joi.date().required(),
  notes: Joi.string().optional(),
  cv: Joi.string().uri().required(),
  itaLevel: Joi.string().valid(Object.values(LangLevel)).required(),

  // availability: Joi.array().items(Joi.object<TimeSlot>({
  //     start: Joi.date().required(),
  //     end: Joi.date().required(),
  // })).required(),
});

const createBscApplication = (
  BaseApplication as Joi.ObjectSchema<BscApplication>
).keys({
  studyPath: Joi.string().required(),
  academicYear: Joi.number().required(),
  cfu: Joi.number().required(),
  grades: Joi.string().uri().required(),
  gradesAvg: Joi.number().required(),
});

const createMscApplication = (
  BaseApplication as Joi.ObjectSchema<MscApplication>
).keys({
  bscStudyPath: Joi.string().optional(),
  bscGradesAvg: Joi.number().optional(),
  mscStudyPath: Joi.string().required(),
  mscGradesAvg: Joi.number().required(),
  academicYear: Joi.number().required(),
  cfu: Joi.number().required(),
  grades: Joi.string().uri().required(),
});

const createPhdApplication = (
  BaseApplication as Joi.ObjectSchema<PhdApplication>
).keys({
  mscStudyPath: Joi.string().required(),
  phdDescription: Joi.string().required(),
});

export const createApplicationSchema = Joi.alternatives(
  createBscApplication,
  createMscApplication,
  createPhdApplication
);

export const updateApplicationSchema = Joi.object<Application>({
  notes: Joi.string().optional(),
  state: Joi.string().valid(Object.values(ApplicationState)).optional(),
});
