"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MultiSelect, type Option } from "@/components/ui/multi-select";

// Array temporaneo - sostituisci con import reale se esiste
const AREAS = ["software", "hardware", "network", "security", "ai/ml", "devops"];
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

interface ActionModalsProps {
  isOpen: boolean;
  modalType: string;
  onClose: () => void;
  onSubmit: (data: any) => void;
  candidateId: string;
}

export default function ActionModals({ isOpen, modalType, onClose, onSubmit, candidateId }: ActionModalsProps) {
  const [formData, setFormData] = useState({
    description: "",
    reportLink: "",
    area: "",
    stageCode: "",
    reason: "",
    interviewers: [] as string[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validazione per approve_interview
    if (modalType === "approve_interview" && formData.interviewers.length === 0) {
      alert("Please select at least one interviewer");
      return;
    }
    
    console.log("Submitting:", modalType, formData);
    onSubmit(formData);
    onClose();
    setFormData({
      description: "",
      reportLink: "",
      area: "",
      stageCode: "",
      reason: "",
      interviewers: []
    });
  };

  const renderModalContent = () => {
    switch (modalType) {
      case "approve_interview":
        return (
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
        );

      case "limbo":
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="description" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Description
              </label>
              <textarea
                id="description"
                placeholder="Enter reason for moving to limbo..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-yellow-600 hover:bg-yellow-700">
                Move to Limbo
              </Button>
            </DialogFooter>
          </form>
        );

      case "submit_report":
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="reportLink" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Report link
              </label>
              <Input
                id="reportLink"
                type="url"
                placeholder="https://example.com/report"
                value={formData.reportLink}
                onChange={(e) => setFormData({ ...formData, reportLink: e.target.value })}
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
        );

      case "assign_area":
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="area" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Select area
              </label>
              <select 
                id="area"
                value={formData.area} 
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
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
        );

      case "reject":
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="description" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Rejection reason
              </label>
              <textarea
                id="description"
                placeholder="Enter reason for rejection..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-red-600 hover:bg-red-700">
                Reject
              </Button>
            </DialogFooter>
          </form>
        );

      case "remove_limbo":
        return (
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
        );

      default:
        return null;
    }
  };

  const getModalTitle = () => {
    switch (modalType) {
      case "approve_interview": return "Approve Interview";
      case "limbo": return "Move to Limbo";
      case "submit_report": return "Submit Interview Report";
      case "assign_area": return "Assign to Area";
      case "reject": return "Reject";
      case "remove_limbo": return "Remove from Limbo";
      default: return "Action";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{getModalTitle()}</DialogTitle>
        </DialogHeader>
        {renderModalContent()}
      </DialogContent>
    </Dialog>
  );
}