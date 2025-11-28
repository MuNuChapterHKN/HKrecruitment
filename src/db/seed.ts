import { seed } from 'drizzle-seed';
import { db, schema } from '.';
import { eq } from 'drizzle-orm';

async function main() {
  let adminEmail;
  for (const arg of process.argv) {
    if (arg.startsWith('--admin-email'))
      adminEmail = arg.replaceAll(/--admin-email[=\s]+?/gi, '');
  }

  await seed(db, {
    user: schema.user,
    recruitingSession: schema.recruitingSession,
    interview: schema.interview,
    stageStatus: schema.stageStatus,
    timeslot: schema.timeslot,
    applicant: schema.applicant,
    interviewerAvailability: schema.interviewerAvailability,
    usersToInterviews: schema.usersToInterviews,
  }).refine((f) => ({
    user: {
      columns: {
        role: f.valuesFromArray({
          values: [0, 1, 2, 3, 4], // Guest, User, Clerk, Admin, God ("Guest" and "God" may be excluded in the future)
          isUnique: false,
        }),
      },
    },
    usersToInterviews: {
      count: 5,
    },
    stageStatus: {
      columns: {
        stage: f.valuesFromArray({
          values: ['a', 'b', 'c', 'd', 'e', 'f', 'z'],
        }),
      },
    },
    applicant: {
      columns: {
        stage: f.valuesFromArray({
          values: ['a', 'b', 'c', 'd', 'e', 'f', 'z'],
        }),
      },
    },
  }));

  // Set the admin AFTER the seed
  if (adminEmail) {
    console.log('Setting admin user with email ', adminEmail);
    await db
      .update(schema.user)
      .set({ role: 4 })
      .where(eq(schema.user.email, adminEmail));
  }
}

main();
