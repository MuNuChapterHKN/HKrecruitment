import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {
  Availability as AvailabilityInterface,
  AvailabilityState,
} from '@hkrecruitment/shared/availability';
import { User } from 'src/users/user.entity';
import { TimeSlot } from 'src/timeslots/timeslot.entity';

@Entity()
export class Availability implements AvailabilityInterface {
  @PrimaryGeneratedColumn('increment')
  id: number;
  @Column()
  state: AvailabilityState;
  @Column()
  lastModified: Date;
  @OneToOne(() => TimeSlot)
  timeSlot: TimeSlot;
  @OneToOne(() => User)
  @JoinColumn()
  user: User;
}
