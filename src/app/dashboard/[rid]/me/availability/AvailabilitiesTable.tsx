'use client';

import { TimeslotPeek } from './page';
import { useState, useEffect } from 'react';

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
};

export function AvailabilitiesTable({
  timeslots: initialTimeslots,
  onSelectionChange,
}: AvailabilitiesTableProps) {
  const [timeslots, setTimeslots] = useState<TimeslotPeek[]>(initialTimeslots);
  const [hourLimits, setHourLimits] = useState<[number, number]>([9, 20]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [availableWeeks, setAvailableWeeks] = useState<number[]>([]);

  // Initialize timeslots from props
  useEffect(() => {
    setTimeslots(initialTimeslots);
  }, [initialTimeslots]);

  // Notify parent of changes
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
  }, [timeslots]);

  function toggleSlot(timeslotId: string) {
    setTimeslots((prev) =>
      prev.map((ts) =>
        ts.id === timeslotId ? { ...ts, active: !ts.active } : ts
      )
    );
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

      <table className="border text-sm w-full table-fixed">
        <thead>
          <tr>
            <th className="p-2 border">Hour</th>
            {WEEK_DAYS.map((day, index) => (
              <th className="p-2 border" key={day}>
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
              <td className="p-2 border">
                {hour.toString().padStart(2, '0')}:00
              </td>
              {WEEK_DAYS.map((day, dayIndex) => {
                const weekDate = weekDates[dayIndex];
                const dateStr = weekDate.toISOString().split('T')[0];
                const key = `${dateStr}-${hour}`;
                const timeslot = timeslotMap.get(key);

                if (!timeslot) {
                  return (
                    <td key={key} className="border bg-gray-100 text-center">
                      -
                    </td>
                  );
                }

                return (
                  <td
                    key={key}
                    onClick={() => toggleSlot(timeslot.id)}
                    className={`cursor-pointer border text-center
                    ${timeslot.active ? 'bg-green-500 text-white' : 'bg-white hover:bg-gray-100'}`}
                  >
                    {timeslot.active ? '✓' : ''}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
