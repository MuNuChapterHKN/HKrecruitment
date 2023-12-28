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
    let rs = await this.recruitmentSessionRepository.save(recruitmentSession);
    rs.state = RecruitmentSessionState.Active;
    let now = new Date();
    rs.createdAt = now;
    rs.lastModified = now;
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

  async findRecruitmentSessionByStartEndDate(
    start: Date,
    end: Date,
  ): Promise<RecruitmentSession> {
    return await this.recruitmentSessionRepository.findOne({
      where: { interviewStart: start, interviewEnd: end },
    });
  }

  async deletRecruitmentSession(
    recruitmentSession: RecruitmentSession,
  ): Promise<RecruitmentSession> {
    // let toRemove = await this.findRecruitmentSessionByStartEndDate(start, end);
    return await this.recruitmentSessionRepository.remove(recruitmentSession);
  }

  async updateRecruitmentSession(
    recruitmentSession: RecruitmentSession,
  ): Promise<RecruitmentSession> {
    return await this.recruitmentSessionRepository.save(recruitmentSession);
  }

  // udpate state active with respect to current date
  async updateAllStates() {
    let now: number = new Date().getTime();
    let list: RecruitmentSession[] =
      await this.recruitmentSessionRepository.find({
        where: { state: RecruitmentSessionState.Active },
      });
    list.forEach((recruitmentSession) => {
      if (now >= recruitmentSession.interviewEnd.getTime()) {
        recruitmentSession.state = RecruitmentSessionState.Concluded;
        this.updateRecruitmentSession(recruitmentSession);
      }
    });
  }
}
