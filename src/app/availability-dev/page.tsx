'use client';

import { AvailabilitiesTable } from '@/components/dashboard/availability/AvailabilitiesTable';

export default function Page() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-6">Availability DEV</h1>
      <AvailabilitiesTable />
    </div>
  );
}
