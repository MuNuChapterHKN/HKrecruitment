import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Not, In } from 'typeorm';
import { Application } from './application.entity';
import {
  CreateApplicationDto,
  flattenApplication,
} from './create-application.dto';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
  ) {}

  async findAll(): Promise<Application[]> {
    return this.applicationRepository.find();
  }

  async findByApplicationId(
    applicationId: number,
  ): Promise<Application | null> {
    const matches = await this.applicationRepository.findBy({
      id: applicationId,
    });
    return matches.length > 0 ? matches[0] : null;
  }

  async findByApplicantId(applicantId: string): Promise<Application[]> {
    return await this.applicationRepository.findBy({ applicantId });
  }

  async findActiveApplicationByApplicantId(
    applicantId: string,
  ): Promise<boolean> {
    const match = await this.applicationRepository.findBy({
      applicantId,
      // Search only for applications that are still pending
      state: Not(In(['finalized', 'rejected', 'refused_by_applicant'])),
    });
    return match.length > 0;
  }

  async listApplications(
    submittedFrom: string,
    submittedUntil: string,
    state: string,
  ): Promise<Application[]> {
    const conditions = {};
    // Add time range condition if both dates are specified
    if (submittedFrom && submittedUntil)
      conditions['submission'] = Between(submittedFrom, submittedUntil);
    // Add state condition when "state" is specified
    if (state) conditions['state'] = state;
    return await this.applicationRepository.findBy(conditions);
  }

  async delete(application: Application): Promise<Application> {
    return this.applicationRepository.remove(application);
  }

  async createApplication(
    application: CreateApplicationDto,
  ): Promise<Application> {
    return this.applicationRepository.save(flattenApplication(application));
  }

  async updateApplication(application: Application): Promise<Application> {
    return this.applicationRepository.save(application);
  }
}
