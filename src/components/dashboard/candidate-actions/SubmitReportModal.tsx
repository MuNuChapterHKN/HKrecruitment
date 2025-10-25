'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Input,
} from '@/components';
import type { BaseModalProps } from './types';

export interface ReportFormData {
  reportLink: string;
}

export default function SubmitReportModal({ onClose }: BaseModalProps) {
  const [formData, setFormData] = useState<ReportFormData>({
    reportLink: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // TODO: Implement API call to submit interview report
    console.log('Submitting interview report:', formData);

    onClose();
    setFormData({ reportLink: '' });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Submit Interview Report</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="reportLink"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Report link
            </label>
            <Input
              id="reportLink"
              type="url"
              placeholder="https://example.com/report"
              value={formData.reportLink}
              onChange={(e) =>
                setFormData({ ...formData, reportLink: e.target.value })
              }
              required
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
              Submit Interview Report
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
