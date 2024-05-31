import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { Availability } from './availability.entity';
import { TimeSlot } from 'src/timeslots/timeslot.entity';
import { User } from 'src/users/user.entity';
import { AvailabilityState } from '@hkrecruitment/shared';
import { transaction } from 'src/utils/database';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(Availability)
    private readonly availabilityRepository: Repository<Availability>,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  /**
   * List all availabilities
   * @returns {Promise<Availability[]>} - List of availabilities
   */
  async listAvailabilities(): Promise<Availability[]> {
    return await this.availabilityRepository.find();
  }

  /**
   * Find all availabilities for a given user
   * @param user - User to find availabilities for
   * @returns {Promise<Availability[]>} - List of availabilities for the user
   */
  async findById(id: number): Promise<Availability> {
    const matches = await this.availabilityRepository.findBy({
      id: id,
    });
    return matches.length > 0 ? matches[0] : null;
  }

  /**
   * Find all availabilities for a given user
   * @param user - User to find availabilities for
   * @returns {Promise<Availability[]>} - List of availabilities for the user
   */
  async findByUserAndTimeSlot(user: User, timeSlot: TimeSlot) {
    const matches = await this.availabilityRepository.findBy({
      user: user as any,
      timeSlot: timeSlot as any,
    });
    return matches.length > 0 ? matches[0] : null;
  }

  /**
   * Create an availability
   * @param availability - Availability to create
   * @returns {Promise<Availability>} - Created availability
   */
  async createAvailability(availability: Availability): Promise<Availability> {
    return await this.availabilityRepository.save(availability);
  }

  /**
   * Update an availability
   * @param oldAvailabilityId - ID of the
   * @param newAvailability - New availability
   * @returns {Promise<Availability>} - Updated availability
   */
  async updateAvailability(
    oldAvailabilityId: number,
    newAvailability: Availability,
  ): Promise<Availability> {
    return await this.availabilityRepository.save({
      ...newAvailability,
      id: oldAvailabilityId,
    });
  }

  /**
   * Delete an availability
   * @param availabilityId - ID of the availability to delete
   * @returns {Promise<Availability>} - Deleted availability
   * @throws {ConflictException} - If availability is in use
   */
  async deleteAvailability(availabilityId: number): Promise<Availability> {
    return await transaction(
      this.dataSource,
      async (queryRunner: QueryRunner) => {
        const availability = await queryRunner.manager
          .getRepository(Availability)
          .findOneBy({ id: availabilityId });

        // Check if availability is in use
        if (availability.state === AvailabilityState.Interviewing) {
          const rescheduled = false;
          // TODO: If user was optional, just delete it, otherwise:
          // Try to assign a different person to the interview
          // TODO: Retrieve availability status + id of interviewer of timeslots in range [timeslot-1, timeslot+1]
          // TODO: Search for someone with state = AvailabilityState.Available in timesolt, and state != AvailabilityState.interviewing in t-1 and t+1
          // TODO: If it doesn't exist: rescheduled = False
          // If no other availability is found, availability cannot be deleted
          if (!rescheduled)
            throw new ConflictException(
              'Availability is in use and cannot be deleted.',
            );
        }

        return await queryRunner.manager
          .getRepository(Availability)
          .remove(availability);
      },
    );
  }
}
