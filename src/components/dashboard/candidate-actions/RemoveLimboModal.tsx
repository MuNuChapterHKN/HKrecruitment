"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button } from "@/components";
import type { BaseModalProps } from "./types";

export interface RemoveLimboFormData {
  stageCode: string;
  reason: string;
}

export default function RemoveLimboModal({ onClose }: BaseModalProps) {
  const [formData, setFormData] = useState<RemoveLimboFormData>({
    stageCode: "",
    reason: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // TODO: Implement API call to remove candidate from limbo
    console.log("Removing candidate from limbo:", formData);

    onClose();
    setFormData({ stageCode: "", reason: "" });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Remove from Limbo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="stageCode" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Target stage
            </label>
            <select
              id="stageCode"
              value={formData.stageCode}
              onChange={(e) => setFormData({ ...formData, stageCode: e.target.value })}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
              required
            >
              <option value="">Select stage...</option>
              <option value="A">A - Pending Application Review</option>
              <option value="B">B - Awaiting</option>
              <option value="C">C - Approving Interview Booking</option>
              <option value="D">D - Awaiting Interview Result</option>
              <option value="E">E - Choosing Area or Rejection</option>
              <option value="F">F - Announce the Outcome</option>
            </select>
          </div>
          <div>
            <label htmlFor="reason" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Reason
            </label>
            <textarea
              id="reason"
              placeholder="Enter reason for moving from limbo..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              required
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Remove from Limbo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
