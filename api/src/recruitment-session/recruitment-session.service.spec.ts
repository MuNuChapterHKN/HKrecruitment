import { mockRecruitmentSession, testDate } from 'src/mocks/data';
import { mockedRepository } from 'src/mocks/repositories';
import { TestingModule, Test } from '@nestjs/testing';
import { getRepositoryToken, getDataSourceToken } from '@nestjs/typeorm';
import { RecruitmentSession } from './recruitment-session.entity';
import { RecruitmentSessionService } from './recruitment-session.service';
import { mockedTimeSlotsService as mockedTimeSlotsServiceClass } from '@mocks/services';
import { mockDataSource } from 'src/mocks/data-sources';
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
});
