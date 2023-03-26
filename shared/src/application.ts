import * as Joi from "joi";
// import { Slot, TimeSlot } from "./slot";

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
  // selected_slot?: Slot;
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
  id: Joi.string().required(),
  submission: Joi.date().required(),
  state: Joi.string().valid(Object.values(ApplicationState)).required(),
  lastModified: Joi.date().required(),
  notes: Joi.string().optional(),
  cv: Joi.string().required(),
  itaLevel: Joi.string().valid(Object.values(LangLevel)).required(),

  // availability: Joi.array().items(Joi.object<TimeSlot>({
  //     start: Joi.date().required(),
  //     end: Joi.date().required(),
  // })).required(),
  // selectedSlot: Joi.object<Slot>({
  //     state: Joi.string()
  //         .valid("free", "assigned", "reserved", "rejected")
  //         .required(),
  //     calId: Joi.string().required(),
  //     timeSlot: Joi.object<TimeSlot>({
  //         start: Joi.date().required(),
  //         end: Joi.date().required(),
  //     }).required(),
  // }).optional(),
});

export const createBscApplication = (
  BaseApplication as Joi.ObjectSchema<BscApplication>
).keys({
  studyPath: Joi.string().required(),
  academicYear: Joi.number().required(),
  cfu: Joi.number().required(),
  grades: Joi.string().required(),
  gradesAvg: Joi.number().required(),
});

export const createMscApplication = (
  BaseApplication as Joi.ObjectSchema<MscApplication>
).keys({
  bscStudyPath: Joi.string().optional(),
  bscGradesAvg: Joi.number().optional(),
  mscStudyPath: Joi.string().required(),
  mscGradesAvg: Joi.number().required(),
  academicYear: Joi.number().required(),
  cfu: Joi.number().required(),
  grades: Joi.string().required(),
});

export const createPhdApplication = (
  BaseApplication as Joi.ObjectSchema<PhdApplication>
).keys({
  mscStudyPath: Joi.string().required(),
  phdDescription: Joi.string().required(),
});
