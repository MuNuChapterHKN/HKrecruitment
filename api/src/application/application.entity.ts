import { Column, Entity, PrimaryColumn } from 'typeorm';
import {
  Application as ApplicationInterface,
  ApplicationState,
  LangLevel,
} from '@hkrecruitment/shared';
// import { TimeSlot } from '@hkrecruitment/shared/slot';

@Entity()
export class Application implements ApplicationInterface {
  @PrimaryColumn()
  id: string;

  @Column()
  submission: Date;

  @Column()
  state: ApplicationState;

  @Column()
  lastModified: Date;

  @Column({ nullable: true })
  notes?: string;

  @Column()
  cv: string;

  // @Column()
  // availability: TimeSlot[];

  @Column()
  itaLevel: LangLevel;
}

export class BscApplication extends Application {
  @Column()
  studyPath: string;

  @Column()
  academicYear: number;

  @Column()
  cfu: number;

  @Column()
  grades: string;

  @Column()
  gradesAvg: number;
}

export class MscApplication extends Application {
  @Column({ nullable: true })
  bscStudyPath: string;

  @Column({ nullable: true })
  bscGradesAvg: number;

  @Column()
  mscStudyPath: string;

  @Column()
  mscGradesAvg: number;

  @Column()
  academicYear: number;

  @Column()
  cfu: number;

  @Column()
  grades: string;
}

export class PhdApplication extends Application {
  @Column()
  mscStudyPath: string;

  @Column()
  phdDescription: string;
}
