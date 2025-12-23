'use client';

import { useState, useEffect } from 'react';

export type SelectedSlot = { day: string; hour: string };

type AvailabilitiesTableProps = {
  onSelectionChange?: (slots: SelectedSlot[]) => void;
};

export function AvailabilitiesTable({
  onSelectionChange,
}: AvailabilitiesTableProps) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const days = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const hours = Array.from(
    { length: 13 },
    (_, i) => `${(i + 8).toString().padStart(2, '0')}:00`
  );

  // 🔥 FIX: Notifica delle selezioni fuori dal render
  useEffect(() => {
    if (!onSelectionChange) return;

    const slots: SelectedSlot[] = Object.entries(selected)
      .filter(([_, active]) => active)
      .map(([key]) => {
        const [day, hour] = key.split('-');
        return { day, hour };
      });

    onSelectionChange(slots);
  }, [selected]);

  function toggleSlot(day: string, hour: string) {
    const key = `${day}-${hour}`;

    setSelected((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  return (
    <table className="border text-sm w-full max-w-4xl">
      <thead>
        <tr>
          <th className="p-2 border">Hour</th>
          {days.map((d) => (
            <th className="p-2 border" key={d}>
              {d}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {hours.map((hour) => (
          <tr key={hour}>
            <td className="p-2 border">{hour}</td>
            {days.map((day) => {
              const key = `${day}-${hour}`;
              const active = selected[key];

              return (
                <td
                  key={key}
                  onClick={() => toggleSlot(day, hour)}
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
  );
}
