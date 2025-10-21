"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, MultiSelect, type Option } from "@/components";
import type { BaseModalProps } from "./types";

export interface InterviewFormData {
  interviewers: string[];
}

const INTERVIEWERS: Option[] = [
  { value: "john_doe", label: "John Doe" },
  { value: "jane_smith", label: "Jane Smith" },
  { value: "alex_johnson", label: "Alex Johnson" },
  { value: "maria_garcia", label: "Maria Garcia" },
  { value: "david_chen", label: "David Chen" },
  { value: "sarah_wilson", label: "Sarah Wilson" },
  { value: "mike_brown", label: "Mike Brown" },
  { value: "lisa_davis", label: "Lisa Davis" },
];

export default function ApproveInterviewModal({ onClose }: BaseModalProps) {
  const [formData, setFormData] = useState<InterviewFormData>({
    interviewers: []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.interviewers.length === 0) {
      alert("Please select at least one interviewer");
      return;
    }

    // TODO: Implement API call to approve interview with selected interviewers
    console.log("Approving interview with interviewers:", formData.interviewers);

    onClose();
    setFormData({ interviewers: [] });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Approve Interview</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-2">
              Select Interviewers
            </label>
            <MultiSelect
              options={INTERVIEWERS}
              onValueChange={(values) => {
                console.log("Interviewers selected:", values);
                setFormData({ ...formData, interviewers: values });
              }}
              defaultValue={formData.interviewers}
              placeholder="Choose interviewers..."
              maxCount={2}
            />
            {formData.interviewers.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {formData.interviewers.length} interviewer{formData.interviewers.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Approve Interview
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
