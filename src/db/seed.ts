import { db, schema } from '.';
import { desc, eq } from 'drizzle-orm';
import { AuthUserRole } from '@/lib/server/authTypes';

type DashboardRole = 'guest' | 'member' | 'clerk' | 'admin';

function parseArgValue(name: string) {
  for (const arg of process.argv) {
    if (arg.startsWith(`--${name}=`)) {
      return arg.slice(name.length + 3);
    }
  }

  return null;
}

function roleToValue(role: DashboardRole) {
  switch (role) {
    case 'guest':
      return AuthUserRole.Guest;
    case 'member':
      return AuthUserRole.Member;
    case 'clerk':
      return AuthUserRole.Clerk;
    case 'admin':
      return AuthUserRole.Admin;
  }
}

async function main() {
  const adminEmail = parseArgValue('admin-email');
  const sessionRoleEmail = parseArgValue('session-role-email');
  const sessionRole = parseArgValue('session-role') as DashboardRole | null;
  const sessionId = parseArgValue('session-id');
  const forceSeed = process.argv.includes('--with-seed');
  const hasAssignmentArgs = Boolean(
    adminEmail || sessionRoleEmail || sessionRole
  );
  const shouldSeedData = forceSeed || !hasAssignmentArgs;

  if (
    (sessionRoleEmail && !sessionRole) ||
    (!sessionRoleEmail && sessionRole)
  ) {
    throw new Error(
      'Both --session-role-email and --session-role are required together'
    );
  }

  if (shouldSeedData) {
    const now = new Date();
    const currentYear = now.getFullYear();

    // Open session: yesterday through next week
    const openStart = new Date(now);
    openStart.setDate(openStart.getDate() - 1);

    const openEnd = new Date(now);
    openEnd.setDate(openEnd.getDate() + 7);

    // Past session: one year ago
    const pastStart = new Date(now);
    pastStart.setFullYear(pastStart.getFullYear() - 1);

    const pastEnd = new Date(pastStart);
    pastEnd.setDate(pastEnd.getDate() + 7);

    const sessions = [
      {
        id: 'demo-open-session',
        year: currentYear,
        semester: 2,
        start_date: openStart,
        end_date: openEnd,
      },
      {
        id: 'demo-past-session',
        year: currentYear - 1,
        semester: 1,
        start_date: pastStart,
        end_date: pastEnd,
      },
    ];

    for (const session of sessions) {
      await db
        .insert(schema.recruitingSession)
        .values(session)
        .onConflictDoUpdate({
          target: schema.recruitingSession.id,
          set: {
            year: session.year,
            semester: session.semester,
            start_date: session.start_date,
            end_date: session.end_date,
          },
        });
    }

    const users = [
      {
        id: 'demo-guest',
        name: 'Giulia Rossi',
        email: 'giulia.rossi@example.com',
        role: AuthUserRole.Guest,
      },
      {
        id: 'demo-member',
        name: 'Marco Bianchi',
        email: 'marco.bianchi@example.com',
        role: AuthUserRole.Member,
      },
      {
        id: 'demo-clerk',
        name: 'Sara Verdi',
        email: 'sara.verdi@example.com',
        role: AuthUserRole.Clerk,
      },
      {
        id: 'demo-admin',
        name: 'Luca Moretti',
        email: 'luca.moretti@example.com',
        role: AuthUserRole.Admin,
      },
    ];

    for (const user of users) {
      await db
        .insert(schema.user)
        .values(user)
        .onConflictDoUpdate({
          target: schema.user.id,
          set: {
            name: user.name,
            email: user.email,
            role: user.role,
          },
        });

      await db
        .insert(schema.usersToRecruitingSessions)
        .values({
          userId: user.id,
          recruitingSessionId: 'demo-open-session',
          role: user.role,
        })
        .onConflictDoUpdate({
          target: [
            schema.usersToRecruitingSessions.recruitingSessionId,
            schema.usersToRecruitingSessions.userId,
          ],
          set: {
            role: user.role,
          },
        });
    }

    // Create 12 demo applicants across stages A-F
    const applicantProfiles = [
      { name: 'Anna', surname: 'Ferrari', stage: 'a' },
      { name: 'Matteo', surname: 'Romano', stage: 'a' },
      { name: 'Sofia', surname: 'Conti', stage: 'b' },
      { name: 'Alessandro', surname: 'Ricci', stage: 'b' },
      { name: 'Elena', surname: 'Marino', stage: 'c' },
      { name: 'Davide', surname: 'Greco', stage: 'c' },
      { name: 'Chiara', surname: 'Gallo', stage: 'd' },
      { name: 'Lorenzo', surname: 'Costa', stage: 'd' },
      { name: 'Martina', surname: 'Fontana', stage: 'e' },
      { name: 'Federico', surname: 'Riva', stage: 'e' },
      { name: 'Giulia', surname: 'Esposito', stage: 'f' },
      { name: 'Andrea', surname: 'Moretti', stage: 'f' },
    ] as const;

    for (const [index, profile] of applicantProfiles.entries()) {
      const applicantId = `demo-applicant-${index + 1}`;
      const email = `${profile.name.toLowerCase()}.${profile.surname.toLowerCase()}@example.com`;

      await db
        .insert(schema.applicant)
        .values({
          id: applicantId,
          recruitingSessionId: 'demo-open-session',
          name: profile.name,
          surname: profile.surname,
          email,
          gpa: (25 + (index % 5)).toFixed(1),
          degreeLevel: 'msc',
          course: 'Computer Engineering',
          courseArea: 'Engineering',
          italianLevel: 'b2',
          stage: profile.stage,
          cvFileId: `demo-cv-${index + 1}`,
          spFileId: `demo-sp-${index + 1}`,
        })
        .onConflictDoUpdate({
          target: schema.applicant.id,
          set: {
            name: profile.name,
            surname: profile.surname,
            email,
            stage: profile.stage,
            recruitingSessionId: 'demo-open-session',
          },
        });

      await db
        .insert(schema.stageStatus)
        .values({
          id: `demo-stage-status-${index + 1}`,
          applicantId,
          stage: profile.stage,
          processed: false,
        })
        .onConflictDoUpdate({
          target: schema.stageStatus.id,
          set: {
            stage: profile.stage,
            processed: false,
          },
        });
    }

    // Create reusable timeslots for both recruiting sessions
    for (const recruitingSession of sessions) {
      const currentDate = new Date(recruitingSession.start_date);
      currentDate.setHours(0, 0, 0, 0);

      const lastDate = new Date(recruitingSession.end_date);
      lastDate.setHours(0, 0, 0, 0);

      const timeslots: (typeof schema.timeslot.$inferInsert)[] = [];

      while (currentDate <= lastDate) {
        for (const hour of [9, 11, 14, 16]) {
          const startingFrom = new Date(currentDate);
          startingFrom.setHours(hour, 0, 0, 0);

          timeslots.push({
            id: `${recruitingSession.id}-${startingFrom.toISOString()}`,
            recruitingSessionId: recruitingSession.id,
            startingFrom,
          });
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      if (timeslots.length > 0) {
        await db
          .insert(schema.timeslot)
          .values(timeslots)
          .onConflictDoNothing();
      }
    }

    // Find upcoming timeslots in the open recruiting session
    const openTimeslots = await db
      .select()
      .from(schema.timeslot)
      .where(eq(schema.timeslot.recruitingSessionId, 'demo-open-session'))
      .orderBy(schema.timeslot.startingFrom);

    const upcomingSlots = openTimeslots
      .filter((slot) => slot.startingFrom > now)
      .slice(0, 4);

    if (upcomingSlots.length === 0) {
      throw new Error('No upcoming timeslots found for the open session');
    }

    // Assign two interviewers to the available timeslots
    const interviewerIds = ['demo-member', 'demo-clerk'];

    const availabilityRecords = upcomingSlots.flatMap((slot) =>
      interviewerIds.map((userId) => ({
        userId,
        timeslotId: slot.id,
      }))
    );

    await db
      .insert(schema.interviewerAvailability)
      .values(availabilityRecords)
      .onConflictDoNothing();

    // Create an interview for Elena Marino (stage C)
    const interviewId = 'demo-interview-stage-c';

    await db
      .insert(schema.interview)
      .values({
        id: interviewId,
        timeslotId: upcomingSlots[0].id,
        confirmed: false,
      })
      .onConflictDoUpdate({
        target: schema.interview.id,
        set: {
          timeslotId: upcomingSlots[0].id,
        },
      });

    // Link the interview to the stage-C applicant
    await db
      .update(schema.applicant)
      .set({
        interviewId,
      })
      .where(eq(schema.applicant.id, 'demo-applicant-5'));

    // Assign Marco and Sara as interviewers
    await db
      .insert(schema.usersToInterviews)
      .values([
        {
          userId: 'demo-member',
          interviewId,
        },
        {
          userId: 'demo-clerk',
          interviewId,
        },
      ])
      .onConflictDoNothing();
  }

  if (adminEmail) {
    console.log('Setting admin user with email ', adminEmail);
    await db
      .update(schema.user)
      .set({ role: roleToValue('admin') })
      .where(eq(schema.user.email, adminEmail));
  }

  if (sessionRoleEmail && sessionRole) {
    const userRes = await db
      .select({ id: schema.user.id })
      .from(schema.user)
      .where(eq(schema.user.email, sessionRoleEmail))
      .limit(1);

    const sessionRes = sessionId
      ? await db
          .select({ id: schema.recruitingSession.id })
          .from(schema.recruitingSession)
          .where(eq(schema.recruitingSession.id, sessionId))
          .limit(1)
      : await db
          .select({ id: schema.recruitingSession.id })
          .from(schema.recruitingSession)
          .orderBy(
            desc(schema.recruitingSession.year),
            desc(schema.recruitingSession.semester)
          )
          .limit(1);

    const user = userRes.at(0);
    const session = sessionRes.at(0);

    if (!user) {
      throw new Error(`No user found for email ${sessionRoleEmail}`);
    }

    if (!session) {
      throw new Error('No recruitment session found to assign a session role');
    }

    const roleValue = roleToValue(sessionRole);

    await db
      .insert(schema.usersToRecruitingSessions)
      .values({
        userId: user.id,
        recruitingSessionId: session.id,
        role: roleValue,
      })
      .onConflictDoUpdate({
        target: [
          schema.usersToRecruitingSessions.recruitingSessionId,
          schema.usersToRecruitingSessions.userId,
        ],
        set: {
          role: roleValue,
        },
      });

    console.log(
      `Set session role ${sessionRole} for ${sessionRoleEmail} on recruitment session ${session.id}`
    );
  }
}

main();
