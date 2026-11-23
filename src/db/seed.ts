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

async function seedRealisticData() {
  const now = new Date();
  const currentYear = now.getFullYear();

  // 1. Recruiting sessions: one past session + one currently open session (highest year/semester)
  const pastStart = new Date(now);
  pastStart.setFullYear(currentYear - 1);
  pastStart.setDate(pastStart.getDate() - 14);
  const pastEnd = new Date(pastStart);
  pastEnd.setDate(pastEnd.getDate() + 7);

  const openStart = new Date(now);
  openStart.setDate(openStart.getDate() - 1);
  const openEnd = new Date(now);
  openEnd.setDate(openEnd.getDate() + 7);

  const pastSession = {
    id: 'seed-session-past',
    year: currentYear - 1,
    semester: 1,
    start_date: pastStart,
    end_date: pastEnd,
  };

  const openSession = {
    id: 'seed-session-open',
    year: currentYear + 1,
    semester: 1,
    start_date: openStart,
    end_date: openEnd,
  };

  await db
    .insert(schema.recruitingSession)
    .values([pastSession, openSession])
    .onConflictDoUpdate({
      target: schema.recruitingSession.id,
      set: {
        start_date: openStart,
        end_date: openEnd,
      },
    });

  // 2. Users with roles 0..3 only (one per role)
  const seedUsers = [
    {
      id: 'seed-user-guest',
      name: 'Giulia Guest',
      email: 'giulia.guest@example.com',
      emailVerified: true,
      role: AuthUserRole.Guest,
    },
    {
      id: 'seed-user-member',
      name: 'Marco Member',
      email: 'marco.member@example.com',
      emailVerified: true,
      role: AuthUserRole.Member,
    },
    {
      id: 'seed-user-clerk',
      name: 'Elena Clerk',
      email: 'elena.clerk@example.com',
      emailVerified: true,
      role: AuthUserRole.Clerk,
    },
    {
      id: 'seed-user-admin',
      name: 'Luca Admin',
      email: 'luca.admin@example.com',
      emailVerified: true,
      role: AuthUserRole.Admin,
    },
  ];

  for (const u of seedUsers) {
    await db
      .insert(schema.user)
      .values(u)
      .onConflictDoUpdate({
        target: schema.user.id,
        set: {
          name: u.name,
          role: u.role,
        },
      });

    await db
      .insert(schema.usersToRecruitingSessions)
      .values({
        userId: u.id,
        recruitingSessionId: openSession.id,
        role: u.role,
      })
      .onConflictDoUpdate({
        target: [
          schema.usersToRecruitingSessions.recruitingSessionId,
          schema.usersToRecruitingSessions.userId,
        ],
        set: {
          role: u.role,
        },
      });
  }

  // 3. Timeslots for both sessions (09:00 to 20:00 each day)
  const sessions = [pastSession, openSession];
  const openSessionTimeslotIds: string[] = [];

  for (const session of sessions) {
    const timeslots = [];
    const cursor = new Date(session.start_date);
    cursor.setHours(0, 0, 0, 0);
    const endCursor = new Date(session.end_date);
    endCursor.setHours(23, 59, 59, 999);

    while (cursor <= endCursor) {
      for (let hour = 9; hour <= 20; hour++) {
        const slotDate = new Date(cursor);
        slotDate.setHours(hour, 0, 0, 0);
        const slotId = `${session.id}-${slotDate.toISOString()}`;
        timeslots.push({
          id: slotId,
          recruitingSessionId: session.id,
          startingFrom: slotDate,
        });
        if (session.id === openSession.id) {
          openSessionTimeslotIds.push(slotId);
        }
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    if (timeslots.length > 0) {
      await db.insert(schema.timeslot).values(timeslots).onConflictDoNothing();
    }
  }

  // 4. Availability masks & interviewer availability on upcoming timeslots
  const upcomingSlots = openSessionTimeslotIds.slice(24, 34); // tomorrow morning/afternoon slots
  if (upcomingSlots.length > 0) {
    await db
      .insert(schema.availabilityTimeslotMask)
      .values(
        upcomingSlots.map((timeslotId) => ({
          recruitingSessionId: openSession.id,
          timeslotId,
        }))
      )
      .onConflictDoNothing();

    const interviewerIds = [
      'seed-user-member',
      'seed-user-clerk',
      'seed-user-admin',
    ];
    const availabilityRows = interviewerIds.flatMap((userId, idx) =>
      upcomingSlots.slice(idx, idx + 5).map((timeslotId) => ({
        userId,
        timeslotId,
      }))
    );

    await db
      .insert(schema.interviewerAvailability)
      .values(availabilityRows)
      .onConflictDoNothing();
  }

  // 5. Interview linked to an applicant in stage C
  const interviewSlotId = upcomingSlots[0] ?? openSessionTimeslotIds[0];
  const interviewId = 'seed-interview-1';

  if (interviewSlotId) {
    await db
      .insert(schema.interview)
      .values({
        id: interviewId,
        timeslotId: interviewSlotId,
        confirmed: true,
      })
      .onConflictDoNothing();

    await db
      .insert(schema.usersToInterviews)
      .values([
        { userId: 'seed-user-clerk', interviewId },
        { userId: 'seed-user-admin', interviewId },
      ])
      .onConflictDoNothing();
  }

  // 6. At least 10 readable applicants across stages a-f in open session + past session applicants
  const applicantsData: Array<{
    id: string;
    recruitingSessionId: string;
    name: string;
    surname: string;
    email: string;
    gpa: string;
    degreeLevel: 'bsc' | 'msc' | 'phd';
    course: string;
    courseArea: string;
    italianLevel: 'b2' | 'c1' | 'c2' | 'native';
    stage: 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'z';
    interviewId?: string | null;
    chosenArea?:
      | 'it'
      | 'hr'
      | 'tutoring'
      | 'comms'
      | 'training'
      | 'events'
      | null;
    accepted?: boolean | null;
  }> = [
    {
      id: 'seed-app-open-1',
      recruitingSessionId: openSession.id,
      name: 'Alessandro',
      surname: 'Rossi',
      email: 'alessandro.rossi@studenti.polito.it',
      gpa: '28.5',
      degreeLevel: 'bsc',
      course: 'Ingegneria Informatica',
      courseArea: 'ICT',
      italianLevel: 'native',
      stage: 'a',
    },
    {
      id: 'seed-app-open-2',
      recruitingSessionId: openSession.id,
      name: 'Sofia',
      surname: 'Bianchi',
      email: 'sofia.bianchi@studenti.polito.it',
      gpa: '29.2',
      degreeLevel: 'msc',
      course: 'Data Science and Engineering',
      courseArea: 'ICT',
      italianLevel: 'native',
      stage: 'a',
    },
    {
      id: 'seed-app-open-3',
      recruitingSessionId: openSession.id,
      name: 'Lorenzo',
      surname: 'Russo',
      email: 'lorenzo.russo@studenti.polito.it',
      gpa: '27.8',
      degreeLevel: 'bsc',
      course: 'Ingegneria Elettronica',
      courseArea: 'ICT',
      italianLevel: 'native',
      stage: 'b',
    },
    {
      id: 'seed-app-open-4',
      recruitingSessionId: openSession.id,
      name: 'Chiara',
      surname: 'Ferrari',
      email: 'chiara.ferrari@studenti.polito.it',
      gpa: '29.0',
      degreeLevel: 'msc',
      course: 'Computer Engineering',
      courseArea: 'ICT',
      italianLevel: 'native',
      stage: 'c',
      interviewId: interviewSlotId ? interviewId : null,
    },
    {
      id: 'seed-app-open-5',
      recruitingSessionId: openSession.id,
      name: 'Matteo',
      surname: 'Esposito',
      email: 'matteo.esposito@studenti.polito.it',
      gpa: '27.4',
      degreeLevel: 'bsc',
      course: 'Ingegneria Gestionale',
      courseArea: 'Management',
      italianLevel: 'native',
      stage: 'c',
    },
    {
      id: 'seed-app-open-6',
      recruitingSessionId: openSession.id,
      name: 'Alice',
      surname: 'Romano',
      email: 'alice.romano@studenti.polito.it',
      gpa: '28.9',
      degreeLevel: 'msc',
      course: 'Ingegneria Biomedica',
      courseArea: 'Industrial',
      italianLevel: 'native',
      stage: 'd',
    },
    {
      id: 'seed-app-open-7',
      recruitingSessionId: openSession.id,
      name: 'Davide',
      surname: 'Colombo',
      email: 'davide.colombo@studenti.polito.it',
      gpa: '29.6',
      degreeLevel: 'msc',
      course: 'Cybersecurity',
      courseArea: 'ICT',
      italianLevel: 'native',
      stage: 'e',
    },
    {
      id: 'seed-app-open-8',
      recruitingSessionId: openSession.id,
      name: 'Martina',
      surname: 'Ricci',
      email: 'martina.ricci@studenti.polito.it',
      gpa: '28.1',
      degreeLevel: 'bsc',
      course: 'Ingegneria Aerospaziale',
      courseArea: 'Industrial',
      italianLevel: 'native',
      stage: 'e',
    },
    {
      id: 'seed-app-open-9',
      recruitingSessionId: openSession.id,
      name: 'Federico',
      surname: 'Marino',
      email: 'federico.marino@studenti.polito.it',
      gpa: '29.8',
      degreeLevel: 'phd',
      course: 'Electrical, Electronics and Communications Engineering',
      courseArea: 'ICT',
      italianLevel: 'c2',
      stage: 'f',
      chosenArea: 'it',
      accepted: true,
    },
    {
      id: 'seed-app-open-10',
      recruitingSessionId: openSession.id,
      name: 'Giorgia',
      surname: 'Greco',
      email: 'giorgia.greco@studenti.polito.it',
      gpa: '27.5',
      degreeLevel: 'bsc',
      course: 'Ingegneria Fisica',
      courseArea: 'Industrial',
      italianLevel: 'native',
      stage: 'z',
      accepted: false,
    },
    {
      id: 'seed-app-past-1',
      recruitingSessionId: pastSession.id,
      name: 'Andrea',
      surname: 'Conti',
      email: 'andrea.conti@studenti.polito.it',
      gpa: '28.7',
      degreeLevel: 'msc',
      course: 'Ingegneria Informatica',
      courseArea: 'ICT',
      italianLevel: 'native',
      stage: 'f',
      chosenArea: 'hr',
      accepted: true,
    },
    {
      id: 'seed-app-past-2',
      recruitingSessionId: pastSession.id,
      name: 'Valentina',
      surname: 'Gallo',
      email: 'valentina.gallo@studenti.polito.it',
      gpa: '27.9',
      degreeLevel: 'bsc',
      course: 'Ingegneria Meccanica',
      courseArea: 'Industrial',
      italianLevel: 'native',
      stage: 'z',
      accepted: false,
    },
  ];

  for (const app of applicantsData) {
    await db
      .insert(schema.applicant)
      .values({
        id: app.id,
        recruitingSessionId: app.recruitingSessionId,
        name: app.name,
        surname: app.surname,
        email: app.email,
        gpa: app.gpa,
        degreeLevel: app.degreeLevel,
        course: app.course,
        courseArea: app.courseArea,
        italianLevel: app.italianLevel,
        stage: app.stage,
        cvFileId: 'fake-cv',
        spFileId: 'fake-sp',
        interviewId: app.interviewId ?? null,
        chosenArea: app.chosenArea ?? null,
        accepted: app.accepted ?? null,
      })
      .onConflictDoNothing();

    await db
      .insert(schema.stageStatus)
      .values({
        id: `seed-status-${app.id}-${app.stage}`,
        applicantId: app.id,
        assignedById: 'seed-user-admin',
        stage: app.stage,
        processed: app.stage === 'f' || app.stage === 'z',
      })
      .onConflictDoNothing();
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
    await seedRealisticData();
    console.log('Seeded realistic local development data.');
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
