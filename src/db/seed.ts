import { seed } from "drizzle-seed";
import { db, schema } from ".";

async function main() {
  await seed(db, {
    user: schema.user,
    recruitingSession: schema.recruitingSession,
    interview: schema.interview,
    stageStatus: schema.stageStatus,
    timeslot: schema.timeslot,
    applicant: schema.applicant,
    interviewerAvailability: schema.interviewerAvailability,
    usersToInterviews: schema.usersToInterviews
  }).refine((f) => ({
    usersToInterviews: {
      count: 5
    },
    stageStatus: {
      columns: {
        stage: f.valuesFromArray({
          values: [
            "A", "B", "C", "D", "E", "F", "Z"
          ],
        })
      }
    },
    applicant: {
      columns: {
        stage: f.valuesFromArray({
          values: [
            "A", "B", "C", "D", "E", "F", "Z"
          ],
        })
      }
    }
  }));
}

main();
