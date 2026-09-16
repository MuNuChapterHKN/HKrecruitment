import { listAllApplicants } from '@/lib/services/applicants';
import { findOne } from '@/lib/services/recruitmentSessions';
import type {
  Applicant,
  ApplicationStage,
  RecruitingSession,
} from '@/db/types';

export type ActivityPoint = { date: string; count: number };
export type StageCount = { stage: ApplicationStage; count: number };
export type CourseCount = { course: string; count: number };
export type AutomationRun = {
  id: string;
  name: string;
  status: 'success' | 'running' | 'failed';
  lastRunAt: Date;
  durationMs: number;
};

function toItalianDateKey(date: Date): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Rome' }).format(
    date
  );
}

function aggregateActivity(
  applicants: Applicant[],
  session: RecruitingSession
): ActivityPoint[] {
  const countMap = new Map<string, number>();
  const endKey = toItalianDateKey(new Date(session.end_date));
  const current = new Date(session.start_date);
  current.setUTCHours(0, 0, 0, 0);
  while (toItalianDateKey(current) <= endKey) {
    countMap.set(toItalianDateKey(current), 0);
    current.setUTCDate(current.getUTCDate() + 1);
  }
  for (const appl of applicants) {
    if (!appl.createdAt) continue;
    const key = toItalianDateKey(new Date(appl.createdAt));
    if (countMap.has(key)) {
      countMap.set(key, (countMap.get(key) ?? 0) + 1);
    }
  }
  return Array.from(countMap.entries()).map(([date, count]) => ({
    date,
    count,
  }));
}

function countByStage(applicants: Applicant[]): StageCount[] {
  const map = new Map<ApplicationStage, number>();
  for (const appl of applicants) {
    map.set(appl.stage, (map.get(appl.stage) ?? 0) + 1);
  }
  return Array.from(map.entries()).map(([stage, count]) => ({ stage, count }));
}

function countByCourse(applicants: Applicant[]): CourseCount[] {
  const map = new Map<string, number>();
  const displayMap = new Map<string, string>();
  for (const appl of applicants) {
    const key = appl.course.toLowerCase();
    if (!displayMap.has(key)) displayMap.set(key, appl.course);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([key, count]) => ({ course: displayMap.get(key) ?? key, count }))
    .sort((a, b) => b.count - a.count);
}

function pickLatest(applicants: Applicant[], limit = 8): Applicant[] {
  return applicants.slice(0, limit);
}

function buildMockAutomations(): AutomationRun[] {
  const now = new Date();
  return [
    {
      id: 'main',
      name: 'Stage Automation',
      status: 'success',
      lastRunAt: new Date(now.getTime() - 5 * 60_000),
      durationMs: 1240,
    },
    {
      id: 'a',
      name: 'Stage A',
      status: 'success',
      lastRunAt: new Date(now.getTime() - 12 * 60_000),
      durationMs: 870,
    },
    {
      id: 'b',
      name: 'Stage B',
      status: 'running',
      lastRunAt: new Date(now.getTime() - 60_000),
      durationMs: 0,
    },
    {
      id: 'notify',
      name: 'Notify',
      status: 'success',
      lastRunAt: new Date(now.getTime() - 30 * 60_000),
      durationMs: 320,
    },
    {
      id: 'email-formatter',
      name: 'Email Formatter',
      status: 'failed',
      lastRunAt: new Date(now.getTime() - 45 * 60_000),
      durationMs: 150,
    },
  ];
}

export async function getDashboardData(rid: string): Promise<{
  session: RecruitingSession | null;
  activity: ActivityPoint[];
  stageCounts: StageCount[];
  courseCounts: CourseCount[];
  latestApplicants: Applicant[];
  automations: AutomationRun[];
}> {
  const [session, applicants] = await Promise.all([
    findOne(rid),
    listAllApplicants(rid),
  ]);

  if (!session) {
    return {
      session: null,
      activity: [],
      stageCounts: [],
      courseCounts: [],
      latestApplicants: [],
      automations: buildMockAutomations(),
    };
  }

  return {
    session,
    activity: aggregateActivity(applicants, session),
    stageCounts: countByStage(applicants),
    courseCounts: countByCourse(applicants),
    latestApplicants: pickLatest(applicants),
    automations: buildMockAutomations(),
  };
}
