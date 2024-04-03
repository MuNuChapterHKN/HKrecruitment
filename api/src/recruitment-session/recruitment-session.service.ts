import { Injectable } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { RecruitmentSession } from './recruitment-session.entity';
import { CreateRecruitmentSessionDto } from './create-recruitment-session.dto';
import { RecruitmentSessionState } from '@hkrecruitment/shared';
import { transaction } from 'src/utils/database';
import { TimeSlotsService } from 'src/timeslots/timeslots.service';

@Injectable()
export class RecruitmentSessionService {
  constructor(
    @InjectRepository(RecruitmentSession)
    private readonly recruitmentSessionRepository: Repository<RecruitmentSession>,
    private readonly timeslotService: TimeSlotsService,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async createRecruitmentSession(
    recruitmentSession: CreateRecruitmentSessionDto,
  ): Promise<RecruitmentSession> {
    const now = new Date();
    const rs = {
      ...recruitmentSession,
      state: RecruitmentSessionState.Active,
      createdAt: now,
      lastModified: now,
    } as RecruitmentSession;

    return transaction(this.dataSource, async (queryRunner) => {
      const recruitmentSession = await queryRunner.manager
        .getRepository(RecruitmentSession)
        .save(rs);
      await this.timeslotService.createRecruitmentSessionTimeSlots(
        queryRunner,
        recruitmentSession,
      );
      return recruitmentSession;
    });
  }

  async findAllRecruitmentSessions(): Promise<RecruitmentSession[]> {
    return await this.recruitmentSessionRepository.find();
  }

  async findRecruitmentSessionById(id: number): Promise<RecruitmentSession> {
    return await this.recruitmentSessionRepository.findOne({ where: { id } });
  }

  async findActiveRecruitmentSession(): Promise<RecruitmentSession> {
    return await this.recruitmentSessionRepository.findOne({
      where: { state: RecruitmentSessionState.Active },
    });
  }

  async deletRecruitmentSession(
    recruitmentSession: RecruitmentSession,
  ): Promise<RecruitmentSession> {
    return await this.recruitmentSessionRepository.remove(recruitmentSession);
  }

  async updateRecruitmentSession(
    recruitmentSession: RecruitmentSession,
  ): Promise<RecruitmentSession> {
    return await this.recruitmentSessionRepository.save(recruitmentSession);
  }

  async sessionHasPendingInterviews(
    recruitmentSession: RecruitmentSession,
  ): Promise<boolean> {
    throw new Error('Method not implemented.');
    // TODO: Return true if recruitmentSession.interviews > 0 where interviw date is in the future
  }
}
