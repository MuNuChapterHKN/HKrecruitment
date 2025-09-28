import {
  recruitingSession,
  applicant,
  stageStatus,
  timeslot,
  interview,
  usersToInterviews,
  interviewerAvailability
} from './schema';

export type RecruitingSession = typeof recruitingSession.$inferSelect;
export type Applicant = typeof applicant.$inferSelect;
export type StageStatus = typeof stageStatus.$inferSelect;
export type Timeslot = typeof timeslot.$inferSelect;
export type Interview = typeof interview.$inferSelect;
export type UsersToInterviews = typeof usersToInterviews.$inferSelect;
export type InterviewerAvailability = typeof interviewerAvailability.$inferSelect;

export type DegreeLevel = Applicant["degreeLevel"];
export type LanguageLevel = Applicant["italianLevel"];
export type ApplicationStage = Applicant["stage"];
