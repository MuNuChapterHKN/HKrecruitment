import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Availability } from './availability.entity';
import { CreateAvailabilityDto } from './create-availability.dto';

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

  async createAvailability(
    availability: CreateAvailabilityDto,
  ): Promise<Availability> {
    return await this.availabilityRepository.save(availability);
  }

  async updateAvailability(
    oldAvailability: Availability,
    newAvailability: Availability,
  ): Promise<Availability> {
    await this.availabilityRepository.remove(oldAvailability);
    return await this.availabilityRepository.save(newAvailability);
  }

  async deleteAvailability(availability: Availability): Promise<Availability> {
    return await this.availabilityRepository.remove(availability);
  }
}
