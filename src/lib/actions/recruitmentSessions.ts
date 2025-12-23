'use server';

import { db, schema } from '@/db';
import { nanoid } from 'nanoid';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const createRecruitmentSessionSchema = z
  .object({
    year: z.coerce
      .number()
      .int('Year must be an integer')
      .min(2000, 'Year must be at least 2000')
      .max(3000, 'Year must be at most 3000'),
    semester: z.coerce
      .number()
      .int('Semester must be an integer')
      .min(1, 'Semester must be at least 1')
      .max(10, 'Semester must be at most 10'),
    start_date: z.coerce.date({ message: 'Invalid start date' }),
    end_date: z.coerce.date({ message: 'Invalid end date' }),
    startHour: z.coerce
      .number()
      .int('Start hour must be an integer')
      .min(0, 'Start hour must be at least 0')
      .max(23, 'Start hour must be at most 23')
      .default(9),
    endHour: z.coerce
      .number()
      .int('End hour must be an integer')
      .min(0, 'End hour must be at least 0')
      .max(23, 'End hour must be at most 23')
      .default(20),
  })
  .refine((data) => data.start_date < data.end_date, {
    message: 'Start date must be before end date',
    path: ['end_date'],
  })
  .refine((data) => data.startHour < data.endHour, {
    message: 'Start hour must be before end hour',
    path: ['endHour'],
  });

function generateTimeslots(
  recruitingSessionId: string,
  startDate: Date,
  endDate: Date,
  startHour: number,
  endHour: number
) {
  const timeslots = [];
  const currentDate = new Date(startDate);
  currentDate.setHours(0, 0, 0, 0);

  const finalDate = new Date(endDate);
  finalDate.setHours(0, 0, 0, 0);

  while (currentDate <= finalDate) {
    for (let hour = startHour; hour <= endHour; hour++) {
      const timeslotDate = new Date(currentDate);
      timeslotDate.setHours(hour, 0, 0, 0);

      timeslots.push({
        id: nanoid(),
        recruitingSessionId,
        startingFrom: timeslotDate,
      });
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return timeslots;
}

export async function createRecruitmentSession(
  formData: FormData,
  startHour?: number,
  endHour?: number
) {
  try {
    const rawData = {
      year: formData.get('year'),
      semester: formData.get('semester'),
      start_date: formData.get('start_date'),
      end_date: formData.get('end_date'),
      startHour,
      endHour,
    };

    const validatedData = createRecruitmentSessionSchema.parse(rawData);

    const id = nanoid();

    await db.insert(schema.recruitingSession).values({
      id,
      year: validatedData.year,
      semester: validatedData.semester,
      start_date: validatedData.start_date,
      end_date: validatedData.end_date,
    });

    const timeslots = generateTimeslots(
      id,
      validatedData.start_date,
      validatedData.end_date,
      validatedData.startHour,
      validatedData.endHour
    );

    if (timeslots.length > 0) {
      await db.insert(schema.timeslot).values(timeslots);
    }

    revalidatePath('/dashboard/[rid]/recruitments');

    return { success: true, id };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return { success: false, error: firstError.message };
    }

    console.error('Error creating recruitment session:', error);
    return { success: false, error: 'Failed to create recruitment session' };
  }
}
