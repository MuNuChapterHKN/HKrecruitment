import { Column, Entity, PrimaryColumn } from "typeorm";
import { Person, Role } from "@hkrecruitment/shared";

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
  role: Role
}