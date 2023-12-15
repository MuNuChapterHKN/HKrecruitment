import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import {Interview as InterviewSlot} from '@hkrecruitment/shared';
import {User} from '../users/user.entity';
import { TimeSlot } from '../timeslots/timeslot.entity';
import { Application } from '../application/application.entity';

@Entity()
export class Interview implements InterviewSlot {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  notes: string;

  @Column()
  created_at: Date;

  @Column()
  timeslot: TimeSlot;

  @Column()
  application: Application;

  @Column()
  interviewer_1: User;

  @Column()
  interviewer_2: User;

  @Column({nullable: true})
  optional_interviewer?: User;
}
