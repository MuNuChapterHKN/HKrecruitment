'use client';

import { AvailabilitiesTable } from '@/components/dashboard/availability/availabilitiesTable';

export default function Page() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-6">Availability</h1>
      <AvailabilitiesTable />
    </div>
  );
}
