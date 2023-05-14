import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsService } from './applications.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Application } from './application.entity';
import { ApplicationState, ApplicationType } from '@hkrecruitment/shared';
import { UsersService } from '../users/users.service';
import { mockedRepository } from '@mocks/repositories';
import { mockedUsersService } from '@mocks/services';
import {
  applicant,
  applicationFiles,
  mockBscApplication,
  mockMscApplication,
  mockPhdApplication,
  mockCreateBscApplicationDTO,
  mockCreateMscApplicationDTO,
  mockCreatePhdApplicationDTO,
  fileId,
  applicantId,
  folderId,
  today,
  testDate,
} from '@mocks/data';
import { flattenApplication } from './create-application.dto';
import { InternalServerErrorException } from '@nestjs/common';

const mockedGDrive = {
  getFolderByName: jest.fn(),
  insertFile: jest.fn(),
  deleteItem: jest.fn(),
  constructor: jest.fn(),
};

// Mock GDriveStorage
jest.mock('../google/GDrive/GDriveStorage', () => {
  return {
    GDriveStorage: jest.fn().mockImplementation(() => {
      return mockedGDrive;
    }),
  };
});

describe('ApplicationsService', () => {
  let applicationService: ApplicationsService;
  let usersService: UsersService;

  /************* Test setup ************/

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(testDate);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        {
          provide: getRepositoryToken(Application),
          useValue: mockedRepository,
        },
        {
          provide: UsersService,
          useValue: mockedUsersService,
        },
      ],
    }).compile();

    applicationService = module.get<ApplicationsService>(ApplicationsService);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => jest.clearAllMocks());

  /*************** Tests ***************/

  it('should be defined', () => {
    expect(applicationService).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of applications', async () => {
      const applications: Application[] = [mockBscApplication];
      jest.spyOn(mockedRepository, 'find').mockResolvedValue(applications);
      const result = await applicationService.findAll();

      expect(result).toEqual(applications);
      expect(mockedRepository.find).toHaveBeenCalledTimes(1);
      expect(mockedRepository.find).toHaveBeenCalledWith();
    });
  });

  describe('findByApplicationId', () => {
    it('should return an application by id', async () => {
      const applicationId = 1;
      jest
        .spyOn(mockedRepository, 'findBy')
        .mockResolvedValue([mockBscApplication]);
      const result = await applicationService.findByApplicationId(
        applicationId,
      );

      expect(result).toEqual(mockBscApplication);
      expect(mockedRepository.findBy).toHaveBeenCalledTimes(1);
      expect(mockedRepository.findBy).toHaveBeenCalledWith({
        id: applicationId,
      });
    });

    it('should return null when no application is found', async () => {
      const applicationId = 2;
      jest.spyOn(mockedRepository, 'findBy').mockResolvedValue([]);
      const result = await applicationService.findByApplicationId(
        applicationId,
      );

      expect(result).toBeNull();
      expect(mockedRepository.findBy).toHaveBeenCalledTimes(1);
      expect(mockedRepository.findBy).toHaveBeenCalledWith({
        id: applicationId,
      });
    });
  });

  describe('findByApplicantId', () => {
    it('should return an array of applications for the specified applicant', async () => {
      const applicantId = 'abc123';
      const applications: Application[] = [mockBscApplication];
      jest.spyOn(mockedRepository, 'findBy').mockResolvedValue(applications);
      const result = await applicationService.findByApplicantId(applicantId);

      expect(result).toEqual(applications);
      expect(mockedRepository.findBy).toHaveBeenCalledTimes(1);
      expect(mockedRepository.findBy).toHaveBeenCalledWith({ applicantId });
    });
  });

  describe('findActiveApplicationByApplicantId', () => {
    it('should return true when an active application exists for the specified applicant', async () => {
      const applicantId = 'abc123';
      const activeApplication: Application = {
        ...mockBscApplication,
        state: ApplicationState.New,
      };
      jest
        .spyOn(mockedRepository, 'findBy')
        .mockResolvedValue([activeApplication]);
      const result =
        await applicationService.findActiveApplicationByApplicantId(
          applicantId,
        );

      expect(result).toBe(true);
      expect(mockedRepository.findBy).toHaveBeenCalledTimes(1);
    });

    it('should return false when no application exists for the specified applicant', async () => {
      const applicantId = 'abc123';
      jest.spyOn(mockedRepository, 'findBy').mockResolvedValue([]);
      const result =
        await applicationService.findActiveApplicationByApplicantId(
          applicantId,
        );

      expect(result).toBe(false);
      expect(mockedRepository.findBy).toHaveBeenCalledTimes(1);
    });
  });

  describe('listApplications', () => {
    it('should return an array of applications based on the provided conditions', async () => {
      const conditions = {
        submission: { $gte: new Date(2023, 0, 1), $lte: new Date(2023, 0, 31) },
        state: ApplicationState.New,
      };
      const applications: Application[] = [mockBscApplication];
      jest.spyOn(mockedRepository, 'findBy').mockResolvedValue(applications);
      const result = await applicationService.listApplications(
        conditions.submission.$gte.toISOString(),
        conditions.submission.$lte.toISOString(),
        conditions.state,
      );

      expect(result).toEqual(applications);
      expect(mockedRepository.findBy).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete', () => {
    it('should remove the specified application from the database', async () => {
      jest
        .spyOn(mockedRepository, 'remove')
        .mockResolvedValue(mockBscApplication);

      const result = await applicationService.delete(mockBscApplication);
      expect(result).toEqual(mockBscApplication);
      expect(mockedRepository.remove).toHaveBeenCalledTimes(1);
    });
  });

  function createTestApplication(applicationType: ApplicationType) {
    it(`should create and return a new ${applicationType} application`, async () => {
      const applicantId = 'abc123';
      const folderId = 'folder_abc123';
      const fileId = 'file_abc123';
      const today = '1/1/2023, 24:00:00';
      let mockApplication, mockCreateApplicationDTO;
      switch (applicationType) {
        case ApplicationType.BSC:
          mockApplication = mockBscApplication;
          mockCreateApplicationDTO = mockCreateBscApplicationDTO;
          break;
        case ApplicationType.MSC:
          mockApplication = mockMscApplication;
          mockCreateApplicationDTO = mockCreateMscApplicationDTO;
          break;
        case ApplicationType.PHD:
          mockApplication = mockPhdApplication;
          mockCreateApplicationDTO = mockCreatePhdApplicationDTO;
          break;
      }
      const expectedCvFileName = `CV_${applicationType}_${applicant.firstName}_${applicant.lastName}_${today}`;
      const expectedGradesFileName = `Grades_${applicationType}_${applicant.firstName}_${applicant.lastName}_${today}`;
      const newApplication: Application = {
        ...mockApplication,
        applicantId,
        state: ApplicationState.New,
        lastModified: testDate,
        submission: testDate,
      };
      let expectedFileInertions;
      const mockApplicationFiles = { ...applicationFiles };
      if (applicationType === ApplicationType.PHD) {
        delete mockApplicationFiles.grades; // Grades are not required for PhD applications
        expectedFileInertions = 1;
      } else {
        expectedFileInertions = 2;
      }

      jest.spyOn(mockedRepository, 'save').mockResolvedValue(newApplication);
      jest.spyOn(usersService, 'findByOauthId').mockResolvedValue(applicant);
      jest.spyOn(mockedGDrive, 'getFolderByName').mockResolvedValue(folderId);
      jest.spyOn(mockedGDrive, 'insertFile').mockResolvedValue(fileId);

      const result = await applicationService.createApplication(
        mockCreateApplicationDTO,
        mockApplicationFiles,
        applicantId,
      );
      const flattenedMockCreateApplicationDTOO = flattenApplication(
        mockCreateApplicationDTO,
      );

      expect(result).toEqual(newApplication);
      expect(mockedRepository.save).toHaveBeenCalledTimes(1);
      expect(mockedRepository.save).toHaveBeenCalledWith(
        flattenedMockCreateApplicationDTOO,
      );
      expect(usersService.findByOauthId).toHaveBeenCalledTimes(1);
      expect(usersService.findByOauthId).toHaveBeenCalledWith(applicantId);
      expect(mockedGDrive.getFolderByName).toHaveBeenCalledTimes(1);
      expect(mockedGDrive.getFolderByName).toHaveBeenCalledWith(
        ApplicationsService.APPLICATIONS_FOLDER,
      );
      expect(mockedGDrive.insertFile).toHaveBeenCalledTimes(
        expectedFileInertions,
      );
      expect(mockedGDrive.insertFile).toHaveBeenCalledWith(
        expectedCvFileName,
        applicationFiles.cv[0].buffer,
        folderId,
      );
      if (applicationType !== ApplicationType.PHD)
        expect(mockedGDrive.insertFile).toHaveBeenCalledWith(
          expectedGradesFileName,
          applicationFiles.grades[0].buffer,
          folderId,
        );
    });
  }

  describe('createApplication', () => {
    createTestApplication(ApplicationType.BSC);
    createTestApplication(ApplicationType.MSC);
    createTestApplication(ApplicationType.PHD);

    it('deletes uploaded google drive documents if an exception is thrown', async () => {
      const expectedCvFileName = `CV_bsc_${applicant.firstName}_${applicant.lastName}_${today}`;
      const expectedGradesFileName = `Grades_bsc_${applicant.firstName}_${applicant.lastName}_${today}`;
      const testError = 'Test error';

      jest.spyOn(mockedRepository, 'save').mockRejectedValue(testError);
      jest.spyOn(usersService, 'findByOauthId').mockResolvedValue(applicant);
      jest.spyOn(mockedGDrive, 'getFolderByName').mockResolvedValue(folderId);
      jest.spyOn(mockedGDrive, 'insertFile').mockResolvedValue(fileId);
      jest.spyOn(mockedGDrive, 'deleteItem').mockResolvedValue({});

      await expect(
        applicationService.createApplication(
          mockCreateBscApplicationDTO,
          applicationFiles,
          applicantId,
        ),
      ).rejects.toThrow(InternalServerErrorException);
      expect(usersService.findByOauthId).toHaveBeenCalledTimes(1);
      expect(usersService.findByOauthId).toHaveBeenCalledWith(applicantId);

      expect(mockedGDrive.insertFile).toHaveBeenCalledTimes(2);
      expect(mockedGDrive.insertFile).toHaveBeenCalledWith(
        expectedCvFileName,
        applicationFiles.cv[0].buffer,
        folderId,
      );
      expect(mockedGDrive.insertFile).toHaveBeenCalledWith(
        expectedGradesFileName,
        applicationFiles.grades[0].buffer,
        folderId,
      );
      expect(mockedGDrive.deleteItem).toHaveBeenCalledTimes(2);
      expect(mockedGDrive.deleteItem).toHaveBeenCalledWith(fileId);
      expect(mockedGDrive.deleteItem).toHaveBeenCalledWith(fileId);
    });
  });

  describe('updateApplication', () => {
    it('should update and return an existing application', async () => {
      const updatedApplication: Application = {
        ...mockBscApplication,
        state: ApplicationState.Accepted,
      };
      jest
        .spyOn(mockedRepository, 'save')
        .mockResolvedValue(updatedApplication);
      const result = await applicationService.updateApplication(
        mockBscApplication,
      );

      expect(result).toEqual(updatedApplication);
      expect(mockedRepository.save).toHaveBeenCalledTimes(1);
      expect(mockedRepository.save).toHaveBeenCalledWith(mockBscApplication);
    });
  });
});
