import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Not, In } from 'typeorm';
import { Application } from './application.entity';
import { GDriveStorage } from '../google/GDrive/GDriveStorage';
import {
  CreateApplicationDto,
  flattenApplication,
} from './create-application.dto';
import { ApplicationState, ApplicationType } from '@hkrecruitment/shared';
import { UsersService } from '../users/users.service';
import { ApplicationFiles } from './application-types';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
    private readonly usersService: UsersService,
  ) {}

  static APPLICATIONS_FOLDER = 'applications'; // Google Drive folder name

  async findAll(): Promise<Application[]> {
    return this.applicationRepository.find();
  }

  async findByApplicationId(
    applicationId: number,
  ): Promise<Application | null> {
    const matches = await this.applicationRepository.findBy({
      id: applicationId,
    });
    return matches.length > 0 ? matches[0] : null;
  }

  async findByApplicantId(applicantId: string): Promise<Application[]> {
    return await this.applicationRepository.findBy({ applicantId });
  }

  async findActiveApplicationByApplicantId(
    applicantId: string,
  ): Promise<boolean> {
    const match = await this.applicationRepository.findBy({
      applicantId,
      // Search only for applications that are still pending
      state: Not(In(['finalized', 'rejected', 'refused_by_applicant'])),
    });
    return match.length > 0;
  }

  async findLastApplicationByActiveUserId(applicantId: string): Promise<Application> {
    return await this.applicationRepository.findOne({
      where: { applicantId },
      order: {
        lastModified: 'DESC'
      },
    });
  }

  async listApplications(
    submittedFrom: string,
    submittedUntil: string,
    state: string,
  ): Promise<Application[]> {
    const conditions = {};

    // Add time range condition if both dates are specified
    if (submittedFrom && submittedUntil)
      conditions['submission'] = Between(submittedFrom, submittedUntil);

    // Add state condition when "state" is specified
    if (state) conditions['state'] = state;
    // Retrieve applications
    return await this.applicationRepository.findBy(conditions);
  }

  async delete(application: Application): Promise<Application> {
    return this.applicationRepository.remove(application);
  }

  async createApplication(
    application: CreateApplicationDto,
    files: ApplicationFiles,
    applicantId: string,
  ): Promise<Application> {
    // Get applicant full name
    const applicant = await this.usersService.findByOauthId(applicantId);
    if (!applicant) throw new NotFoundException('Applicant not found');
    const applicantFullName = `${applicant.firstName}_${applicant.lastName}`;
    const today = new Date();

    // TODO: Create an Interview and set application.interview_id
    application.submission = today;
    application.state = ApplicationState.New;
    application.applicantId = applicantId;

    const storage = new GDriveStorage();
    let gradesFileId = null;
    let cvFileId = null;

    // Save files to Google Drive
    try {
      const applicationsFolder = await storage.getFolderByName(
        ApplicationsService.APPLICATIONS_FOLDER,
      );
      const formattedDatetime = today.toLocaleString('en-US', {
        hour12: false,
      });
      const fileName = `${application.type}_${applicantFullName}_${formattedDatetime}`;
      // TODO: Create a folder for each applicant? Give it a unique name

      // Save CV
      cvFileId = await storage.insertFile(
        `CV_${fileName}`,
        files.cv[0].buffer,
        applicationsFolder,
      );
      application.cv = cvFileId;

      // Save grades
      if (files.grades) {
        const applicationType =
          application.type === ApplicationType.BSC
            ? 'bscApplication'
            : 'mscApplication';
        gradesFileId = await storage.insertFile(
          `Grades_${fileName}`,
          files.grades[0].buffer,
          applicationsFolder,
        );
        application[applicationType].grades = gradesFileId;
      }
      return await this.applicationRepository.save(
        flattenApplication(application),
      );
    } catch (err) {
      console.log('Error caught: ', err);
      // Delete files from Google Drive
      if (cvFileId) await storage.deleteItem(cvFileId);
      if (gradesFileId) await storage.deleteItem(gradesFileId);
      throw new InternalServerErrorException();
    }
  }

  async updateApplication(application: Application): Promise<Application> {
    return await this.applicationRepository.save(
      flattenApplication(application),
    );
  }
}
