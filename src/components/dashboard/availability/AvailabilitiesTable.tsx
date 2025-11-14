'use client';

/*
 * Calendar Availabilities Component — Clean & Readable Version
 * ------------------------------------------------------------
 * - Mostra una tabella con ore (08:00 → 20:00) e giorni (Mon → Sat)
 * - Ogni cella è cliccabile per segnare la disponibilità
 * - Nessun accesso al database (richiesta Issue #7)
 * - Stato gestito unicamente sul client tramite useState
 */

import { useState } from 'react';

// -------------------------------------------------------------
// Tipi utili
// -------------------------------------------------------------

// Giorni validi della settimana
export type Day =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday';

// Lista dei giorni in ordine
const days: Day[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

// Mappa degli slot selezionati (es. { "Monday-09:00": true })
type SelectionMap = Record<string, boolean>;

// -------------------------------------------------------------
// Funzione di supporto: genera ore in formato "HH:00"
// -------------------------------------------------------------
function generateHours(start: number, end: number): string[] {
  const result: string[] = [];

  for (let hour = start; hour <= end; hour++) {
    const formatted = hour.toString().padStart(2, '0') + ':00';
    result.push(formatted);
  }

  return result;
}

// -------------------------------------------------------------
// Componente principale
// -------------------------------------------------------------
export function AvailabilitiesTable() {
  // Ore da visualizzare nella tabella
  const hours = generateHours(8, 20);

  // Stato locale degli slot selezionati
  const [selected, setSelected] = useState<SelectionMap>({});

  // -------------------------------------------------------------
  // Gestisce click su una cella (toggle)
  // -------------------------------------------------------------
  function toggleSlot(day: Day, hour: string) {
    const key = `${day}-${hour}`;

    setSelected((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  // -------------------------------------------------------------
  // Restituisce gli slot selezionati in formato strutturato
  // Utile per debug o integrazione futura con backend
  // -------------------------------------------------------------
  function getSelectedSlots() {
    return Object.entries(selected)
      .filter(([_, active]) => active)
      .map(([key]) => {
        const [day, hour] = key.split('-');
        return { day: day as Day, hour };
      });
  }

  // -------------------------------------------------------------
  // Render UI
  // -------------------------------------------------------------
  return (
    <div className="flex justify-center mt-6">
      <div className="border rounded-lg p-3 bg-white shadow-sm w-full max-w-4xl">
        <h2 className="text-center text-base font-semibold mb-3">
          Your Availability
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            {/* Header tabella */}
            <thead>
              <tr className="bg-gray-100 text-center text-[12px]">
                <th className="p-1 border">Hour</th>

                {days.map((day) => (
                  <th key={day} className="p-1 border font-medium">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Corpo tabella */}
            <tbody>
              {hours.map((hour) => (
                <tr key={hour} className="border-t">
                  {/* Colonna delle ore */}
                  <td className="p-1 border font-medium bg-gray-50 text-center text-[12px]">
                    {hour}
                  </td>

                  {/* Celle giorno/ora */}
                  {days.map((day) => {
                    const key = `${day}-${hour}`;
                    const isActive = selected[key] === true;

                    return (
                      <td
                        key={key}
                        onClick={() => toggleSlot(day, hour)}
                        className={`
                          p-1 border cursor-pointer text-center text-[12px]
                          transition-all select-none rounded-sm
                          ${
                            isActive
                              ? 'bg-green-500 text-white'
                              : 'bg-white hover:bg-gray-100'
                          }
                        `}
                      >
                        {isActive ? '✓' : ''}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pulsante di debug (non influisce sulla logica) */}
        <button
          onClick={() => console.log(getSelectedSlots())}
          className="mx-auto mt-4 px-3 py-1 bg-blue-600 text-white rounded-md block text-xs"
        >
          Log Selected Slots
        </button>
      </div>
    </div>
  );
}
