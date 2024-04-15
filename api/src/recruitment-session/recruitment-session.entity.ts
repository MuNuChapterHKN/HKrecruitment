import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import {
  RecruitmentSession as RecruitmentSessionInterface,
  RecruitmentSessionState,
} from '@hkrecruitment/shared';

@Entity()
export class RecruitmentSession implements RecruitmentSessionInterface {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  state: RecruitmentSessionState;

  @Column('int', { name: 'slot_duration' })
  slotDuration: number;

  @Column('date', { name: 'interview_start' })
  interviewStart: Date;

  @Column('date', { name: 'interview_end' })
  interviewEnd: Date;

  @Column('date', { array: true })
  days: Date[];

  @Column('date', { name: 'created_at' })
  createdAt: Date;

  @Column('date', { name: 'last_modified' })
  lastModified: Date;
}
