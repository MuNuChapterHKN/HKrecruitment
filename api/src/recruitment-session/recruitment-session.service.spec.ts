import { mockRecruitmentSession, testDate } from 'src/mocks/data';
import { mockedRepository } from 'src/mocks/repositories';
import { TestingModule, Test } from '@nestjs/testing';
import { getRepositoryToken, getDataSourceToken } from '@nestjs/typeorm';
import { RecruitmentSession } from './recruitment-session.entity';
import { RecruitmentSessionService } from './recruitment-session.service';
import { mockedTimeSlotsService as mockedTimeSlotsServiceClass } from '@mocks/services';
import { MockedDataSource, mockDataSource } from 'src/mocks/data-sources';
import { TimeSlotsService } from 'src/timeslots/timeslots.service';
import { RecruitmentSessionState } from '@hkrecruitment/shared';

describe('Recruitment Session Service', () => {
  let recruitmentSessionService: RecruitmentSessionService;
  let mockedTimeSlotsService: TimeSlotsService;

  beforeAll(() => {
    jest
      .spyOn(global, 'Date')
      .mockImplementation(() => testDate as unknown as string);
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecruitmentSessionService,
        {
          provide: getRepositoryToken(RecruitmentSession),
          useValue: mockedRepository,
        },
        {
          provide: TimeSlotsService,
          useValue: mockedTimeSlotsServiceClass,
        },
        {
          provide: getDataSourceToken(),
          useValue: mockDataSource,
        },
      ],
    }).compile();

    mockedTimeSlotsService = module.get<TimeSlotsService>(TimeSlotsService);
    recruitmentSessionService = module.get<RecruitmentSessionService>(
      RecruitmentSessionService,
    );
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(recruitmentSessionService).toBeDefined();
  });

  describe('createRecruitmentSession', () => {
    it('should create a new recruitment session', async () => {
      const mockRecruitmentSessionRepository = {
        save: mockRecruitmentSession,
      };
      const mockedRepositories = mockDataSource.setMockResults({
        RecruitmentSession: mockRecruitmentSessionRepository,
      });
      jest
        .spyOn(mockedTimeSlotsService, 'createRecruitmentSessionTimeSlots')
        .mockResolvedValue([]);
      const result = await recruitmentSessionService.createRecruitmentSession(
        mockRecruitmentSession,
      );
      const expectedRecruitmentSession = {
        ...mockRecruitmentSession,
        createdAt: testDate,
        lastModified: testDate,
      };
      expect(result).toEqual(mockRecruitmentSession);
      expect(
        mockedRepositories['RecruitmentSession'].save,
      ).toHaveBeenCalledTimes(1);
      expect(
        mockedRepositories['RecruitmentSession'].save,
      ).toHaveBeenCalledWith(expectedRecruitmentSession);
      expect(
        mockedTimeSlotsService.createRecruitmentSessionTimeSlots,
      ).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteRecruitmentSession', () => {
    it('should remove the specified recruitment session from the database', async () => {
      jest
        .spyOn(mockedRepository, 'remove')
        .mockResolvedValue(mockRecruitmentSession);
      const result = await recruitmentSessionService.deleteRecruitmentSession(
        mockRecruitmentSession,
      );
      expect(result).toEqual(mockRecruitmentSession);
      expect(mockedRepository.remove).toHaveBeenCalledTimes(1);
      expect(mockedRepository.remove).toHaveBeenCalledWith(
        mockRecruitmentSession,
      );
    });
  });

  describe('updateRecruitmentSession', () => {
    it('should update and return an existing recruitment session', async () => {
      const updatedRecruitmentSession: RecruitmentSession = {
        ...mockRecruitmentSession,
        state: RecruitmentSessionState.Concluded,
      };
      jest
        .spyOn(mockedRepository, 'save')
        .mockResolvedValue(updatedRecruitmentSession);
      const result = await recruitmentSessionService.updateRecruitmentSession(
        mockRecruitmentSession,
      );

      expect(result).toEqual(updatedRecruitmentSession);
      expect(mockedRepository.save).toHaveBeenCalledTimes(1);
      expect(mockedRepository.save).toHaveBeenCalledWith(
        mockRecruitmentSession,
      );
    });
  });

  describe('findAllRecruitmentSessions', () => {
    it('should return all recruitment sessions', async () => {
      const recruitmentSessions = [mockRecruitmentSession];
      jest
        .spyOn(mockedRepository, 'find')
        .mockResolvedValue(recruitmentSessions);
      const result =
        await recruitmentSessionService.findAllRecruitmentSessions();
      expect(result).toEqual(recruitmentSessions);
      expect(mockedRepository.find).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array if there are no recruitment sessions', async () => {
      jest.spyOn(mockedRepository, 'find').mockResolvedValue([]);
      const result =
        await recruitmentSessionService.findAllRecruitmentSessions();
      expect(result).toEqual([]);
      expect(mockedRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('findRecruitmentSessionById', () => {
    it('should return the recruitment session with the given ID', async () => {
      jest
        .spyOn(mockedRepository, 'findBy')
        .mockResolvedValue([mockRecruitmentSession]);
      const result = await recruitmentSessionService.findRecruitmentSessionById(
        1,
      );
      expect(result).toEqual(mockRecruitmentSession);
      expect(mockedRepository.findBy).toHaveBeenCalledTimes(1);
      expect(mockedRepository.findBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('should return null if the recruitment session does not exist', async () => {
      jest.spyOn(mockedRepository, 'findBy').mockResolvedValue([]);
      const result = await recruitmentSessionService.findRecruitmentSessionById(
        1,
      );
      expect(result).toBeNull();
      expect(mockedRepository.findBy).toHaveBeenCalledTimes(1);
      expect(mockedRepository.findBy).toHaveBeenCalledWith({ id: 1 });
    });
  });

  describe('findActiveRecruitmentSession', () => {
    it('should return the active recruitment session', async () => {
      jest
        .spyOn(mockedRepository, 'findBy')
        .mockResolvedValue([mockRecruitmentSession]);
      const result =
        await recruitmentSessionService.findActiveRecruitmentSession();
      expect(result).toEqual(mockRecruitmentSession);
      expect(mockedRepository.findBy).toHaveBeenCalledTimes(1);
      expect(mockedRepository.findBy).toHaveBeenCalledWith({
        state: RecruitmentSessionState.Active,
      });
    });

    it('should return null if there is no active recruitment session', async () => {
      jest.spyOn(mockedRepository, 'findBy').mockResolvedValue([]);
      const result =
        await recruitmentSessionService.findActiveRecruitmentSession();
      expect(result).toBeNull();
      expect(mockedRepository.findBy).toHaveBeenCalledTimes(1);
      expect(mockedRepository.findBy).toHaveBeenCalledWith({
        state: RecruitmentSessionState.Active,
      });
    });
  });

  describe('sessionHasPendingInterviews', () => {
    it('should return error', async () => {
      await recruitmentSessionService
        .sessionHasPendingInterviews(mockRecruitmentSession)
        .catch((error) => {
          expect(error.message).toBe('Method not implemented.');
        });
    });
  });
});
