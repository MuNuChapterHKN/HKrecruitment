import { createMockAbility } from '@hkrecruitment/shared/abilities.spec';
import { RecruitmentSessionController } from './recruitment-session.controller';
import { RecruitmentSessionService } from './recruitment-session.service';
import { Action, RecruitmentSessionState } from '@hkrecruitment/shared';
import { TestBed } from '@automock/jest';
import { RecruitmentSessionResponseDto } from './recruitment-session-response.dto';
import { RecruitmentSession } from './recruitment-session.entity';
import {
  mockRecruitmentSession,
  mockUpdateRecruitmentSessionDto,
  mockCreateRecruitmentSessionDto,
  testDate,
} from '@mocks/data';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateRecruitmentSessionDto } from './update-recruitment-session.dto';

describe('RecruitmentSessionController', () => {
  let controller: RecruitmentSessionController;
  let service: RecruitmentSessionService;

  /************* Test setup ************/

  beforeAll(() => {
    jest
      .spyOn(global, 'Date')
      .mockImplementation(() => testDate as unknown as string);
  });

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(
      RecruitmentSessionController,
    ).compile();

    controller = unit;
    service = unitRef.get(RecruitmentSessionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('getActive RecruitmentSession', () => {
    it('should return an active recruitment session if it exists', async () => {
      const mockAbility = createMockAbility(({ can }) => {
        can(Action.Read, 'RecruitmentSession');
      });
      jest
        .spyOn(service, 'findActiveRecruitmentSession')
        .mockResolvedValue([mockRecruitmentSession]);
      const result = await controller.findActive(mockAbility);
      const expectedApp = {
        ...mockRecruitmentSession,
      } as RecruitmentSessionResponseDto;
      expect(result).toEqual(expectedApp);
      expect(service.findActiveRecruitmentSession).toHaveBeenCalledTimes(1);
      expect(mockAbility.can).toHaveBeenCalled();
    });

    it("should throw a ForbiddenException if the user can't read the recruitment session", async () => {
      const mockAbility = createMockAbility(({ cannot }) => {
        cannot(Action.Read, 'RecruitmentSession');
      });
      jest
        .spyOn(service, 'findActiveRecruitmentSession')
        .mockResolvedValue([mockRecruitmentSession]);
      const result = controller.findActive(mockAbility);
      await expect(result).rejects.toThrow(ForbiddenException);
      expect(service.findActiveRecruitmentSession).toHaveBeenCalledTimes(1);
      expect(mockAbility.can).toHaveBeenCalled();
    });
  });

  describe('createRecruitmentSession', () => {
    // it('should create a recruitment session', async () => {
    //   const expectedRecruitmentSession = {
    //     ...mockRecruitmentSession,
    //   } as RecruitmentSessionResponseDto;
    //   jest
    //     .spyOn(service, 'createRecruitmentSession')
    //     .mockResolvedValue(mockRecruitmentSession);
    //   const result = await controller.createRecruitmentSession(
    //     mockCreateRecruitmentSessionDto,
    //   );
    //   expect(result).toEqual(expectedRecruitmentSession);
    //   expect(service.createRecruitmentSession).toHaveBeenCalledTimes(1);
    //   expect(service.createRecruitmentSession).toHaveBeenCalledWith(
    //     mockCreateRecruitmentSessionDto,
    //   );
    // });

    it('should throw a ConflictException if there is already an active recruitment session', async () => {
      jest
        .spyOn(service, 'findActiveRecruitmentSession')
        .mockResolvedValue([mockRecruitmentSession]);
      const result = controller.createRecruitmentSession(
        mockCreateRecruitmentSessionDto,
      );
      await expect(result).rejects.toThrow(ConflictException);
      expect(service.findActiveRecruitmentSession).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateRecruitmentSession', () => {
    it('should update a recruitment session', async () => {
      const mockAbility = createMockAbility(({ can }) => {
        can(Action.Update, 'RecruitmentSession');
      });
      const mockUpdatedRecruitmentSession = {
        ...mockRecruitmentSession,
        ...mockUpdateRecruitmentSessionDto,
      } as RecruitmentSession;
      const expectedRecruitmentSession = {
        id: mockUpdatedRecruitmentSession.id,
        state: mockUpdatedRecruitmentSession.state,
        createdAt: mockUpdatedRecruitmentSession.createdAt,
      } as RecruitmentSessionResponseDto;
      jest
        .spyOn(service, 'findRecruitmentSessionById')
        .mockResolvedValue([mockRecruitmentSession]);
      jest
        .spyOn(service, 'updateRecruitmentSession')
        .mockResolvedValue(mockUpdatedRecruitmentSession);
      const result = await controller.updateRecruitmentSession(
        mockRecruitmentSession.id,
        mockUpdateRecruitmentSessionDto,
        mockAbility,
      );
      expect(result).toEqual(expectedRecruitmentSession);
      expect(service.findRecruitmentSessionById).toHaveBeenCalledTimes(1);
      expect(service.findRecruitmentSessionById).toHaveBeenCalledWith(
        mockRecruitmentSession.id,
      );
      expect(service.updateRecruitmentSession).toHaveBeenCalledTimes(1);
      expect(service.updateRecruitmentSession).toHaveBeenCalledWith({
        ...mockRecruitmentSession,
        lastModified: testDate,
      });
    });

    it('should throw a NotFoundException if the recruitment session does not exist', async () => {
      const mockAbility = createMockAbility(({ can }) => {
        can(Action.Update, 'RecruitmentSession');
      });
      jest.spyOn(service, 'findRecruitmentSessionById').mockResolvedValue([]);
      const result = controller.updateRecruitmentSession(
        mockRecruitmentSession.id,
        mockUpdateRecruitmentSessionDto,
        mockAbility,
      );
      await expect(result).rejects.toThrow(NotFoundException);
      expect(service.findRecruitmentSessionById).toHaveBeenCalledTimes(1);
      expect(service.findRecruitmentSessionById).toHaveBeenCalledWith(
        mockRecruitmentSession.id,
      );
    });

    it("should throw a ForbiddenException if the user can't update the recruitment session", async () => {
      const mockAbility = createMockAbility(({ cannot }) => {
        cannot(Action.Update, 'RecruitmentSession');
      });
      jest
        .spyOn(service, 'findRecruitmentSessionById')
        .mockResolvedValue([mockRecruitmentSession]);
      const result = controller.updateRecruitmentSession(
        mockRecruitmentSession.id,
        mockUpdateRecruitmentSessionDto,
        mockAbility,
      );
      await expect(result).rejects.toThrow(ForbiddenException);
      expect(service.findRecruitmentSessionById).toHaveBeenCalledTimes(1);
      expect(service.findRecruitmentSessionById).toHaveBeenCalledWith(
        mockRecruitmentSession.id,
      );
    });

    it("should throw a ConflictException when updating a RecruitmentSection state to 'Active' and there is already an active recruitment session", async () => {
      const mockAbility = createMockAbility(({ can }) => {
        can(Action.Update, 'RecruitmentSession');
      });
      const mockRecruitmentSessionToUpdate = {
        ...mockRecruitmentSession,
        state: RecruitmentSessionState.Concluded,
        id: 1,
      } as RecruitmentSession;
      const activeRecruitmentSession = {
        ...mockRecruitmentSession,
        id: 2,
        state: RecruitmentSessionState.Active,
      } as RecruitmentSession;
      const updateRecruitmentSessionDto = {
        state: RecruitmentSessionState.Active,
      } as UpdateRecruitmentSessionDto;
      jest
        .spyOn(service, 'findRecruitmentSessionById')
        .mockResolvedValue([mockRecruitmentSessionToUpdate]);
      jest
        .spyOn(service, 'findActiveRecruitmentSession')
        .mockResolvedValue([activeRecruitmentSession]);
      const result = controller.updateRecruitmentSession(
        mockRecruitmentSessionToUpdate.id,
        updateRecruitmentSessionDto,
        mockAbility,
      );
      await expect(result).rejects.toThrow(ConflictException);
      expect(service.findRecruitmentSessionById).toHaveBeenCalledTimes(1);
      expect(service.findRecruitmentSessionById).toHaveBeenCalledWith(
        mockRecruitmentSession.id,
      );
      expect(service.findActiveRecruitmentSession).toHaveBeenCalledTimes(1);
    });

    it("shouldn't throw a ConflictException when updating the currentyl active RecruitmentSection state to 'Active'", async () => {
      const mockAbility = createMockAbility(({ can }) => {
        can(Action.Update, 'RecruitmentSession');
      });
      const mockRecruitmentSessionToUpdate = {
        ...mockRecruitmentSession,
        state: RecruitmentSessionState.Concluded,
        id: 1,
      } as RecruitmentSession;
      const activeRecruitmentSession = {
        ...mockRecruitmentSession,
        id: 1,
        state: RecruitmentSessionState.Active,
      } as RecruitmentSession;
      const updateRecruitmentSessionDto = {
        state: RecruitmentSessionState.Active,
      } as UpdateRecruitmentSessionDto;
      jest
        .spyOn(service, 'findRecruitmentSessionById')
        .mockResolvedValue([mockRecruitmentSessionToUpdate]);
      jest
        .spyOn(service, 'findActiveRecruitmentSession')
        .mockResolvedValue([activeRecruitmentSession]);
      const result = controller.updateRecruitmentSession(
        mockRecruitmentSessionToUpdate.id,
        updateRecruitmentSessionDto,
        mockAbility,
      );
      await expect(result).resolves.not.toThrow(ConflictException);
      expect(service.findRecruitmentSessionById).toHaveBeenCalledTimes(1);
      expect(service.findRecruitmentSessionById).toHaveBeenCalledWith(
        mockRecruitmentSession.id,
      );
    });

    it("should throw a ConflictException when updating a RecruitmentSection state to 'Concluded' and there are pending interviews", async () => {
      const mockAbility = createMockAbility(({ can }) => {
        can(Action.Update, 'RecruitmentSession');
      });
      const mockRecruitmentSessionToUpdate = {
        ...mockRecruitmentSession,
        state: RecruitmentSessionState.Active,
        id: 1,
      } as RecruitmentSession;
      const updateRecruitmentSessionDto = {
        state: RecruitmentSessionState.Concluded,
      } as UpdateRecruitmentSessionDto;
      jest
        .spyOn(service, 'findRecruitmentSessionById')
        .mockResolvedValue([mockRecruitmentSessionToUpdate]);
      jest
        .spyOn(service, 'sessionHasPendingInterviews')
        .mockResolvedValue(true);
      const result = controller.updateRecruitmentSession(
        mockRecruitmentSessionToUpdate.id,
        updateRecruitmentSessionDto,
        mockAbility,
      );
      await expect(result).rejects.toThrow(ConflictException);
      expect(service.findRecruitmentSessionById).toHaveBeenCalledTimes(1);
      expect(service.findRecruitmentSessionById).toHaveBeenCalledWith(
        mockRecruitmentSession.id,
      );
      expect(service.sessionHasPendingInterviews).toHaveBeenCalledTimes(1);
      expect(service.sessionHasPendingInterviews).toHaveBeenCalledWith(
        mockRecruitmentSessionToUpdate,
      );
    });
  });

  describe('deleteRecruitmentSession', () => {
    it('should delete a recruitment session', async () => {
      const mockDeletedRecruitmentSession = {
        ...mockRecruitmentSession,
      } as RecruitmentSession;
      const expectedRecruitmentSession = {
        id: mockDeletedRecruitmentSession.id,
        state: mockDeletedRecruitmentSession.state,
        createdAt: mockDeletedRecruitmentSession.createdAt,
      } as RecruitmentSessionResponseDto;
      jest
        .spyOn(service, 'findRecruitmentSessionById')
        .mockResolvedValue([mockRecruitmentSession]);
      jest
        .spyOn(service, 'deleteRecruitmentSession')
        .mockResolvedValue(mockDeletedRecruitmentSession);
      const result = await controller.deleteRecruitmentSession(
        mockRecruitmentSession.id,
      );
      expect(result).toEqual(expectedRecruitmentSession);
      expect(service.findRecruitmentSessionById).toHaveBeenCalledTimes(1);
      expect(service.findRecruitmentSessionById).toHaveBeenCalledWith(
        mockRecruitmentSession.id,
      );
      expect(service.deleteRecruitmentSession).toHaveBeenCalledTimes(1);
      expect(service.deleteRecruitmentSession).toHaveBeenCalledWith(
        mockRecruitmentSession,
      );
    });

    it('should throw a NotFoundException if the recruitment session does not exist', async () => {
      jest.spyOn(service, 'findRecruitmentSessionById').mockResolvedValue([]);
      const result = controller.deleteRecruitmentSession(
        mockRecruitmentSession.id,
      );
      await expect(result).rejects.toThrow(NotFoundException);
      expect(service.findRecruitmentSessionById).toHaveBeenCalledTimes(1);
      expect(service.findRecruitmentSessionById).toHaveBeenCalledWith(
        mockRecruitmentSession.id,
      );
    });

    // it('should throw a ConflictException when deleting a RecruitmentSection that has pending interviews', async () => {
    //   const mockRecruitmentSessionToDelete = {
    //     ...mockRecruitmentSession,
    //     state: RecruitmentSessionState.Active,
    //     id: 1,
    //   } as RecruitmentSession;
    //   jest
    //     .spyOn(service, 'findRecruitmentSessionById')
    //     .mockResolvedValue([mockRecruitmentSessionToDelete]);
    //   jest
    //     .spyOn(service, 'sessionHasPendingInterviews')
    //     .mockResolvedValue(true);
    //   const result = controller.deleteRecruitmentSession(
    //     mockRecruitmentSessionToDelete.id,
    //   );
    //   await expect(result).rejects.toThrow(ConflictException);
    //   expect(service.findRecruitmentSessionById).toHaveBeenCalledTimes(1);
    //   expect(service.findRecruitmentSessionById).toHaveBeenCalledWith(
    //     mockRecruitmentSession.id,
    //   );
    //   expect(service.sessionHasPendingInterviews).toHaveBeenCalledTimes(1);
    //   expect(service.sessionHasPendingInterviews).toHaveBeenCalledWith(
    //     mockRecruitmentSessionToDelete,
    //   );
    // });
  });
});
