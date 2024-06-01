import { Interview } from './interview.entity';
import { Application } from '../application/application.entity';
import { TimeSlot } from '../timeslots/timeslot.entity';
import { User } from '../users/user.entity';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { CreateInterviewDto } from './create-interview.dto';
import { transaction } from 'src/utils/database';
import {
  AvailabilityState,
  Role,
  RecruitmentSessionState,
} from '@hkrecruitment/shared';
import { RecruitmentSessionService } from 'src/recruitment-session/recruitment-session.service';

@Injectable()
export class InterviewService {
  constructor(
    @InjectRepository(Interview)
    private readonly interviewRepository: Repository<Interview>,
    @InjectRepository(TimeSlot)
    private readonly timeSlotRepository: Repository<TimeSlot>,
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

  async countInterviewsPerGivenUser(user: User): Promise<number> {
    const queryBuilder =
      this.interviewRepository.createQueryBuilder('Interview');
    queryBuilder
      .innerJoin('Interview.interviewer1', 'interviewer1')
      .innerJoin('Interview.interviewer2', 'interviewer2')
      .innerJoin('Interview.optionalInterviewer', 'optionalInterviewer')
      .where('interviewer1.oauthId = :userId', { userId: user.oauthId })
      .orWhere('interviewer2.oauthId = :userId', { userId: user.oauthId })
      .orWhere('optionalInterviewer.oauthId = :userId', {
        userId: user.oauthId,
      });
    return await queryBuilder.getCount();
  }

  async create(
    interview: CreateInterviewDto,
    application: Application,
    timeslot: TimeSlot,
  ): Promise<Interview> {
    const queryBuilder = this.timeSlotRepository.createQueryBuilder('TimeSlot');
    queryBuilder
      .innerJoinAndSelect('TimeSlot.availabilities', 'availability')
      .innerJoinAndSelect('TimeSlot.recruitmentSession', 'recruitmentSession')
      .innerJoinAndSelect('availability.user', 'user')
      .where('recruitmentSession.state = :recruitmentSessionState', {
        recruitmentSessionState: RecruitmentSessionState.Active,
      })

      // only the given time slot
      .andWhere('TimeSlot.id = :timeSlotId', { timeSlotId: timeslot.id })
      .andWhere('user.role NOT IN (:...roles)', {
        roles: [Role.None, Role.Applicant],
      })

      .andWhere(
        'availability.state = :availabilityState AND (user.is_board = true OR user.is_expert = true)',
        {
          availabilityState: AvailabilityState.Free,
        },
      )
      .andWhere(
        '(SELECT COUNT(availability.id) FROM Availability availability WHERE availability.timeSlotId = TimeSlot.id) > 1',
      );

    const allMatchesGivenTimeslot: TimeSlot[] = await queryBuilder.getMany();

    // all available experts only members sorted by assigned interviews
    const availableExpert = allMatchesGivenTimeslot[0].availabilities
      .filter((av) => {
        return av.user.is_expert && !av.user.is_board;
      })
      .map((av) => av.user);
    let availableExpertSorted = [];
    availableExpert.forEach((expert) => {
      const interviewCount = this.countInterviewsPerGivenUser(expert);
      availableExpertSorted.push([expert, interviewCount]);
    });

    // all available board members sorted by assigned interviews
    const availableBoard = allMatchesGivenTimeslot[0].availabilities
      .filter((av) => {
        return av.user.is_board;
      })
      .map((av) => av.user);
    let availableBoardSorted = [];
    availableBoard.forEach((board) => {
      const interviewCount = this.countInterviewsPerGivenUser(board);
      availableBoardSorted.push([board, interviewCount]);
    });

    // all available optional member
    const availableOptional = allMatchesGivenTimeslot[0].availabilities
      .filter((av) => {
        return !av.user.is_board && !av.user.is_expert;
      })
      .map((av) => av.user);
    let availableOptionalSorted = [];
    availableOptional.forEach((optional) => {
      const interviewCount = this.countInterviewsPerGivenUser(optional);
      availableOptionalSorted.push([optional, interviewCount]);
    });

    availableOptionalSorted = availableOptionalSorted.filter((optional) => {
      return optional[1] == 0;
    });
    availableExpertSorted.sort((a, b) => a[1] - b[1]);
    availableBoardSorted.sort((a, b) => a[1] - b[1]);


  }

  async update(interview: Interview): Promise<Interview> {
    return await this.interviewRepository.save(interview);
  }
}
