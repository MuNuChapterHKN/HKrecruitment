import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalize(a: string) {
  return a.charAt(0).toUpperCase() + a.slice(1);
}

export function getMeetingLink(meetingId: string) {
  return `https://meet.google.com/${meetingId}`;
}
