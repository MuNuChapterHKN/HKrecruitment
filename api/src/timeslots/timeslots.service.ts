import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { TimeSlot } from './timeslot.entity';
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
}
