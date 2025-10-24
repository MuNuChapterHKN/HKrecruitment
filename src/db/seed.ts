import { seed } from "drizzle-seed";
import { db, schema } from ".";
import { eq } from "drizzle-orm";

async function main() {
  let adminEmail;

  for (const arg of process.argv) {
    if (arg.startsWith("--admin-email"))
      adminEmail = arg.replaceAll(/--admin-email[=\s]+?/gi, "");
  }

  if (adminEmail) {
    console.log("Setting admin user with email ", adminEmail);
    await db.update(schema.user).set({ role: 4 }).where(eq(schema.user.email, adminEmail));
  }

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
            "a", "b", "c", "d", "e", "f", "z"
          ],
        })
      }
    },
    applicant: {
      columns: {
        stage: f.valuesFromArray({
          values: [
            "a", "b", "c", "d", "e", "f", "z"
          ],
        })
      }
    }
  }));
}

main();
