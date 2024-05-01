import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import {
  Availability as AvailabilityInterface,
  AvailabilityState,
} from '../../../shared/src/availability';
import { User } from 'src/users/user.entity';
import { TimeSlot } from 'src/timeslots/timeslot.entity';
import { DbAwareColumn } from 'src/utils/db-aware-column';

@Entity()
export class Availability implements AvailabilityInterface {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  state: AvailabilityState;

  @Column({ name: 'last_modified' })
  lastModified: Date;

  @DbAwareColumn(() => TimeSlot, { name: 'time_slot' })
  @ManyToOne(() => TimeSlot, (timeSlot) => timeSlot.availabilities)
  @JoinColumn({ name: 'time_slot' })
  timeSlot: Relation<TimeSlot>;

  @ManyToOne(() => User, (user) => user.availabilities)
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  // @OneToOne(() => Interview)
  // interview: Interview;
}
