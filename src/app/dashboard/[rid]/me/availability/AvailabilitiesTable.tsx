'use client';

import { TimeslotPeek } from './page';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
const Calendar = dynamic(
  () => import('lucide-react').then((mod) => ({ default: mod.Calendar })),
  { ssr: false }
);
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const WEEK_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

type AvailabilitiesTableProps = {
  timeslots: TimeslotPeek[];
  onSelectionChange?: (slots: TimeslotPeek[]) => void;
  maxSelections?: number;
};

export function AvailabilitiesTable({
  timeslots: initialTimeslots,
  onSelectionChange,
  maxSelections,
}: AvailabilitiesTableProps) {
  const [timeslots, setTimeslots] = useState<TimeslotPeek[]>(initialTimeslots);
  const [hourLimits, setHourLimits] = useState<[number, number]>([9, 20]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [availableWeeks, setAvailableWeeks] = useState<number[]>([]);

  useEffect(() => {
    setTimeslots(initialTimeslots);
  }, [initialTimeslots]);

  useEffect(() => {
    if (!onSelectionChange) return;
    onSelectionChange(timeslots);
  }, [timeslots, onSelectionChange]);

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

  function toggleSlot(timeslotId: string) {
    setTimeslots((prev) => {
      const clickedSlot = prev.find((ts) => ts.id === timeslotId);

      if (!clickedSlot || clickedSlot.locked) return prev;

      const activeCount = prev.filter((ts) => ts.active).length;

      if (clickedSlot.active) {
        return prev.map((ts) =>
          ts.id === timeslotId ? { ...ts, active: false } : ts
        );
      }

      if (maxSelections !== undefined && activeCount >= maxSelections) {
        if (maxSelections === 1) {
          return prev.map((ts) =>
            ts.id === timeslotId
              ? { ...ts, active: true }
              : { ...ts, active: false }
          );
        }
        return prev;
      }

      return prev.map((ts) =>
        ts.id === timeslotId ? { ...ts, active: true } : ts
      );
    });
  }

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

  const timeslotMap = new Map<string, TimeslotPeek>();
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

  return (
    <TooltipProvider>
      <div className="space-y-2 w-full">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={goToPreviousWeek}
            disabled={!canGoPrevious}
            className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed text-lg"
            aria-label="Previous week"
          >
            ←
          </button>
          <span className="text-sm font-medium min-w-[200px] text-center">
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
            className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed text-lg"
            aria-label="Next week"
          >
            →
          </button>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="border text-sm min-w-[700px] md:min-w-full table-fixed">
            <thead>
              <tr>
                <th className="p-2 border min-w-[60px]">Hour</th>
                {WEEK_DAYS.map((day, index) => (
                  <th className="p-2 border min-w-[110px]" key={day}>
                    <div>{day}</div>
                    <div className="text-xs font-normal text-gray-500">
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
                  <td className="p-2 border min-w-[60px]">
                    {hour.toString().padStart(2, '0')}:00
                  </td>
                  {WEEK_DAYS.map((day, dayIndex) => {
                    const weekDate = weekDates[dayIndex];
                    const dateStr = weekDate.toISOString().split('T')[0];
                    const cellKey = `${dateStr}-${hour}`;
                    const timeslot = timeslotMap.get(cellKey);

                    if (!timeslot) {
                      return (
                        <td
                          key={cellKey}
                          className="border bg-gray-100 text-center min-w-[110px]"
                        >
                          -
                        </td>
                      );
                    }

                    return (
                      <td
                        key={cellKey}
                        onClick={() =>
                          !timeslot.locked && toggleSlot(timeslot.id)
                        }
                        className={`border text-center min-w-[110px]
                        ${timeslot.locked ? 'bg-blue-500 text-white cursor-not-allowed' : timeslot.active ? 'bg-green-500 text-white cursor-pointer' : 'bg-white hover:bg-gray-100 cursor-pointer'}`}
                      >
                        {timeslot.locked ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center justify-center">
                                <Calendar className="w-4 h-4" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              Non puoi cambiare la disponibilità per questo
                              timeslot, hai già un meeting fissato
                            </TooltipContent>
                          </Tooltip>
                        ) : timeslot.active ? (
                          '✓'
                        ) : (
                          ''
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </TooltipProvider>
  );
}
