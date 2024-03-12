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
    await this.recruitmentSessionRepository.save(rs);
    return rs;
  }

  async findAllRecruitmentSessions(): Promise<RecruitmentSession[]> {
    return await this.recruitmentSessionRepository.find();
  }

  async findRecruitmentSessionById(id: number): Promise<RecruitmentSession[]> {
    return await this.recruitmentSessionRepository.findBy({ id });
  }

  // Modifit here if you want to assume to have more than a Recruitment Session
  // active at the same time. Tests assume there is only one now.
  async findActiveRecruitmentSession(): Promise<RecruitmentSession[]> {
    return await this.recruitmentSessionRepository.findBy({
      state: RecruitmentSessionState.Active,
    });
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
