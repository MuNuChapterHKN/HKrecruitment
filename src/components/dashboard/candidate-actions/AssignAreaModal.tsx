'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
} from '@/components';
import type { BaseModalProps } from './types';

export interface AreaFormData {
  area: string;
}

const AREAS = [
  'software',
  'hardware',
  'network',
  'security',
  'ai/ml',
  'devops',
];

export default function AssignAreaModal({ onClose }: BaseModalProps) {
  const [formData, setFormData] = useState<AreaFormData>({
    area: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // TODO: Implement API call to assign candidate to area
    console.log('Assigning candidate to area:', formData);

    onClose();
    setFormData({ area: '' });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign to Area</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="area"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Select area
            </label>
            <select
              id="area"
              value={formData.area}
              onChange={(e) =>
                setFormData({ ...formData, area: e.target.value })
              }
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
              required
            >
              <option value="">Choose an area...</option>
              {AREAS.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              Assign to Area
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
