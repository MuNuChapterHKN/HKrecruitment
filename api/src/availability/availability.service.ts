import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, InsertResult, Repository, UpdateResult } from 'typeorm';
import { Availability } from './availability.entity';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(Availability)
    private readonly availabilityRepository: Repository<Availability>,
  ) {}

  async listAvailabilities(): Promise<Availability[]> {
    return await this.availabilityRepository.find();
  }

  async findAvailabilityById(id: number): Promise<Availability> {
    const matches = await this.availabilityRepository.findBy({
      id: id,
    });
    return matches.length > 0 ? matches[0] : null;
  }

  async createAvailability(availability: Availability): Promise<InsertResult> {
    return await this.availabilityRepository.insert(availability);
  }

  async updateAvailability(availability: Availability): Promise<UpdateResult> {
    return await this.availabilityRepository.update(
      availability.id,
      availability,
    );
  }

  async deleteAvailability(id: number): Promise<DeleteResult> {
    return await this.availabilityRepository.delete(id);
  }
}
