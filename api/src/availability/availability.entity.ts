import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {
  Availability as AvailabilityInterface,
  AvailabilityState,
} from '../../../shared/src/availability';
import { User } from 'src/users/user.entity';
import { TimeSlot } from 'src/timeslots/timeslot.entity';

@Entity()
export class Availability implements AvailabilityInterface {
  @PrimaryGeneratedColumn('increment')
  id: number;
  @Column()
  state: AvailabilityState;
  @Column({ name: 'last_modified' })
  lastModified: Date;
  @Column({ name: 'time_slot' })
  @ManyToOne(() => TimeSlot)
  timeSlot: TimeSlot;
  @ManyToOne(() => User)
  @JoinColumn()
  user: User;
}
