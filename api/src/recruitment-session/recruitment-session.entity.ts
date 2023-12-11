import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { RecruitmentSession as RecruitmentSessionInterface, RecruitmentSessionState } from '@hkrecruitment/shared/src/recruitment-session'


@Entity()
export class RecruitmentSession implements RecruitmentSessionInterface {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  state: RecruitmentSessionState;

  @Column()
  slotDuration: number;

  @Column()
  interviewStart: Date;

  @Column()
  interviewEnd: Date;

  @Column()
  days: [Date];

  @Column()
  createdAt: Date;

  @Column()
  lastModified: Date;
}
