import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { Interview as InterviewSlot } from '@hkrecruitment/shared';
import { User } from '../users/user.entity';
import { TimeSlot } from '../timeslots/timeslot.entity';
import { Application } from '../application/application.entity';
import { on } from 'events';

@Entity()
export class Interview implements InterviewSlot {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  notes: string;

  @Column({ name: 'created_at' })
  createdAt: Date;

  @OneToOne(() => TimeSlot)
  timeslot: Relation<TimeSlot>;

  @OneToOne(() => Application)
  application: Relation<Application>;

  @OneToOne(() => User)
  @JoinColumn({ name: 'interviewer_1' })
  interviewer1: Relation<User>;

  @OneToOne(() => User)
  @JoinColumn({ name: 'interviewer_2' })
  interviewer2: Relation<User>;

  @OneToOne(() => User)
  @JoinColumn({ name: 'optional_interviewer' })
  optionalInterviewer?: Relation<User>;
}
