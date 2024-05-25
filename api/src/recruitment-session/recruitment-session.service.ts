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

  async findRecruitmentSessionById(
    RSid: number,
  ): Promise<RecruitmentSession | null> {
    const matches = await this.recruitmentSessionRepository.findBy({
      id: RSid,
    });
    return matches.length > 0 ? matches[0] : null;
  }

  async findActiveRecruitmentSession(): Promise<RecruitmentSession | null> {
    const matches = await this.recruitmentSessionRepository.findBy({
      state: RecruitmentSessionState.Active,
    });
    return matches.length > 0 ? matches[0] : null;
  }

  async deleteRecruitmentSession(
    recruitmentSession: RecruitmentSession,
  ): Promise<RecruitmentSession> {
    return await this.recruitmentSessionRepository.remove(recruitmentSession);
  }

  /**
   * Update a recruitment session
   * @param recruitmentSession - Recruitment session to update
   * @returns {Promise<RecruitmentSession>} - Updated recruitment session
   */
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
