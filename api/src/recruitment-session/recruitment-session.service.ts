import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecruitmentSession } from './recruitment-session.entity';
import { CreateRecruitmentSessionDto } from './create-recruitment-session.dto';
import { RecruitmentSessionState } from '@hkrecruitment/shared';

@Injectable()
export class RecruitmentSessionService {
  constructor(
    @InjectRepository(RecruitmentSession)
    private readonly recruitmentSessionRepository: Repository<RecruitmentSession>,
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
    } as unknown as RecruitmentSession;
    return await this.recruitmentSessionRepository.save(rs);
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
