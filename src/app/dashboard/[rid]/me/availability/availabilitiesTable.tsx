'use client';

import { Timeslot } from '@/db/types';
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
  timeslots: Timeslot[];
  onSelectionChange?: (slots: Timeslot[]) => void;
};

export function AvailabilitiesTable({
  timeslots,
  onSelectionChange,
}: AvailabilitiesTableProps) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [hourLimits, setHourLimits] = useState<[number, number]>([9, 20]);
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    if (!onSelectionChange) return;

    const slots: Timeslot[] = timeslots.filter((ts) => selected[ts.id]);
    onSelectionChange(slots);
  }, [selected, timeslots, onSelectionChange]);

  useEffect(() => {
    let minHour = +Infinity,
      maxHour = -Infinity;

    timeslots.forEach((ts) => {
      const h = ts.startingFrom.getHours();
      minHour = Math.min(minHour, h);
      maxHour = Math.max(maxHour, h);
    });

    console.log(minHour, maxHour);
    setHourLimits([minHour, maxHour]);
  }, [timeslots]);

  function toggleSlot(key: string) {
    setSelected((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
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

  const timeslotMap = new Map<string, Timeslot>();
  timeslots.forEach((ts) => {
    const dateStr = ts.startingFrom.toISOString().split('T')[0];
    const hour = ts.startingFrom.getHours();
    const key = `${dateStr}-${hour}`;
    timeslotMap.set(key, ts);
  });

  function goToPreviousWeek() {
    setWeekOffset((prev) => prev - 1);
  }

  function goToNextWeek() {
    setWeekOffset((prev) => prev + 1);
  }

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-center gap-4 w-full">
        <button
          onClick={goToPreviousWeek}
          className="p-2 hover:bg-gray-100 rounded"
          aria-label="Previous week"
        >
          ←
        </button>
        <span className="font-medium">
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
          className="p-2 hover:bg-gray-100 rounded"
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

                const active = selected[timeslot.id];

                return (
                  <td
                    key={key}
                    onClick={() => toggleSlot(timeslot.id)}
                    className={`cursor-pointer border text-center
                    ${active ? 'bg-green-500 text-white' : 'bg-white hover:bg-gray-100'}`}
                  >
                    {active ? '✓' : ''}
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
