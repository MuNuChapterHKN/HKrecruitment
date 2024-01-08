import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { TimeSlot as TimeSlotInterface } from '@hkrecruitment/shared';
import { Availability } from 'src/availability/availability.entity';

@Entity()
export class TimeSlot implements TimeSlotInterface {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  start: Date;

  @Column()
  end: Date;

  @OneToMany(() => Availability, (availability) => availability.timeSlot)
  availabilities: Availability[];
}
