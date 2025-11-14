import { atom } from 'jotai';

export type AvailabilitySlot = {
  id: string;
  date: string;
  time: string;
};

export const availabilityAtom = atom<AvailabilitySlot[]>([]);
