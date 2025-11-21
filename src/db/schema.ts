import {
  pgTable,
  primaryKey,
  text,
  timestamp,
  numeric,
  boolean,
  integer,
} from 'drizzle-orm/pg-core';
import { account, user, session, verification } from './auth-schema';
import { relations } from 'drizzle-orm';

const timestamps = {
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
};

export const DEGREE_LEVELS = ['bsc', 'msc', 'phd'] as const;
export const LANGUAGE_LEVELS = [
  'a1',
  'a2',
  'b1',
  'b2',
  'c1',
  'c2',
  'native',
] as const;
export const STAGES = ['a', 'b', 'c', 'd', 'e', 'f', 'z', 's'] as const;
export const AREAS = [
  'it',
  'hr',
  'tutoring',
  'comms',
  'training',
  'events',
] as const;

export const recruitingSession = pgTable('recruitment_session', {
  id: text('id').primaryKey(),
  year: integer('year').notNull(),
  semester: integer('semester').notNull(),
  start_date: timestamp('start_date').notNull(),
  end_date: timestamp('end_date').notNull(),
});

export const recruitingSessionRelations = relations(
  recruitingSession,
  ({ many }) => ({
    applicants: many(applicant),
    timeslots: many(timeslot),
  })
);

export const applicant = pgTable('applicant', {
  id: text('id').primaryKey(),
  recruitingSessionId: text('recruiting_session_id')
    .notNull()
    .references(() => recruitingSession.id),
  name: text('name').notNull(),
  surname: text('surname').notNull(),
  email: text('email').notNull(),
  gpa: numeric('gpa').notNull(),
  degreeLevel: text('degree', {
    enum: DEGREE_LEVELS,
  }).notNull(),
  course: text('course').notNull(),
  courseArea: text('course_area').notNull(),
  italianLevel: text('italian_level', {
    enum: LANGUAGE_LEVELS,
  }).notNull(),
  stage: text('stage', {
    enum: STAGES,
  }).notNull(),
  cvFileId: text('cv_file_id').notNull(),
  spFileId: text('sp_file_id').notNull(),
  interviewId: text('interview_id').references(() => interview.id),
  token: text('token'),
  chosenArea: text('chosen_area', {
    enum: AREAS,
  }),
  accepted: boolean('accepted'),
  ...timestamps,
});

export const applicantRelations = relations(applicant, ({ one }) => ({
  recruitingSession: one(recruitingSession, {
    fields: [applicant.recruitingSessionId],
    references: [recruitingSession.id],
  }),
  interview: one(interview, {
    fields: [applicant.interviewId],
    references: [interview.id],
  }),
}));

export const stageStatus = pgTable('stage_status', {
  id: text('id').primaryKey(),
  applicantId: text('applicant_id')
    .notNull()
    .references(() => applicant.id),
  assignedById: text('assigned_by_id')
    .notNull()
    .references(() => user.id),
  stage: text('stage', {
    enum: STAGES,
  }).notNull(),
  counter: integer('counter').default(0),
  processed: boolean('processed').default(false).notNull(),
  deletedAt: timestamp('deleted_at'),
  ...timestamps,
});

export const timeslot = pgTable('timeslot', {
  id: text('id').primaryKey(),
  recruitingSessionId: text('recruiting_session_id')
    .notNull()
    .references(() => recruitingSession.id),
  startingFrom: timestamp('starting_from').notNull(),
});

export const timeslotRelations = relations(timeslot, ({ many, one }) => ({
  recruitingSession: one(recruitingSession, {
    fields: [timeslot.recruitingSessionId],
    references: [recruitingSession.id],
  }),
  interviews: many(interview),
  interviewerAvailability: many(interviewerAvailability),
}));

export const interview = pgTable('interview', {
  id: text('id').primaryKey(),
  timeslotId: text('timeslot_id')
    .references(() => timeslot.id)
    .notNull(),
  meetingId: text('meeting_id'),
  reportDocId: text('report_doc_id'),
  confirmed: boolean('confirmed').default(false).notNull(),
});

export const interviewRelations = relations(interview, ({ one, many }) => ({
  interviewee: one(applicant),
  timeslot: one(timeslot, {
    fields: [interview.timeslotId],
    references: [timeslot.id],
  }),
  interviewers: many(usersToInterviews),
}));

export const userRelations = relations(user, ({ many }) => ({
  interviews: many(usersToInterviews),
  interviewerAvailability: many(interviewerAvailability),
}));

export const usersToInterviews = pgTable(
  'users_to_interviews',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id),
    interviewId: text('interview_id')
      .notNull()
      .references(() => interview.id),
  },
  (t) => [primaryKey({ columns: [t.interviewId, t.userId] })]
);

export const usersToInterviewsRelations = relations(
  usersToInterviews,
  ({ one }) => ({
    user: one(user, {
      fields: [usersToInterviews.userId],
      references: [user.id],
    }),
    interview: one(interview, {
      fields: [usersToInterviews.interviewId],
      references: [interview.id],
    }),
  })
);

export const interviewerAvailability = pgTable(
  'interviewer_availability',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id),
    timeslotId: text('timeslot_id')
      .notNull()
      .references(() => timeslot.id),
    isFirstTime: boolean('is_first_time').default(false).notNull(),
    ...timestamps,
  },
  (t) => [primaryKey({ columns: [t.userId, t.timeslotId] })]
);

export const interviewerAvailabilityRelations = relations(
  interviewerAvailability,
  ({ one }) => ({
    user: one(user, {
      fields: [interviewerAvailability.userId],
      references: [user.id],
    }),
    timeslot: one(timeslot, {
      fields: [interviewerAvailability.timeslotId],
      references: [timeslot.id],
    }),
  })
);

export { account, user, session, verification };
