BEGIN TRANSACTION;
-- People tables
CREATE TABLE IF NOT EXISTS "Person"
(
    "image"    TEXT,
    "name"     TEXT    NOT NULL,
    "surname"  TEXT    NOT NULL,
    "sex"      TEXT    NOT NULL,
    "email"    TEXT    NOT NULL UNIQUE,
    "phone_no" INTEGER NOT NULL UNIQUE,
    "id"       TEXT    NOT NULL UNIQUE,
    PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Applicant"
(
    "id"           TEXT NOT NULL UNIQUE,
    "birth_date"   TEXT NOT NULL,
    "telegram_uid" TEXT DEFAULT NULL,
    "how_know_HKN" TEXT DEFAULT NULL,
    FOREIGN KEY ("id") REFERENCES "Person" ("id"),
    PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Member"
(
    "id"        TEXT NOT NULL UNIQUE,
    "role"      TEXT NOT NULL,
    "is_expert" BOOLEAN,
    "is_board"  BOOLEAN,
    FOREIGN KEY ("id") REFERENCES "Person" ("id"),
    PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Friends"
(
    "applicant_id" TEXT NOT NULL,
    "member_id"    TEXT NOT NULL,
    FOREIGN KEY ("applicant_id") REFERENCES "Applicant" ("id"),
    FOREIGN KEY ("member_id") REFERENCES "Member" ("id"),
    PRIMARY KEY ("applicant_id", "member_id")
);

-- slots
CREATE TABLE IF NOT EXISTS "Slot"
(
    "id"           SERIAL PRIMARY KEY ,
    "state"        TEXT    NOT NULL,
    "cal_id"       TEXT    NOT NULL,
    "start"        TEXT    NOT NULL,
    "end"          TEXT    NOT NULL,
    "interview_id" INTEGER DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS "Invalid_Slots"
(
    "id" INTEGER NOT NULL UNIQUE,
    FOREIGN KEY ("id") REFERENCES "Slot" ("id"),
    PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "TimeSlot"
(
    "start" TEXT NOT NULL,
    "end"   TEXT NOT NULL,
    PRIMARY KEY ("start", "end")
);

CREATE TABLE IF NOT EXISTS "TimeSlot"
(
    "start" TEXT NOT NULL,
    "end"   TEXT NOT NULL,
    PRIMARY KEY ("start", "end")
);

-- recruitment
CREATE TABLE IF NOT EXISTS "Recruitment_Session"
(
    "start" TEXT    NOT NULL,
    "end"   TEXT    NOT NULL,
    "title" TEXT    NOT NULL,
    "id"    INTEGER NOT NULL UNIQUE,
    PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Recruitment_Session"
(
    "start" TEXT    NOT NULL,
    "end"   TEXT    NOT NULL,
    "title" TEXT    NOT NULL,
    "id"    INTEGER NOT NULL UNIQUE,
    PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "Availability"
(
    "state"           TEXT NOT NULL,
    "assigned_at"     TEXT DEFAULT NULL,
    "confirmed_at"    TEXT DEFAULT NULL,
    "member_id"       TEXT NOT NULL,
    "time_slot_start" TEXT NOT NULL,
    "time_slot_end"   TEXT NOT NULL,
    FOREIGN KEY ("member_id") REFERENCES "Member" ("id"),
    FOREIGN KEY ("time_slot_end", "time_slot_start") REFERENCES "TimeSlot" ("end", "start"),
    PRIMARY KEY ("member_id", "time_slot_start", "time_slot_end")
);

CREATE TABLE IF NOT EXISTS "Notification"
(
    "id"             INTEGER NOT NULL UNIQUE,
    "applicant_read" BOOLEAN,
    "member_read"    BOOLEAN,
    "uri"            TEXT    NOT NULL,
    "text"           TEXT    NOT NULL,
    "member_id"      TEXT    NOT NULL,
    "applicant_id"   TEXT    NOT NULL,
    FOREIGN KEY ("applicant_id") REFERENCES "Applicant" ("id"),
    FOREIGN KEY ("member_id") REFERENCES "Member" ("id"),
    PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Slot_Member"
(
    "slot_id"   INTEGER NOT NULL,
    "member_id" TEXT    NOT NULL,
    FOREIGN KEY ("slot_id") REFERENCES "Slot" ("id"),
    FOREIGN KEY ("member_id") REFERENCES "Member" ("id"),
    PRIMARY KEY ("slot_id", "member_id")
);


CREATE TABLE IF NOT EXISTS "Recruitment_Session"
(
    "start" TEXT    NOT NULL,
    "end"   TEXT    NOT NULL,
    "title" TEXT    NOT NULL,
    "id"    INTEGER NOT NULL UNIQUE,
    PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "Courses_Allowed"
(
    "study_path"   TEXT NOT NULL,
    "degree_level" TEXT NOT NULL,
    PRIMARY KEY ("study_path")
);
CREATE TABLE IF NOT EXISTS "Application"
(
    "id"              SERIAL PRIMARY KEY,
    "applicant_id"    TEXT    NOT NULL UNIQUE,
    "interview_id"    INTEGER NOT NULL,
    "last_modified"   TEXT    DEFAULT NULL,
    "submission"      TEXT    NOT NULL,
    "state"           TEXT    NOT NULL,
    "ita_level"       TEXT    NOT NULL,
    "notes"           TEXT    DEFAULT NULL,
    "cv"              TEXT    NOT NULL,
    "list_grade"      INTEGER DEFAULT NULL,
    "bsc_study_path"  TEXT    DEFAULT NULL,
    "bsc_avg_grade"   REAL    DEFAULT NULL,
    "bsc_cfu"         INTEGER DEFAULT NULL,
    "academic_year"   INTEGER DEFAULT NULL,
    "msc_study_path"  TEXT    DEFAULT NULL,
    "msc_avg_grade"   REAL    DEFAULT NULL,
    "msc_cfu"         INTEGER DEFAULT NULL,
    "phd_description" TEXT    DEFAULT NULL,
    "slot_id"         INTEGER DEFAULT NULL,
    FOREIGN KEY ("bsc_study_path") REFERENCES "Courses_Allowed" ("study_path"),
    FOREIGN KEY ("slot_id") REFERENCES "Slot" ("id"),
    FOREIGN KEY ("applicant_id") REFERENCES "Applicant" ("id")
);


CREATE TABLE IF NOT EXISTS "TimeSlot_Application"
(
    "application_id"  INTEGER NOT NULL,
    "time_slot_start" TEXT    NOT NULL,
    "time_slot_end"   TEXT    NOT NULL,
    FOREIGN KEY ("time_slot_end", "time_slot_start") REFERENCES "TimeSlot" ("end", "start"),
    FOREIGN KEY ("application_id") REFERENCES "Application" ("id"),
    PRIMARY KEY ("application_id", "time_slot_start", "time_slot_end")
);

CREATE TABLE IF NOT EXISTS "Interview"
(
    "id"             SERIAL PRIMARY KEY,
    "outcome"        TEXT DEFAULT NULL,
    "last_modified"  INTEGER NOT NULL,
    "finalized_at"   TEXT DEFAULT NULL,
    "assigned_area"  TEXT DEFAULT NULL,
    "notes"          TEXT    NOT NULL,
    "application_id" INTEGER NOT NULL UNIQUE,
    FOREIGN KEY ("application_id") REFERENCES "Application" ("id")
);

ALTER TABLE "Application"
    ADD CONSTRAINT fk_application_interview
        FOREIGN KEY (interview_id)
            REFERENCES "Interview" (application_id);


ALTER TABLE "Slot"
    ADD CONSTRAINT fk_slot_interview
        FOREIGN KEY (interview_id)
            REFERENCES "Interview" (id);

COMMIT;
