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

  /**
   * Create a recruitment session
   * @param recruitmentSession - Recruitment session to create
   * @returns {Promise<RecruitmentSession>} - Created recruitment session
   */
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

  /**
   * List all recruitment sessions
   * @returns {Promise<RecruitmentSession[]>} - List of recruitment sessions
   */
  async findAllRecruitmentSessions(): Promise<RecruitmentSession[]> {
    return await this.recruitmentSessionRepository.find();
  }

  /**
   * Find a recruitment session by its ID
   * @param RSid - ID of the recruitment session
   * @returns {Promise<RecruitmentSession | null>} - Recruitment session with the given ID
   */
  async findRecruitmentSessionById(
    RSid: number,
  ): Promise<RecruitmentSession | null> {
    const matches = await this.recruitmentSessionRepository.findBy({
      id: RSid,
    });
    return matches.length > 0 ? matches[0] : null;
  }

  /**
   * Find an active recruitment session
   * @returns {Promise<RecruitmentSession | null>} - Active recruitment session
   */
  async findActiveRecruitmentSession(): Promise<RecruitmentSession | null> {
    const matches = await this.recruitmentSessionRepository.findBy({
      state: RecruitmentSessionState.Active,
    });
    return matches.length > 0 ? matches[0] : null;
  }

  /**
   * Delete a recruitment session
   * @param recruitmentSession - Recruitment session to delete
   * @returns {Promise<RecruitmentSession>} - Deleted recruitment session
   */
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

  /**
   * Check if a recruitment session has pending interviews
   * @param recruitmentSession - Recruitment session to check
   * @returns {Promise<boolean>} - True if the recruitment session has pending interviews, false otherwise
   */
  async sessionHasPendingInterviews(
    recruitmentSession: RecruitmentSession,
  ): Promise<boolean> {
    throw new Error('Method not implemented.');
    // TODO: Return true if recruitmentSession.interviews > 0 where interviw date is in the future
  }
}
