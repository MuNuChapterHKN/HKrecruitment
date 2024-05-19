import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, QueryRunner, Not, In } from 'typeorm';
import { TimeSlot } from './timeslot.entity';
import {
  RecruitmentSession,
  RecruitmentSessionState,
  AvailabilityState,
  Role,
} from '@hkrecruitment/shared';

@Injectable()
export class TimeSlotsService {
  constructor(
    @InjectRepository(TimeSlot)
    private readonly timeSlotRepository: Repository<TimeSlot>,
  ) {}

  /**
   * Count the number of overlapping time slots
   * @param startDate - Start date of the time slot
   * @param endDate - End date of the time slot
   * @returns {Promise<number>} - Number of overlapping time slots
   */
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

  /**
   * List all time slots
   * @returns {Promise<TimeSlot[]>} - List of time slots
   */
  async listTimeSlots(): Promise<TimeSlot[]> {
    return await this.timeSlotRepository.find();
  }

  /**
   * Delete a time slot
   * @param timeSlot - Time slot to delete
   * @returns {Promise<TimeSlot>} - Deleted time slot
   */
  async deleteTimeSlot(timeSlot: TimeSlot): Promise<TimeSlot> {
    return await this.timeSlotRepository.remove(timeSlot);
  }

  /**
   * Find a time slot by its ID
   * @param timeSlotId - ID of the time slot
   * @returns {Promise<TimeSlot>} - Time slot with the given ID
   */
  async findById(timeSlotId: number): Promise<TimeSlot> {
    const matches = await this.timeSlotRepository.findBy({
      id: timeSlotId,
    });
    return matches.length > 0 ? matches[0] : null;
  }

  /**
   * Create a time slot
   * @param timeSlot - Time slot to create
   * @returns {Promise<TimeSlot>} - Created time slot
   */
  async createTimeSlot(timeSlot: TimeSlot): Promise<TimeSlot> {
    return await this.timeSlotRepository.save(timeSlot);
  }

  /**
   * Create time slots for a recruitment session
   * @param queryRunner - Query runner
   * @param recruitmentSession - Recruitment session
   * @returns {Promise<TimeSlot[]>} - List of created time slots
   */
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

  /**
   * Generate time slots for a recruitment session
   * @param slotDuration - Duration of each time slot in minutes
   * @param interviewStart - Start time of the interview
   * @param interviewEnd - End time of the interview
   * @param days - Days of the week the interview will be held
   * @returns {TimeSlot[]} - List of generated time slots
   */
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

  /**
   * Find available time slots for the current recruitment session
   * @returns {TimeSlot[]} - List of available time slots
   */
  async findAvailableTimeSlots(): Promise<TimeSlot[]> {
    const queryBuilder = this.timeSlotRepository.createQueryBuilder('TimeSlot');
    queryBuilder
      .innerJoinAndSelect('TimeSlot.availabilities', 'availability')
      .innerJoinAndSelect('TimeSlot.recruitmentSession', 'recruitmentSession')
      .innerJoinAndSelect('availability.user', 'user')

      // only active recruitment sessions (the current one)
      .where('recruitmentSession.state = :recruitmentSessionState', {
        recruitmentSessionState: RecruitmentSessionState.Active,
      })

      // available people should be members of hkn
      .andWhere('user.role NOT IN (:...roles)', {
        roles: [Role.None, Role.Applicant],
      })

      // only free people that are board OR expert member
      .andWhere(
        'availability.state = :availabilityState AND (user.is_board = true OR user.is_expert = true)',
        {
          availabilityState: AvailabilityState.Free,
        },
      )

      // there should be at least 2 available people (hopefully one of them is a board member)
      .andWhere(
        '(SELECT COUNT(availability.id) FROM Availability availability WHERE availability.timeSlotId = TimeSlot.id) > 1',
      );

    const allMatches = await queryBuilder.getMany();
    // const allMatches = await this.timeSlotRepository.find({
    //   relations: [
    //     'availabilities',
    //     'availabilities.user',
    //     'recruitmentSession',
    //   ],
    //   where: {
    //     availabilities: {
    //       state: AvailabilityState.Free,
    //       user: {
    //         role: Not(In([Role.Applicant, Role.None])),
    //       },
    //     },
    //   },
    // });

    let goodTimeSlots: TimeSlot[] = [];
    allMatches.forEach((timeSlot) => {
      let boardMembers = 0;
      let expertMembers = 0;
      for (let availability of timeSlot.availabilities) {
        // redundant checks
        if (availability.state !== AvailabilityState.Free) continue;
        if (availability.user.role === Role.None) continue;
        if (availability.user.role === Role.Applicant) continue;

        if (availability.user.is_board) ++boardMembers;
        else if (availability.user.is_expert) ++expertMembers;
      }

      if ((boardMembers && expertMembers) || boardMembers > 1) {
        const timeslotToPush = {
          id: timeSlot.id,
          start: timeSlot.start,
          end: timeSlot.end,
        } as TimeSlot;
        goodTimeSlots.push(timeslotToPush);
      }
    });

    return goodTimeSlots;
  }
}
