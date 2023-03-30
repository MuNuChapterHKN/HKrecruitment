import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from './application.entity';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
  ) {}

  async findAll(): Promise<Application[]> {
    return this.applicationRepository.find();
  }

  async delete(application: Application): Promise<Application> {
    return this.applicationRepository.remove(application);
  }

  async create(application: Application): Promise<Application> {}

  async update(application: Application): Promise<Application> {
    return this.applicationRepository.save(application);
  }
}
