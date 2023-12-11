import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { RecruitmentSession } from "./recruitment-session.entity";
import { CreateRecruitmentSessionDto } from "./create-recruitment-session.dto";


@Injectable()
export class RecruitmentSessionService {
    constructor(
        @InjectRepository(RecruitmentSession)
        private readonly recruitmentSessionRepository: Repository<RecruitmentSession>
    ) {}

    async createRecruitmentSession(rSess: CreateRecruitmentSessionDto): Promise<RecruitmentSession> {
        return await this.recruitmentSessionRepository.save(rSess);
    }

    async findAllRecruitmentSessions(): Promise<RecruitmentSession[]> {
        return await this.recruitmentSessionRepository.find();
    }

    async findRecruitmentSessionById(id: number): Promise<RecruitmentSession> {
        return await this.recruitmentSessionRepository.findOne({where: {id} });
    }    

    async deletRecruitmentSession(rSess: RecruitmentSession): Promise<RecruitmentSession> {
        return await this.recruitmentSessionRepository.remove(rSess);
    }

    async updateRecruitmentSession(rSess: RecruitmentSession): Promise<RecruitmentSession> {
        return await this.recruitmentSessionRepository.save(rSess);
    }
}