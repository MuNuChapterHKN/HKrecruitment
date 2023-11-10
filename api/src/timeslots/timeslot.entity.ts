import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TimeSlot as TimeSlotInterface } from '@hkrecruitment/shared';

@Entity()
export class TimeSlot implements TimeSlotInterface {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  start: Date;

  @Column()
  end: Date;
}
