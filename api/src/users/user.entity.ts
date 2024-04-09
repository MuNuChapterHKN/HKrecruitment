import { Column, Entity, OneToMany, PrimaryColumn, Relation } from 'typeorm';
import { Person, Role } from '@hkrecruitment/shared';
import { Availability } from 'src/availability/availability.entity';

@Entity()
export class User implements Person {
  @PrimaryColumn()
  oauthId: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  sex: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone_no?: string;

  @Column({ nullable: true })
  telegramId?: string;

  @Column()
  role: Role;

  @OneToMany(() => Availability, (availability) => availability.user)
  availabilities?: Relation<Availability[]>;
}
