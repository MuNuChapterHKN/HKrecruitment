import { Interview } from './interview.entity';
import { Application } from '../application/application.entity';
import { TimeSlot } from '../timeslots/timeslot.entity';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { CreateInterviewDto } from './create-interview.dto';
import { transaction } from 'src/utils/database';
import { RecruitmentSessionService } from 'src/recruitment-session/recruitment-session.service';

@Injectable()
export class InterviewService {
  constructor(
    @InjectRepository(Interview)
    private readonly interviewRepository: Repository<Interview>,
    @InjectDataSource()
    private dataSource: DataSource,
    private readonly recruitmentSessionService: RecruitmentSessionService,
  ) {}

  async findById(id: number): Promise<Interview | null> {
    return this.interviewRepository.findOne({ where: { id } });
  }

  async delete(interview: Interview): Promise<Interview> {
    return await this.interviewRepository.remove(interview);
  }

  async create(
    interview: CreateInterviewDto,
    application: Application,
    timeslot: TimeSlot,
  ): Promise<Interview> {
    return transaction(this.dataSource, async (queryRunner) => {
      const recruitmentSession =
        await this.recruitmentSessionService.findActiveRecruitmentSession();

      // filtrare applicant no None e No applicant
      // join per disponibilità usando timeslot, caso non disponibili mando eccezione,
      // 1 board 1 expert necessaria MODIFICA FUTURA

      const scheduledInterview = await queryRunner.manager
        .getRepository(Interview)
        .save({ ...interview, application, timeslot, recruitmentSession });
      return recruitmentSession;
    });
  }

  async update(interview: Interview): Promise<Interview> {
    return await this.interviewRepository.save(interview);
  }
}
