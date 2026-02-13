import { seed } from 'drizzle-seed';
import { db, schema } from '.';
import { eq } from 'drizzle-orm';

async function main() {
  let adminEmail;
  for (const arg of process.argv) {
    if (arg.startsWith('--admin-email'))
      adminEmail = arg.replaceAll(/--admin-email[=\s]+?/gi, '');
  }

  // First seed the database with basic data (excluding interview, interviewerAvailability, and usersToInterviews since they depend on timeslots)
  await seed(db, {
    user: schema.user,
    recruitingSession: schema.recruitingSession,
    stageStatus: schema.stageStatus,
    applicant: schema.applicant,
  }).refine((f) => ({
    user: {
      columns: {
        role: f.valuesFromArray({
          values: [0, 1, 2, 3, 4],
          isUnique: false,
        }),
      },
    },
    recruitingSession: {
      columns: {
        year: f.int({
          minValue: 2000,
          maxValue: new Date().getFullYear(),
        }),
        semester: f.int({
          minValue: 1,
          maxValue: 10,
        }),
        start_date: f.date({
          minDate: '2020-01-01',
          maxDate: '2024-12-31',
        }),
        end_date: f.date({
          minDate: '2020-01-01',
          maxDate: '2024-12-31',
        }),
      },
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

  // Update recruitment sessions to ensure start_date and end_date are at most 1 week apart
  const recruitingSessions = await db.select().from(schema.recruitingSession);

  for (const session of recruitingSessions) {
    const startDate = new Date(session.start_date);
    const maxEndDate = new Date(startDate);
    maxEndDate.setDate(maxEndDate.getDate() + 7);

    const currentEndDate = new Date(session.end_date);

    // If end_date is more than 1 week after start_date, update it
    if (currentEndDate > maxEndDate) {
      await db
        .update(schema.recruitingSession)
        .set({ end_date: maxEndDate })
        .where(eq(schema.recruitingSession.id, session.id));

      session.end_date = maxEndDate;
    }
  }

  // Generate timeslots for each recruitment session
  for (const session of recruitingSessions) {
    const timeslots = [];
    const startDate = new Date(session.start_date);
    const endDate = new Date(session.end_date);

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      for (let hour = 9; hour <= 20; hour++) {
        const timeslotDate = new Date(currentDate);
        timeslotDate.setHours(hour, 0, 0, 0);
        timeslots.push({
          id: `${session.id}-${timeslotDate.toISOString()}`,
          recruitingSessionId: session.id,
          startingFrom: timeslotDate,
        });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (timeslots.length > 0) {
      await db.insert(schema.timeslot).values(timeslots);
    }
  }

  if (adminEmail) {
    console.log('Setting admin user with email ', adminEmail);
    await db
      .update(schema.user)
      .set({ role: 4 })
      .where(eq(schema.user.email, adminEmail));
  }
}

main();
