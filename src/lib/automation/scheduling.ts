import { DateTime } from 'luxon';

export const ROME_TIMEZONE = 'Europe/Rome';
export const DEFAULT_STAGE_DELAY_HOURS = 1;
export const SLEEPING_HOUR_CUTOFF = 21;
export const NEXT_DAY_START_HOUR = 9;

export function computeStageExecutionTime(
  occurredAt: Date,
  delayHours = DEFAULT_STAGE_DELAY_HOURS
): Date {
  const candidate = DateTime.fromJSDate(occurredAt, { zone: 'utc' })
    .setZone(ROME_TIMEZONE)
    .plus({ hours: delayHours });

  const cutoff = candidate.set({
    hour: SLEEPING_HOUR_CUTOFF,
    minute: 0,
    second: 0,
    millisecond: 0,
  });

  const runAtRome =
    candidate < cutoff
      ? candidate
      : candidate.plus({ days: 1 }).set({
          hour: NEXT_DAY_START_HOUR,
          minute: 0,
          second: 0,
          millisecond: 0,
        });

  return runAtRome.toUTC().toJSDate();
}
