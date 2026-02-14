'use client';

import { TimeslotWithAvailability } from './page';
import { useState, useEffect } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { X, Calendar, Calendars } from 'lucide-react';
import { getMeetingLink } from '@/lib/utils';
import { AuthUserRole } from '@/lib/auth';

const WEEK_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const COLORS = {
  INTERVIEWER_IN_MEETING: 'text-blue-600',
  CELL_WITH_INTERVIEW: 'bg-blue-500 text-white',
};

type AggregatedAvailabilityTableProps = {
  timeslots: TimeslotWithAvailability[];
};

export function AggregatedAvailabilityTable({
  timeslots,
}: AggregatedAvailabilityTableProps) {
  const [hourLimits, setHourLimits] = useState<[number, number]>([9, 20]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [availableWeeks, setAvailableWeeks] = useState<number[]>([]);

  useEffect(() => {
    let minHour = +Infinity,
      maxHour = -Infinity;

    timeslots.forEach((ts) => {
      const h = ts.startingFrom.getHours();
      minHour = Math.min(minHour, h);
      maxHour = Math.max(maxHour, h);
    });

    setHourLimits([minHour, maxHour]);

    const today = new Date();
    const todayMonday = new Date(today);
    todayMonday.setDate(today.getDate() - today.getDay() + 1);
    todayMonday.setHours(0, 0, 0, 0);

    const weekOffsets = new Set<number>();
    timeslots.forEach((ts) => {
      const tsDate = new Date(ts.startingFrom);
      const tsMonday = new Date(tsDate);
      tsMonday.setDate(tsDate.getDate() - tsDate.getDay() + 1);
      tsMonday.setHours(0, 0, 0, 0);

      const weekDiff = Math.floor(
        (tsMonday.getTime() - todayMonday.getTime()) / (7 * 24 * 60 * 60 * 1000)
      );
      weekOffsets.add(weekDiff);
    });

    const sortedWeeks = Array.from(weekOffsets).sort((a, b) => a - b);
    setAvailableWeeks(sortedWeeks);

    if (sortedWeeks.length > 0 && !sortedWeeks.includes(weekOffset)) {
      setWeekOffset(sortedWeeks[0]);
    }
  }, [timeslots, weekOffset]);

  const hours = Array.from(
    { length: hourLimits[1] - hourLimits[0] + 1 },
    (_, i) => hourLimits[0] + i
  );

  const today = new Date();
  const currentMonday = new Date(today);
  currentMonday.setDate(today.getDate() - today.getDay() + 1 + weekOffset * 7);

  const weekDates = WEEK_DAYS.map((_, index) => {
    const date = new Date(currentMonday);
    date.setDate(currentMonday.getDate() + index);
    return date;
  });

  const timeslotMap = new Map<string, TimeslotWithAvailability>();
  timeslots.forEach((ts) => {
    const dateStr = ts.startingFrom.toISOString().split('T')[0];
    const hour = ts.startingFrom.getHours();
    const key = `${dateStr}-${hour}`;
    timeslotMap.set(key, ts);
  });

  function goToPreviousWeek() {
    const currentIndex = availableWeeks.indexOf(weekOffset);
    if (currentIndex > 0) {
      setWeekOffset(availableWeeks[currentIndex - 1]);
    }
  }

  function goToNextWeek() {
    const currentIndex = availableWeeks.indexOf(weekOffset);
    if (currentIndex < availableWeeks.length - 1) {
      setWeekOffset(availableWeeks[currentIndex + 1]);
    }
  }

  const canGoPrevious = availableWeeks.indexOf(weekOffset) > 0;
  const canGoNext =
    availableWeeks.indexOf(weekOffset) < availableWeeks.length - 1;

  const availabilityCounts = new Map<string, number>();
  const availabilityNames = new Map<string, string>();
  timeslots.forEach((timeslot) => {
    timeslot.submittedUsers.forEach((user) => {
      if (user.role !== AuthUserRole.Clerk) return;
      availabilityNames.set(user.id, user.name);
      availabilityCounts.set(
        user.id,
        (availabilityCounts.get(user.id) ?? 0) + 1
      );
    });
  });

  const interviewCounts = new Map<string, number>();
  const interviewNames = new Map<string, string>();
  timeslots.forEach((timeslot) => {
    timeslot.interviews.forEach((interview) => {
      interview.interviewers.forEach((name) => {
        if (name.role !== AuthUserRole.Clerk) return;
        interviewNames.set(name.id, name.name);
        interviewCounts.set(name.id, (interviewCounts.get(name.id) ?? 0) + 1);
      });
    });
  });

  const recruiterIds = new Set<string>();
  availabilityCounts.forEach((_, id) => recruiterIds.add(id));
  interviewCounts.forEach((_, id) => recruiterIds.add(id));

  const recruiterAvailability = Array.from(recruiterIds)
    .map((id) => ({
      id,
      name: availabilityNames.get(id) ?? interviewNames.get(id) ?? 'Unknown',
      availabilityCount: availabilityCounts.get(id) ?? 0,
      interviewCount: interviewCounts.get(id) ?? 0,
    }))
    .sort(
      (a, b) =>
        b.availabilityCount - a.availabilityCount ||
        b.interviewCount - a.interviewCount ||
        a.name.localeCompare(b.name)
    );

  return (
    <TooltipProvider>
      <div className="space-y-2 w-full">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
          <button
            onClick={goToPreviousWeek}
            disabled={!canGoPrevious}
            className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed text-base sm:text-lg"
            aria-label="Previous week"
          >
            ←
          </button>
          <span className="text-sm font-medium min-w-[200px] text-center whitespace-nowrap px-2">
            {weekDates[0].toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}{' '}
            -{' '}
            {weekDates[6].toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
          <button
            onClick={goToNextWeek}
            disabled={!canGoNext}
            className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed text-base sm:text-lg"
            aria-label="Next week"
          >
            →
          </button>
        </div>

        <div className="space-y-3 sm:hidden">
          {WEEK_DAYS.map((day, dayIndex) => {
            const weekDate = weekDates[dayIndex];
            const dateStr = weekDate.toISOString().split('T')[0];

            return (
              <div key={day} className="rounded-md border">
                <div className="flex items-center justify-between border-b px-3 py-2 text-sm font-medium">
                  <span>{day}</span>
                  <span className="text-xs text-gray-500">
                    {weekDate.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="divide-y">
                  {hours.map((hour) => {
                    const cellKey = `${dateStr}-${hour}`;
                    const timeslot = timeslotMap.get(cellKey);

                    if (!timeslot) {
                      return (
                        <div
                          key={cellKey}
                          className="flex items-center justify-between px-3 py-2 text-sm"
                        >
                          <span className="text-gray-600">
                            {hour.toString().padStart(2, '0')}:00
                          </span>
                          <span className="text-gray-400">-</span>
                        </div>
                      );
                    }

                    const experiencedUsers =
                      timeslot.totalUsers - timeslot.firstTimeUsers;
                    const isValid =
                      timeslot.totalUsers >= 2 &&
                      experiencedUsers >= timeslot.firstTimeUsers;
                    const cellColor = isValid
                      ? 'bg-green-500 text-white'
                      : 'bg-red-400 text-white';

                    const interviewerNamesInMeeting = new Set<string>();
                    timeslot.interviews.forEach((interview) => {
                      interview.interviewers.forEach((interviewer) =>
                        interviewerNamesInMeeting.add(interviewer.name)
                      );
                    });

                    const tooltipContent = (
                      <div className="space-y-1">
                        {timeslot.userNames.map((name) => {
                          const isFirstTime =
                            timeslot.firstTimeUserNames.includes(name);
                          const isInMeeting =
                            interviewerNamesInMeeting.has(name);
                          return (
                            <div
                              key={name}
                              className={
                                isInMeeting ? COLORS.INTERVIEWER_IN_MEETING : ''
                              }
                            >
                              {isFirstTime ? <strong>{name}</strong> : name}
                            </div>
                          );
                        })}
                      </div>
                    );

                    const interviewsTooltip = timeslot.interviews.length >
                      0 && (
                      <div className="space-y-4 min-w-[250px]">
                        {timeslot.interviews.map((interview, idx) => (
                          <div key={idx} className="space-y-3">
                            {idx > 0 && <hr className="border-gray-600" />}
                            <div className="space-y-2">
                              <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                Interview{' '}
                                {timeslot.interviews.length > 1
                                  ? `#${idx + 1}`
                                  : ''}
                              </div>
                              <div className="space-y-2">
                                <div>
                                  <div className="text-xs text-gray-400 mb-0.5">
                                    Applicant
                                  </div>
                                  <div className="font-semibold text-base text-white">
                                    {interview.applicant.name}{' '}
                                    {interview.applicant.surname}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-400 mb-0.5">
                                    Interviewers
                                  </div>
                                  <div className="space-y-0.5">
                                    {interview.interviewers.map(
                                      (interviewer) => (
                                        <div
                                          key={interviewer.id}
                                          className="text-sm text-gray-200"
                                        >
                                          {interviewer.name}
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              </div>
                              {interview.meetingId && (
                                <a
                                  href={getMeetingLink(interview.meetingId)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-block mt-2 text-xs font-medium bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition-colors"
                                >
                                  Join Meeting
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    );

                    return (
                      <div
                        key={cellKey}
                        className={`flex items-center justify-between px-3 py-2 text-sm ${
                          timeslot.totalUsers > 0
                            ? cellColor
                            : timeslot.interviews.length > 0
                              ? COLORS.CELL_WITH_INTERVIEW
                              : 'bg-white'
                        }`}
                      >
                        <span className="font-medium">
                          {hour.toString().padStart(2, '0')}:00
                        </span>
                        <div className="flex items-center gap-2">
                          {timeslot.totalUsers === 0 &&
                          timeslot.interviews.length === 0 ? (
                            <X className="w-4 h-4 text-gray-400" />
                          ) : null}
                          {timeslot.totalUsers > 0 && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="cursor-help">
                                  {timeslot.totalUsers}
                                  {timeslot.firstTimeUsers > 0
                                    ? ` (${timeslot.firstTimeUsers})`
                                    : ''}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>{tooltipContent}</TooltipContent>
                            </Tooltip>
                          )}
                          {timeslot.interviews.length > 0 && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="cursor-pointer">
                                  {timeslot.interviews.length === 1 ? (
                                    <Calendar className="w-4 h-4" />
                                  ) : (
                                    <Calendars className="w-4 h-4" />
                                  )}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                {interviewsTooltip}
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="hidden sm:block w-full overflow-x-auto">
          <table className="border text-xs sm:text-sm w-full min-w-[820px] table-fixed">
            <thead>
              <tr>
                <th className="p-1.5 sm:p-2 border whitespace-nowrap">Hour</th>
                {WEEK_DAYS.map((day, index) => (
                  <th className="p-1.5 sm:p-2 border" key={day}>
                    <div>{day}</div>
                    <div className="text-[11px] sm:text-xs font-normal text-gray-500">
                      {weekDates[index].toLocaleDateString('en-US', {
                        month: 'numeric',
                        day: 'numeric',
                      })}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hours.map((hour) => (
                <tr key={hour}>
                  <td className="p-1.5 sm:p-2 border whitespace-nowrap">
                    {hour.toString().padStart(2, '0')}:00
                  </td>
                  {WEEK_DAYS.map((_, dayIndex) => {
                    const weekDate = weekDates[dayIndex];
                    const dateStr = weekDate.toISOString().split('T')[0];
                    const cellKey = `${dateStr}-${hour}`;
                    const timeslot = timeslotMap.get(cellKey);

                    if (!timeslot) {
                      return (
                        <td
                          key={cellKey}
                          className="border bg-gray-100 text-center"
                        >
                          -
                        </td>
                      );
                    }

                    const experiencedUsers =
                      timeslot.totalUsers - timeslot.firstTimeUsers;
                    const isValid =
                      timeslot.totalUsers >= 2 &&
                      experiencedUsers >= timeslot.firstTimeUsers;
                    const cellColor = isValid
                      ? 'bg-green-500 text-white'
                      : 'bg-red-400 text-white';

                    const interviewerNamesInMeeting = new Set<string>();
                    timeslot.interviews.forEach((interview) => {
                      interview.interviewers.forEach((interviewer) =>
                        interviewerNamesInMeeting.add(interviewer.name)
                      );
                    });

                    const tooltipContent = (
                      <div className="space-y-1">
                        {timeslot.userNames.map((name) => {
                          const isFirstTime =
                            timeslot.firstTimeUserNames.includes(name);
                          const isInMeeting =
                            interviewerNamesInMeeting.has(name);
                          return (
                            <div
                              key={name}
                              className={
                                isInMeeting ? COLORS.INTERVIEWER_IN_MEETING : ''
                              }
                            >
                              {isFirstTime ? <strong>{name}</strong> : name}
                            </div>
                          );
                        })}
                      </div>
                    );

                    if (timeslot.totalUsers === 0) {
                      if (timeslot.interviews.length === 0) {
                        return (
                          <td
                            key={cellKey}
                            className="border text-center p-1.5 sm:p-2 bg-white"
                          >
                            <X className="w-4 h-4 mx-auto text-gray-400" />
                          </td>
                        );
                      }
                    }

                    const interviewsTooltip = timeslot.interviews.length >
                      0 && (
                      <div className="space-y-4 min-w-[250px]">
                        {timeslot.interviews.map((interview, idx) => (
                          <div key={idx} className="space-y-3">
                            {idx > 0 && <hr className="border-gray-600" />}
                            <div className="space-y-2">
                              <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                Interview{' '}
                                {timeslot.interviews.length > 1
                                  ? `#${idx + 1}`
                                  : ''}
                              </div>
                              <div className="space-y-2">
                                <div>
                                  <div className="text-xs text-gray-400 mb-0.5">
                                    Applicant
                                  </div>
                                  <div className="font-semibold text-base text-white">
                                    {interview.applicant.name}{' '}
                                    {interview.applicant.surname}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-400 mb-0.5">
                                    Interviewers
                                  </div>
                                  <div className="space-y-0.5">
                                    {interview.interviewers.map(
                                      (interviewer) => (
                                        <div
                                          key={interviewer.id}
                                          className="text-sm text-gray-200"
                                        >
                                          {interviewer.name}
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              </div>
                              {interview.meetingId && (
                                <a
                                  href={getMeetingLink(interview.meetingId)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-block mt-2 text-xs font-medium bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition-colors"
                                >
                                  Join Meeting
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    );

                    return (
                      <td
                        key={cellKey}
                        className={`border text-center p-1.5 sm:p-2 ${timeslot.totalUsers > 0 ? cellColor : timeslot.interviews.length > 0 ? COLORS.CELL_WITH_INTERVIEW : 'bg-white'}`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          {timeslot.totalUsers > 0 && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="cursor-help">
                                  {timeslot.totalUsers}
                                  {timeslot.firstTimeUsers > 0
                                    ? ` (${timeslot.firstTimeUsers})`
                                    : ''}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>{tooltipContent}</TooltipContent>
                            </Tooltip>
                          )}
                          {timeslot.interviews.length > 0 && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="cursor-pointer">
                                  {timeslot.interviews.length === 1 ? (
                                    <Calendar className="w-4 h-4" />
                                  ) : (
                                    <Calendars className="w-4 h-4" />
                                  )}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                {interviewsTooltip}
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pt-4">
          <h2 className="text-sm font-semibold">Recruiter availability</h2>
          <p className="text-xs text-muted-foreground">
            Total availability counts for this session
          </p>
          <div className="mt-3 w-full overflow-x-auto">
            <table className="w-full min-w-[360px] border text-sm">
              <thead>
                <tr className="bg-muted/30">
                  <th className="p-2 text-left font-medium">Recruiter</th>
                  <th className="p-2 text-right font-medium">Availabilities</th>
                  <th className="p-2 text-right font-medium">Interviews</th>
                </tr>
              </thead>
              <tbody>
                {recruiterAvailability.map((item) => (
                  <tr key={item.name} className="border-t">
                    <td className="p-2">{item.name}</td>
                    <td className="p-2 text-right font-semibold">
                      {item.availabilityCount}
                    </td>
                    <td className="p-2 text-right font-semibold">
                      {item.interviewCount}
                    </td>
                  </tr>
                ))}
                {recruiterAvailability.length === 0 && (
                  <tr>
                    <td
                      className="p-3 text-center text-muted-foreground"
                      colSpan={3}
                    >
                      No availability data.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
