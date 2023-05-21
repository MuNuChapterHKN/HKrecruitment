import { TimeSlot } from "timeslot";

export enum SlotState {
  Free = "free",
  Assigned = "assigned",
  Rejected = "rejected",
  Reserved = "reserved",
}

export interface Slot {
  state: SlotState;
  timeSlot: TimeSlot;
  calendarId?: string;
}

/* Validation schemas */
