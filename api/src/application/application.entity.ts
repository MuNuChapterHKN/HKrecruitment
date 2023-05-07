import {
  Column,
  Entity,
  ChildEntity,
  PrimaryGeneratedColumn,
  TableInheritance,
} from 'typeorm';
import {
  Application as ApplicationInterface,
  ApplicationState,
  ApplicationType,
  LangLevel,
} from '@hkrecruitment/shared';
// import { TimeSlot } from '@hkrecruitment/shared/slot';

@Entity()
@TableInheritance({ column: { type: 'varchar', name: 'type_orm' } }) // TypeORM column to discriminate child entities
export class Application implements ApplicationInterface {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  type: ApplicationType;

  @Column('varchar', { length: 64, name: 'applicant_id' })
  applicantId: string;

  @Column()
  submission: Date;

  @Column()
  state: ApplicationState;

  @Column({ name: 'last_modified', nullable: true })
  lastModified: Date;

  @Column({ nullable: true, length: 255 })
  notes?: string;

  @Column({ length: 255 })
  cv: string;

  // @Column()
  // availability: TimeSlot[];

  // @Column({ "name": "interview_id" })
  // interviewId: number;

  @Column({ name: 'ita_level' })
  itaLevel: LangLevel;
}

@ChildEntity()
export class BscApplication extends Application {
  @Column({ name: 'bsc_study_path', nullable: true })
  bscStudyPath: string;

  @Column({ name: 'bsc_academic_year', nullable: true })
  bscAcademicYear: number;

  @Column({ name: 'bsc_grades_avg', nullable: true })
  bscGradesAvg: number;

  @Column({ nullable: true })
  cfu: number;

  @Column({ nullable: true, length: 255 })
  grades: string;
}

@ChildEntity()
export class MscApplication extends Application {
  @Column({ name: 'msc_study_path', nullable: true })
  mscStudyPath: string;

  @Column({ name: 'msc_grades_avg', nullable: true })
  mscGradesAvg: number;

  @Column({ name: 'msc_academic_year', nullable: true })
  mscAcademicYear: number;
}

@ChildEntity()
export class PhdApplication extends Application {
  @Column({ name: 'phd_description', nullable: true })
  phdDescription: string;
}
