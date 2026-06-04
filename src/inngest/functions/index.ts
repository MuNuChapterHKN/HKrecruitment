import { stageAApplicationReceipt } from './stage-a';
import { stageBInterviewBookingEmail } from './stage-b';
import { stageCSlotSelectedNotification } from './stage-c';
import { stageDCreateInterviewAssets } from './stage-d';

export const functions = [
  stageAApplicationReceipt,
  stageBInterviewBookingEmail,
  stageCSlotSelectedNotification,
  stageDCreateInterviewAssets,
];
