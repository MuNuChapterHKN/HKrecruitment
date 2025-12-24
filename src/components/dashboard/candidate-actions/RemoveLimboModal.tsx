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
import { removeFromLimbo } from '@/lib/actions/applicants';

export interface RemoveLimboFormData {
  stageCode: string;
  reason: string;
}

export default function RemoveLimboModal({
  onClose,
  applicant,
}: BaseModalProps) {
  const [formData, setFormData] = useState<RemoveLimboFormData>({
    stageCode: '',
    reason: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!applicant) return;

    setIsSubmitting(true);

    try {
      const result = await removeFromLimbo(
        applicant.id,
        formData.stageCode,
        formData.reason
      );

      if (!result.success) {
        alert(result.error || 'Failed to remove from limbo');
        return;
      }

      onClose();
      setFormData({ stageCode: '', reason: '' });
    } catch (error) {
      console.error('Error removing from limbo:', error);
      alert('Failed to remove from limbo');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Remove from Limbo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="stageCode"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Target stage
            </label>
            <select
              id="stageCode"
              value={formData.stageCode}
              onChange={(e) =>
                setFormData({ ...formData, stageCode: e.target.value })
              }
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
              required
            >
              <option value="">Select stage...</option>
              <option value="a">A - Pending Application Review</option>
              <option value="b">B - Awaiting</option>
              <option value="c">C - Approving Interview Booking</option>
              <option value="d">D - Awaiting Interview Result</option>
              <option value="e">E - Choosing Area or Rejection</option>
              <option value="f">F - Announce the Outcome</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="reason"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Reason
            </label>
            <textarea
              id="reason"
              placeholder="Enter reason for moving from limbo..."
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              required
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Removing...' : 'Remove from Limbo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
