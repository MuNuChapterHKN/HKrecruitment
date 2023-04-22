import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsService } from './applications.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Application, BscApplication } from './application.entity';
import {
  ApplicationState,
  ApplicationType,
  LangLevel,
} from '@hkrecruitment/shared';

describe('ApplicationsService', () => {
  let service: ApplicationsService;
  let mockedRepository = {
    find: jest.fn(),
    findBy: jest.fn(),
    remove: jest.fn(),
    save: jest.fn(),
  };
  const mockApplication = {
    type: 'bsc',
    id: 1,
    state: 'new',
    notes: 'Notes',
    cv: 'TODO',
    itaLevel: 'B2',
    bscStudyPath: 'Computer Engineering',
    bscAcademicYear: 1,
    bscGradesAvg: 25.8,
    cfu: 50,
    grades: 'TODO',
  } as BscApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        {
          provide: getRepositoryToken(Application),
          useValue: mockedRepository,
        },
      ],
    }).compile();

    service = module.get<ApplicationsService>(ApplicationsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of applications', async () => {
      const applications: Application[] = [mockApplication];
      jest.spyOn(mockedRepository, 'find').mockResolvedValue(applications);
      const result = await service.findAll();

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
        .mockResolvedValue([mockApplication]);
      const result = await service.findByApplicationId(applicationId);

      expect(result).toEqual(mockApplication);
      expect(mockedRepository.findBy).toHaveBeenCalledTimes(1);
      expect(mockedRepository.findBy).toHaveBeenCalledWith({
        id: applicationId,
      });
    });

    it('should return null when no application is found', async () => {
      const applicationId = 2;
      jest.spyOn(mockedRepository, 'findBy').mockResolvedValue([]);
      const result = await service.findByApplicationId(applicationId);

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
      const applications: Application[] = [mockApplication];
      jest.spyOn(mockedRepository, 'findBy').mockResolvedValue(applications);
      const result = await service.findByApplicantId(applicantId);

      expect(result).toEqual(applications);
      expect(mockedRepository.findBy).toHaveBeenCalledTimes(1);
      expect(mockedRepository.findBy).toHaveBeenCalledWith({ applicantId });
    });
  });

  describe('findActiveApplicationByApplicantId', () => {
    it('should return true when an active application exists for the specified applicant', async () => {
      const applicantId = 'abc123';
      const activeApplication: Application = {
        ...mockApplication,
        state: ApplicationState.New,
      };
      jest
        .spyOn(mockedRepository, 'findBy')
        .mockResolvedValue([activeApplication]);
      const result = await service.findActiveApplicationByApplicantId(
        applicantId,
      );

      expect(result).toBe(true);
      expect(mockedRepository.findBy).toHaveBeenCalledTimes(1);
    });

    it('should return false when no application exists for the specified applicant', async () => {
      const applicantId = 'abc123';
      jest.spyOn(mockedRepository, 'findBy').mockResolvedValue([]);
      const result = await service.findActiveApplicationByApplicantId(
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
      const applications: Application[] = [mockApplication];
      jest.spyOn(mockedRepository, 'findBy').mockResolvedValue(applications);
      const result = await service.listApplications(
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
      jest.spyOn(mockedRepository, 'remove').mockResolvedValue(mockApplication);

      const result = await service.delete(mockApplication);
      expect(result).toEqual(mockApplication);
      expect(mockedRepository.remove).toHaveBeenCalledTimes(1);
    });
  });

  describe('createApplication', () => {
    it('should create and return a new application', async () => {
      const createApplicationDto = {
        applicantId: 'abc123',
        submission: new Date(2023, 0, 1),
        type: ApplicationType.PHD,
        cv: 'TODO',
        itaLevel: LangLevel.NativeSpeaker,
        state: ApplicationState.New,
        lastModified: new Date(2023, 0, 1),
      };
      const createdApplication: Application = {
        ...mockApplication,
        applicantId: createApplicationDto.applicantId,
        submission: createApplicationDto.submission,
      };
      jest
        .spyOn(mockedRepository, 'save')
        .mockResolvedValue(createdApplication);
      const result = await service.createApplication(createApplicationDto);

      expect(result).toEqual(createdApplication);
      expect(mockedRepository.save).toHaveBeenCalledTimes(1);
      expect(mockedRepository.save).toHaveBeenCalledWith(createApplicationDto);
    });
  });

  describe('updateApplication', () => {
    it('should update and return an existing application', async () => {
      const updatedApplication: Application = {
        ...mockApplication,
        state: ApplicationState.Accepted,
      };
      jest
        .spyOn(mockedRepository, 'save')
        .mockResolvedValue(updatedApplication);
      const result = await service.updateApplication(mockApplication);

      expect(result).toEqual(updatedApplication);
      expect(mockedRepository.save).toHaveBeenCalledTimes(1);
      expect(mockedRepository.save).toHaveBeenCalledWith(mockApplication);
    });
  });
});
