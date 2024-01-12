import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import {
  RecruitmentSession as RecruitmentSessionInterface,
  RecruitmentSessionState,
} from '@hkrecruitment/shared/src/recruitment-session';

@Entity()
export class RecruitmentSession implements RecruitmentSessionInterface {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  state: RecruitmentSessionState;

  @Column({ name: 'slot_duration' })
  slotDuration: number;

  @Column({ name: 'interview_start' })
  interviewStart: Date;

  @Column({ name: 'interview_end' })
  interviewEnd: Date;

  @Column({array:true})
  days: Date[];

  @Column({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'last_modified' })
  lastModified: Date;
}
