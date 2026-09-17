CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "applicant" (
	"id" text PRIMARY KEY NOT NULL,
	"recruiting_session_id" text NOT NULL,
	"name" text NOT NULL,
	"surname" text NOT NULL,
	"email" text NOT NULL,
	"gpa" numeric NOT NULL,
	"degree" text NOT NULL,
	"course" text NOT NULL,
	"course_area" text NOT NULL,
	"italian_level" text NOT NULL,
	"stage" text NOT NULL,
	"cv_file_id" text NOT NULL,
	"sp_file_id" text NOT NULL,
	"interview_id" text,
	"token" text,
	"chosen_area" text,
	"accepted" boolean,
	"archived" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "availability_timeslot_mask" (
	"recruiting_session_id" text NOT NULL,
	"timeslot_id" text NOT NULL,
	CONSTRAINT "availability_timeslot_mask_recruiting_session_id_timeslot_id_pk" PRIMARY KEY("recruiting_session_id","timeslot_id")
);
--> statement-breakpoint
CREATE TABLE "interview" (
	"id" text PRIMARY KEY NOT NULL,
	"timeslot_id" text NOT NULL,
	"meeting_id" text,
	"report_doc_id" text,
	"confirmed" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interviewer_availability" (
	"user_id" text NOT NULL,
	"timeslot_id" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "interviewer_availability_user_id_timeslot_id_pk" PRIMARY KEY("user_id","timeslot_id")
);
--> statement-breakpoint
CREATE TABLE "recruitment_session" (
	"id" text PRIMARY KEY NOT NULL,
	"year" integer NOT NULL,
	"semester" integer NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "stage_status" (
	"id" text PRIMARY KEY NOT NULL,
	"applicant_id" text NOT NULL,
	"assigned_by_id" text,
	"stage" text NOT NULL,
	"processed" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"notes" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "timeslot" (
	"id" text PRIMARY KEY NOT NULL,
	"recruiting_session_id" text NOT NULL,
	"starting_from" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"role" integer DEFAULT 0,
	"is_first_time" boolean DEFAULT false NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "users_to_interviews" (
	"user_id" text NOT NULL,
	"interview_id" text NOT NULL,
	CONSTRAINT "users_to_interviews_interview_id_user_id_pk" PRIMARY KEY("interview_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "users_to_recruiting_sessions" (
	"user_id" text NOT NULL,
	"recruiting_session_id" text NOT NULL,
	"role" integer NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_to_recruiting_sessions_recruiting_session_id_user_id_pk" PRIMARY KEY("recruiting_session_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applicant" ADD CONSTRAINT "applicant_recruiting_session_id_recruitment_session_id_fk" FOREIGN KEY ("recruiting_session_id") REFERENCES "public"."recruitment_session"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applicant" ADD CONSTRAINT "applicant_interview_id_interview_id_fk" FOREIGN KEY ("interview_id") REFERENCES "public"."interview"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "availability_timeslot_mask" ADD CONSTRAINT "availability_timeslot_mask_recruiting_session_id_recruitment_session_id_fk" FOREIGN KEY ("recruiting_session_id") REFERENCES "public"."recruitment_session"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "availability_timeslot_mask" ADD CONSTRAINT "availability_timeslot_mask_timeslot_id_timeslot_id_fk" FOREIGN KEY ("timeslot_id") REFERENCES "public"."timeslot"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview" ADD CONSTRAINT "interview_timeslot_id_timeslot_id_fk" FOREIGN KEY ("timeslot_id") REFERENCES "public"."timeslot"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interviewer_availability" ADD CONSTRAINT "interviewer_availability_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interviewer_availability" ADD CONSTRAINT "interviewer_availability_timeslot_id_timeslot_id_fk" FOREIGN KEY ("timeslot_id") REFERENCES "public"."timeslot"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stage_status" ADD CONSTRAINT "stage_status_applicant_id_applicant_id_fk" FOREIGN KEY ("applicant_id") REFERENCES "public"."applicant"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stage_status" ADD CONSTRAINT "stage_status_assigned_by_id_user_id_fk" FOREIGN KEY ("assigned_by_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timeslot" ADD CONSTRAINT "timeslot_recruiting_session_id_recruitment_session_id_fk" FOREIGN KEY ("recruiting_session_id") REFERENCES "public"."recruitment_session"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_to_interviews" ADD CONSTRAINT "users_to_interviews_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_to_interviews" ADD CONSTRAINT "users_to_interviews_interview_id_interview_id_fk" FOREIGN KEY ("interview_id") REFERENCES "public"."interview"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_to_recruiting_sessions" ADD CONSTRAINT "users_to_recruiting_sessions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_to_recruiting_sessions" ADD CONSTRAINT "users_to_recruiting_sessions_recruiting_session_id_recruitment_session_id_fk" FOREIGN KEY ("recruiting_session_id") REFERENCES "public"."recruitment_session"("id") ON DELETE no action ON UPDATE no action;