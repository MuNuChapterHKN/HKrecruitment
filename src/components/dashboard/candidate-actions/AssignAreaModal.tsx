'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components';
import { AREAS } from '@/db/schema';
import { areaLabels } from '@/lib/areas';
import { assignArea } from '@/lib/actions/applicants';
import type { BaseModalProps } from './types';

export interface AreaFormData {
  area: string;
}

export default function AssignAreaModal({
  applicant,
  onClose,
}: BaseModalProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<AreaFormData>({
    area: applicant?.chosenArea ?? '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!applicant) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await assignArea(applicant.id, formData.area);

      if (!result.success) {
        setError(result.error || 'Failed to assign area');
        return;
      }

      onClose();
      router.refresh();
    } catch (error) {
      console.error('Error assigning area:', error);
      setError('Failed to assign area');
    } finally {
      setIsSubmitting(false);
    }
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
            <Select
              value={formData.area}
              onValueChange={(value) =>
                setFormData({ ...formData, area: value })
              }
            >
              <SelectTrigger id="area" className="w-full mt-2">
                <SelectValue placeholder="Choose an area..." />
              </SelectTrigger>
              <SelectContent>
                {AREAS.map((area) => (
                  <SelectItem key={area} value={area}>
                    {areaLabels[area]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700"
              disabled={isSubmitting || !formData.area}
            >
              {isSubmitting ? 'Assigning...' : 'Assign to Area'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
