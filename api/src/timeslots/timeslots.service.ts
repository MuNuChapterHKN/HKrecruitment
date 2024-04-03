import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, QueryRunner } from 'typeorm';
import { TimeSlot } from './timeslot.entity';
import { RecruitmentSession } from '@hkrecruitment/shared';
import { CreateTimeSlotDto } from './create-timeslot.dto';

@Injectable()
export class TimeSlotsService {
  constructor(
    @InjectRepository(TimeSlot)
    private readonly timeSlotRepository: Repository<TimeSlot>,
  ) {}

  async countOverlappingTimeSlots(
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const count = await this.timeSlotRepository.count({
      where: [
        {
          // start < startDate && end > startDate
          start: LessThan(startDate),
          end: MoreThan(startDate),
        },
        // OR
        {
          // start < endDate ||  end > endDate
          start: LessThan(endDate),
          end: MoreThan(endDate),
        },
      ],
    });
    return count;
  }

  async listTimeSlots(): Promise<TimeSlot[]> {
    return await this.timeSlotRepository.find();
  }

  async deleteTimeSlot(timeSlot: TimeSlot): Promise<TimeSlot> {
    return await this.timeSlotRepository.remove(timeSlot);
  }

  async findById(timeSlotId: number): Promise<TimeSlot> {
    const matches = await this.timeSlotRepository.findBy({
      id: timeSlotId,
    });
    return matches.length > 0 ? matches[0] : null;
  }

  async createTimeSlot(timeSlot: CreateTimeSlotDto): Promise<TimeSlot> {
    return await this.timeSlotRepository.save(timeSlot);
  }

  async createRecruitmentSessionTimeSlots(
    queryRunner: QueryRunner,
    recruitmentSession: RecruitmentSession,
  ): Promise<TimeSlot[]> {
    const { slotDuration, interviewStart, interviewEnd, days } =
      recruitmentSession;
    const timeSlots = this.generateTimeSlots(
      slotDuration,
      interviewStart,
      interviewEnd,
      days,
    );
    return await queryRunner.manager.getRepository(TimeSlot).save(timeSlots);
  }

  generateTimeSlots(
    slotDuration: number,
    interviewStart: Date,
    interviewEnd: Date,
    days: Date[],
  ): TimeSlot[] {
    const timeSlots: TimeSlot[] = [];
    const interviewStartMinutes =
      interviewStart.getHours() * 60 + interviewStart.getMinutes();
    const interviewEndMinutes =
      interviewEnd.getHours() * 60 + interviewEnd.getMinutes();
    const dailySlots = Math.floor(
      (interviewEndMinutes - interviewStartMinutes) / slotDuration,
    );

    for (let i = 0; i < dailySlots; i++) {
      for (let day of days) {
        const timeSlotStart = new Date(day);
        timeSlotStart.setHours(
          interviewStart.getHours() + Math.floor((i * slotDuration) / 60),
          interviewStart.getMinutes() + ((i * slotDuration) % 60),
          0,
          0,
        );
        const timeSlotEnd = new Date(
          timeSlotStart.getTime() + slotDuration * 1000 * 60,
        );

        const timeSlot = new TimeSlot();
        timeSlot.start = timeSlotStart;
        timeSlot.end = timeSlotEnd;
        timeSlots.push(timeSlot);
      }
    }

    return timeSlots;
  }
}
