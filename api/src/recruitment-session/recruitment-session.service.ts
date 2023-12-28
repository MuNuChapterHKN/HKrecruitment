import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecruitmentSession } from './recruitment-session.entity';
import { CreateRecruitmentSessionDto } from './create-recruitment-session.dto';
import { RecruitmentSessionState } from '@hkrecruitment/shared/recruitment-session';

@Injectable()
export class RecruitmentSessionService {
  constructor(
    @InjectRepository(RecruitmentSession)
    private readonly recruitmentSessionRepository: Repository<RecruitmentSession>,
  ) {}

  async createRecruitmentSession(
    recruitmentSession: CreateRecruitmentSessionDto,
  ): Promise<RecruitmentSession> {
    let now = new Date();
    const rs = {
      ...recruitmentSession,
      state: RecruitmentSessionState.Active,
      createdAt: now,
      lastModified: now,
    } as RecruitmentSession;
    await this.recruitmentSessionRepository.save(rs);
    return rs;
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
}
