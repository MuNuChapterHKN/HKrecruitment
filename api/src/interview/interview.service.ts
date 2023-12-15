import { Interview } from "./interview.entity"
import { Application } from "../application/application.entity";
import { TimeSlot } from "../timeslots/timeslot.entity";
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreateInterviewDto } from "./create-interview.dto";

@Injectable()
export class InterviewService {
  constructor(
    @InjectRepository(Interview)
    private readonly interviewRepository: Repository<Interview>,
  ) {}

  async findById(id: number): Promise<Interview | null> {
    return this.interviewRepository.findOne({ where: { id } });
  }

  async delete(interview: Interview): Promise<Interview> {
    return await this.interviewRepository.remove(interview);
  }

  async create(interview: CreateInterviewDto, application: Application, timeslot: TimeSlot): Promise<Interview> {
    return await this.interviewRepository.save({...interview, application, timeslot});
  }

  async update(interview: Interview): Promise<Interview> {
    return await this.interviewRepository.save(interview);
  }
}
 