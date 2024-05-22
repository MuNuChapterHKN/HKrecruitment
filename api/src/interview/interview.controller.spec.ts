import { Action, Person, Role } from '@hkrecruitment/shared';
import { InterviewController } from './interview.controller';
import { InterviewService } from './interview.service';
import { TestBed } from '@automock/jest';
import { createMockAbility } from '@hkrecruitment/shared/abilities.spec';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateInterviewDto } from './create-interview.dto';
import { AuthenticatedRequest } from 'src/authorization/authenticated-request.types';
import { createMock } from '@golevelup/ts-jest';
import { UpdateInterviewDto } from './update-interview.dto';
import { Interview } from './interview.entity';
import {
  mockInterview,
  MockCreateInterviewDTO,
  MockUpdateInterviewDTO,
  mockTimeSlot,
} from '@mocks/data';

describe('InterviewController', () => {
  let controller: InterviewController;
  let service: InterviewService;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(InterviewController).compile();

    controller = unit;
    service = unitRef.get(InterviewService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('should return an Interview if it exists', async () => {
      const mockAbility = createMockAbility(({ can }) => {
        can(Action.Read, 'Interview');
      });
      jest.spyOn(service, 'findById').mockResolvedValue(mockInterview);
      expect(await controller.findById(123, mockAbility)).toStrictEqual(
        mockInterview,
      );
      expect(service.findById).toHaveBeenCalled();
      expect(mockAbility.can).toHaveBeenCalled();
    });

    it("should throw a NotFoundException if the Interview doesn't exist", async () => {
      const mockAbility = createMockAbility(({ can }) => {
        can(Action.Read, 'Interview');
      });
      jest.spyOn(service, 'findById').mockResolvedValue(null);
      await expect(controller.findById(321, mockAbility)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.findById).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const mockReq = createMock<AuthenticatedRequest>();
    const mockInterviewDto: UpdateInterviewDto = {
      ...mockInterview,
    };
    it('should update an Interview if it exists and the user is allowed to update it', async () => {
      const mockAbility = createMockAbility(({ can }) => {
        can(Action.Update, 'Interview');
      });
      jest.spyOn(service, 'findById').mockResolvedValue(mockInterview);
      jest
        .spyOn(service, 'update')
        .mockImplementation((mockInterview) => Promise.resolve(mockInterview));
      expect(
        await controller.update(
          123,
          { ...mockInterviewDto, notes: 'Notes' },
          mockAbility,
          mockReq,
        ),
      ).toStrictEqual({ ...mockInterview, notes: 'Notes' });
      expect(service.findById).toHaveBeenCalledTimes(1);
      expect(service.update).toHaveBeenCalledTimes(1);
      expect(mockAbility.can).toHaveBeenCalled();
    });

    it("should throw a NotFoundException if the Interview doesn't exist", async () => {
      const mockAbility = createMockAbility(({ can }) => {
        can(Action.Update, 'Interview');
      });
      jest.spyOn(service, 'findById').mockResolvedValue(null);
      await expect(
        controller.update(321, mockInterviewDto, mockAbility, mockReq),
      ).rejects.toThrow(NotFoundException);
      expect(service.findById).toHaveBeenCalledTimes(1);
    });

    it('should throw a ForbiddenException if the user is not allowed to update the Interview', async () => {
      const mockAbility = createMockAbility(({ cannot }) => {
        cannot(Action.Update, 'Interview', { oauthId: 123 });
      });
      jest.spyOn(service, 'findById').mockResolvedValue(mockInterview);
      await expect(
        controller.update(123, mockInterviewDto, mockAbility, mockReq),
      ).rejects.toThrow(ForbiddenException);
      expect(service.findById).toHaveBeenCalledTimes(1);
      expect(mockAbility.can).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    const mockReq = createMock<AuthenticatedRequest>();
    const mockInterviewDto: CreateInterviewDto = {
      createdAt: new Date(2023, 0, 1),
      timeslot_id: mockTimeSlot.id,
    };

    beforeEach(() => {
      jest
        .spyOn(service, 'create')
        .mockImplementation((mockInterviewDto) =>
          Promise.resolve(mockInterview),
        );
    });

    it("should create an Interview if it doesn't exist and it's allowed", async () => {
      const mockAbility = createMockAbility(({ can }) => {
        can(Action.Create, 'Person');
      });
      jest.spyOn(service, 'findById').mockResolvedValue(null);
      expect(
        await controller.create(mockInterviewDto, mockAbility, mockReq),
      ).toStrictEqual(mockInterview);
      expect(service.findById).toHaveBeenCalledTimes(1);
      expect(service.create).toHaveBeenCalledTimes(1);
      expect(mockAbility.can).toHaveBeenCalled();
    });

    it('should throw if interview with that Id already exists', async () => {
      const mockAbility = createMockAbility(({ can }) => {
        can(Action.Create, 'Interview');
      });
      jest.spyOn(service, 'findById').mockResolvedValue(mockInterview);
      await expect(
        controller.create(mockInterviewDto, mockAbility, mockReq),
      ).rejects.toThrow(ForbiddenException);
      expect(service.findById).toHaveBeenCalledTimes(1);
      expect(service.create).not.toHaveBeenCalled();
    });

    it('should throw if the user is not allowed to create an Interview', async () => {
      const mockAbility = createMockAbility(({ cannot }) => {
        cannot(Action.Create, 'Interview', { oauthId: '312' });
      });
      jest.spyOn(service, 'findById').mockResolvedValue(null);
      await expect(
        controller.create(mockInterviewDto, mockAbility, mockReq),
      ).rejects.toThrow(ForbiddenException);
      expect(service.create).not.toHaveBeenCalled();
      expect(mockAbility.can).toHaveBeenCalled();
    });
  });
});
