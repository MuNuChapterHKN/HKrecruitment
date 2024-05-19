import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { TimeSlot as TimeSlotInterface } from '@hkrecruitment/shared';
import { Availability } from 'src/availability/availability.entity';
import { RecruitmentSession } from 'src/recruitment-session/recruitment-session.entity';

@Entity()
export class TimeSlot implements TimeSlotInterface {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  start: Date;

  @Column()
  end: Date;

  @OneToMany(() => Availability, (availability) => availability.timeSlot)
  availabilities: Relation<Availability[]>;

  @ManyToOne(
    () => RecruitmentSession,
    (recruitmentSession) => recruitmentSession.timeSlots,
  )
  recruitmentSession: Relation<RecruitmentSession>;
}
