import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Interview as InterviewSlot } from '@hkrecruitment/shared';
import { User } from '../users/user.entity';
import { TimeSlot } from '../timeslots/timeslot.entity';
import { Application } from '../application/application.entity';

@Entity()
export class Interview implements InterviewSlot {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  notes: string;

  @Column({ name: 'created_at' })
  createdAt: Date;

  @Column()
  timeslot: TimeSlot;

  @Column()
  application: Application;

  @Column({ name: 'interviewer_1' })
  interviewer1: User;

  @Column({ name: 'interviewer_2' })
  interviewer2: User;

  @Column({ name: 'optional_interviewer', nullable: true })
  optionalInterviewer?: User;
}
