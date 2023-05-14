import { createMockAbility } from '@hkrecruitment/shared/abilities.spec';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import {
  Action,
  ApplicationState,
  ApplicationType,
  Role,
} from '@hkrecruitment/shared';
import { TestBed } from '@automock/jest';
import { ApplicationResponseDto } from './application-response.dto';
import { plainToClass } from 'class-transformer';
import { Application } from './application.entity';
import {
  mockBscApplication,
  mockMscApplication,
  updateApplicationDTO,
  testDate,
} from '@mocks/data';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import { AuthenticatedRequest } from 'src/authorization/authenticated-request.types';
import { ApplicationFiles } from './application-types';
import { flattenApplication } from './create-application.dto';

describe('ApplicationController', () => {
  let controller: ApplicationsController;
  let service: ApplicationsService;

  /************* Test setup ************/

  beforeAll(() => {
    jest
      .spyOn(global, 'Date')
      .mockImplementation(() => testDate as unknown as string);
  });

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(ApplicationsController).compile();

    controller = unit;
    service = unitRef.get(ApplicationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('listApplications', () => {
    it('should return the list of applications', async () => {
      const mockAbility = createMockAbility(({ can }) => {
        can(Action.Read, 'Application');
      });
      const applications = [{ id: 1 }, { id: 2 }] as Application[];
      const appResponseDtos = [
        plainToClass(ApplicationResponseDto, applications[0]),
        plainToClass(ApplicationResponseDto, applications[1]),
      ];
      jest.spyOn(service, 'listApplications').mockResolvedValue(applications);

      const result = await controller.listApplications(mockAbility);

      expect(result).toEqual(appResponseDtos);
      expect(service.listApplications).toHaveBeenCalledTimes(1);
      expect(mockAbility.can).toHaveBeenCalled();
    });

    it('should return only applications that user can read', async () => {
      const mockAbility = createMockAbility(({ can }) => {
        can(Action.Read, 'Application', { applicantId: '1' });
      });
      const applications = [
        { ...mockBscApplication, applicantId: '1' },
        { ...mockMscApplication, applicantId: '2' },
      ] as Application[];
      const appResponseDtos = [
        plainToClass(ApplicationResponseDto, applications[0]),
      ];
      jest.spyOn(service, 'listApplications').mockResolvedValue(applications);

      const result = await controller.listApplications(mockAbility);

      expect(result).toEqual(appResponseDtos);
      expect(service.listApplications).toHaveBeenCalledTimes(1);
      expect(mockAbility.can).toHaveBeenCalled();
    });
  });

  describe('getApplication', () => {
    it('should return an application if it exists', async () => {
      const mockAbility = createMockAbility(({ can }) => {
        can(Action.Read, 'Application');
      });
      jest
        .spyOn(service, 'findByApplicationId')
        .mockResolvedValue(mockMscApplication);
      const result = await controller.getApplication(
        mockAbility,
        mockMscApplication.id,
      );
      const expectedApp = {
        id: mockMscApplication.id,
        state: mockMscApplication.state,
        submission: undefined,
      } as ApplicationResponseDto;
      expect(result).toEqual(expectedApp);
      expect(service.findByApplicationId).toHaveBeenCalledTimes(1);
      expect(service.findByApplicationId).toHaveBeenCalledWith(
        mockMscApplication.id,
      );
      expect(mockAbility.can).toHaveBeenCalled();
    });

    it("should throw a NotFoundException if the application doesn't exist", async () => {
      const mockAbility = createMockAbility(({ cannot }) => {
        cannot(Action.Read, 'Application');
      });
      jest.spyOn(service, 'findByApplicationId').mockResolvedValue(null);
      const result = controller.getApplication(
        mockAbility,
        mockBscApplication.id,
      );
      await expect(result).rejects.toThrow(NotFoundException);
      expect(service.findByApplicationId).toHaveBeenCalledTimes(1);
      expect(service.findByApplicationId).toHaveBeenCalledWith(
        mockBscApplication.id,
      );
    });

    it("should throw a ForbiddenException if the user can't read the application", async () => {
      const mockAbility = createMockAbility(({ cannot }) => {
        cannot(Action.Read, 'Application', { applicantId: '1' });
      });
      jest
        .spyOn(service, 'findByApplicationId')
        .mockResolvedValue({ ...mockBscApplication, applicantId: '2' });
      const result = controller.getApplication(
        mockAbility,
        mockBscApplication.id,
      );
      await expect(result).rejects.toThrow(ForbiddenException);
      expect(service.findByApplicationId).toHaveBeenCalledTimes(1);
      expect(service.findByApplicationId).toHaveBeenCalledWith(
        mockBscApplication.id,
      );
      expect(mockAbility.can).toHaveBeenCalled();
    });
  });

  describe('createApplication', () => {
    it('should create an application if the user is allowed to create it', async () => {
      const mockAbility = createMockAbility(({ can }) => {
        can(Action.Create, 'Application');
      });
      const mockReq = createMock<AuthenticatedRequest>();
      mockReq.user.sub = '123';
      const expectedApplication = {
        ...flattenApplication(mockBscApplication),
        submission: undefined,
        state: ApplicationState.New,
      } as ApplicationResponseDto;
      const mockFiles = createMock<ApplicationFiles>();
      jest
        .spyOn(service, 'createApplication')
        .mockResolvedValue(mockBscApplication);
      const result = await controller.createApplication(
        mockFiles,
        mockBscApplication,
        mockAbility,
        mockReq,
      );
      expect(result).toEqual(expectedApplication);
      expect(service.createApplication).toHaveBeenCalledTimes(1);
      expect(service.createApplication).toHaveBeenCalledWith(
        mockBscApplication,
        {},
        mockReq.user.sub,
      );
      expect(mockAbility.can).toHaveBeenCalled();
    });

    it.each([ApplicationType.BSC, ApplicationType.MSC])(
      `should require grades file for non-phd applications`,
      async (applicationType) => {
        const mockAbility = createMockAbility(({ can }) => {
          can(Action.Create, 'Application');
        });
        const mockReq = createMock<AuthenticatedRequest>();
        mockReq.user.sub = '123';
        const mockApplication =
          applicationType === ApplicationType.BSC
            ? mockBscApplication
            : mockMscApplication;
        const mockFiles = {
          cv: createMock<Express.Multer.File[]>(),
        };
        jest
          .spyOn(service, 'createApplication')
          .mockResolvedValue(mockApplication);
        const result = controller.createApplication(
          mockFiles,
          mockApplication,
          mockAbility,
          mockReq,
        );
        expect(result).rejects.toThrow(UnprocessableEntityException);
        expect(service.createApplication).toHaveBeenCalledTimes(0);
      },
    );

    it.each(Object.values(ApplicationType))(
      `should require cv file for all applications`,
      async (applicationType) => {
        const mockAbility = createMockAbility(({ can }) => {
          can(Action.Create, 'Application');
        });
        const mockReq = createMock<AuthenticatedRequest>();
        mockReq.user.sub = '123';
        const mockApplication = { type: applicationType } as Application;
        const mockFiles = {} as ApplicationFiles;
        jest
          .spyOn(service, 'createApplication')
          .mockResolvedValue(mockApplication);
        const result = controller.createApplication(
          mockFiles,
          mockApplication,
          mockAbility,
          mockReq,
        );
        expect(result).rejects.toThrow(UnprocessableEntityException);
        expect(service.createApplication).toHaveBeenCalledTimes(0);
      },
    );

    it('should throw a ForbiddenException if the user is not allowed to submit an application', async () => {
      const mockAbility = createMockAbility(({ cannot }) => {
        cannot(Action.Create, 'Application');
      });
      const mockReq = createMock<AuthenticatedRequest>();
      mockReq.user.sub = '123';
      const mockApplication = { type: ApplicationType.PHD } as Application;
      const mockFiles = {
        cv: createMock<Express.Multer.File[]>(),
      } as ApplicationFiles;
      jest
        .spyOn(service, 'createApplication')
        .mockResolvedValue(mockApplication);
      const result = controller.createApplication(
        mockFiles,
        mockApplication,
        mockAbility,
        mockReq,
      );
      expect(result).rejects.toThrow(ForbiddenException);
      expect(service.createApplication).toHaveBeenCalledTimes(0);
    });

    it('should throw a ConflictException if the user already has a pending application', async () => {
      const mockAbility = createMockAbility(({ can }) => {
        can(Action.Create, 'Application');
      });
      const mockReq = createMock<AuthenticatedRequest>();
      mockReq.user.sub = '123';
      const mockApplication = { type: ApplicationType.PHD } as Application;
      const mockFiles = {
        cv: createMock<Express.Multer.File[]>(),
      } as ApplicationFiles;
      jest
        .spyOn(service, 'createApplication')
        .mockResolvedValue(mockApplication);
      jest
        .spyOn(service, 'findActiveApplicationByApplicantId')
        .mockResolvedValue(true);
      const result = controller.createApplication(
        mockFiles,
        mockApplication,
        mockAbility,
        mockReq,
      );
      expect(result).rejects.toThrow(ConflictException);
      expect(service.createApplication).toHaveBeenCalledTimes(0);
      expect(service.findActiveApplicationByApplicantId).toHaveBeenCalledTimes(
        1,
      );
      expect(service.findActiveApplicationByApplicantId).toHaveBeenCalledWith(
        mockReq.user.sub,
      );
    });
  });

  describe('updateApplication', () => {
    it('should update an application if it exists and the user is allowed to update it', async () => {
      const mockAbility = createMockAbility(({ can }) => {
        can(Action.Update, 'Application', { applicantId: '1' });
      });
      const updateApplicationDTO = { notes: 'Nothing special here' };
      const mockReq = createMock<AuthenticatedRequest>();
      const expectedApplication = {
        id: mockBscApplication.id,
        state: mockBscApplication.state,
        submission: undefined,
      } as ApplicationResponseDto;
      const mockedApplication = { ...mockBscApplication, applicantId: '1' };
      jest
        .spyOn(service, 'findByApplicationId')
        .mockResolvedValue(mockedApplication);
      jest
        .spyOn(service, 'updateApplication')
        .mockResolvedValue({ ...mockBscApplication, ...updateApplicationDTO });
      const result = await controller.updateApplication(
        mockBscApplication.id,
        updateApplicationDTO,
        mockAbility,
        mockReq,
      );
      expect(result).toEqual(expectedApplication);
      expect(service.updateApplication).toHaveBeenCalledTimes(1);
      expect(service.updateApplication).toHaveBeenCalledWith({
        ...mockedApplication,
        ...updateApplicationDTO,
        lastModified: new Date(),
      });
      expect(mockAbility.can).toHaveBeenCalled();
    });

    it("should throw a NotFoundException if the application doesn't exist", async () => {
      const mockAbility = createMockAbility(({ can }) => {
        can(Action.Update, 'Application');
      });
      const mockReq = createMock<AuthenticatedRequest>();
      jest.spyOn(service, 'findByApplicationId').mockResolvedValue(null);
      const result = controller.updateApplication(
        mockBscApplication.id,
        updateApplicationDTO,
        mockAbility,
        mockReq,
      );
      await expect(result).rejects.toThrow(NotFoundException);
      expect(service.findByApplicationId).toHaveBeenCalledTimes(1);
      expect(service.findByApplicationId).toHaveBeenCalledWith(1);
      expect(service.updateApplication).not.toHaveBeenCalled();
    });

    it("should throw a ForbiddenException if the user can't update the application", async () => {
      const mockAbility = createMockAbility(({ can }) => {
        can(Action.Update, 'Application', { applicantId: '1' });
      });
      const mockReq = createMock<AuthenticatedRequest>();
      jest
        .spyOn(service, 'findByApplicationId')
        .mockResolvedValue({ ...mockBscApplication, applicantId: '2' });
      const result = controller.updateApplication(
        mockBscApplication.id,
        updateApplicationDTO,
        mockAbility,
        mockReq,
      );
      await expect(result).rejects.toThrow(ForbiddenException);
      expect(service.updateApplication).not.toHaveBeenCalled();
      expect(mockAbility.can).toHaveBeenCalled();
    });

    it('should throw a BadRequestException if the applicant tried to set an invalid state', async () => {
      const mockAbility = createMockAbility(({ can }) => {
        can(Action.Update, 'Application', { applicantId: '1' });
      });
      const mockReq = createMock<AuthenticatedRequest>();
      mockReq.user.role = Role.Applicant;
      jest
        .spyOn(service, 'findByApplicationId')
        .mockResolvedValue({ ...mockBscApplication, applicantId: '1' });
      const result = controller.updateApplication(
        mockBscApplication.id,
        updateApplicationDTO,
        mockAbility,
        mockReq,
      );
      await expect(result).rejects.toThrow(BadRequestException);
      expect(service.updateApplication).not.toHaveBeenCalled();
      expect(mockAbility.can).toHaveBeenCalled();
    });
  });
});
