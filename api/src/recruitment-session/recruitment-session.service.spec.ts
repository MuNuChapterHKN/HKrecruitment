import { mockRecruitmentSession, testDate } from '@mocks/data';
import { mockedRepository } from '@mocks/repositories';
import { TestingModule, Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RecruitmentSession } from './recruitment-session.entity';
import { RecruitmentSessionService } from './recruitment-session.service';
import { RecruitmentSessionState } from '@hkrecruitment/shared';

describe('Recruitment Session Service', () => {
  let recruitmentSessionService: RecruitmentSessionService;

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
      ],
    }).compile();

    recruitmentSessionService = module.get<RecruitmentSessionService>(
      RecruitmentSessionService,
    );
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(recruitmentSessionService).toBeDefined();
  });

  describe('createRecruitmentSession', () => {
    it('should create a recruitment session', async () => {
      jest
        .spyOn(mockedRepository, 'save')
        .mockResolvedValue(mockRecruitmentSession);
      const result = await recruitmentSessionService.createRecruitmentSession(
        mockRecruitmentSession,
      );
      expect(result).toEqual(mockRecruitmentSession);
      expect(mockedRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('should return an array of recruitment sessions', async () => {
      const recruitmentSessions: RecruitmentSession[] = [
        mockRecruitmentSession,
      ];
      jest
        .spyOn(mockedRepository, 'find')
        .mockResolvedValue(recruitmentSessions);
      const result =
        await recruitmentSessionService.findAllRecruitmentSessions();

      expect(result).toEqual(recruitmentSessions);
      expect(mockedRepository.find).toHaveBeenCalledTimes(1);
      expect(mockedRepository.find).toHaveBeenCalledWith();
    });
  });

  describe('findById', () => {
    it('should return a recruitment session by id', async () => {
      const recruitmentSessionID = 1;
      jest
        .spyOn(mockedRepository, 'findBy')
        .mockResolvedValue([mockRecruitmentSession]); // MAYBE THERE SHOULD NOT BE SQUARE BRACKETS BECAUSE THE SERVICE USES FINDONE()
      const result = await recruitmentSessionService.findRecruitmentSessionById(
        recruitmentSessionID,
      );

      expect(result).toEqual(mockRecruitmentSession);
      expect(mockedRepository.findBy).toHaveBeenCalledTimes(1);
      expect(mockedRepository.findBy).toHaveBeenLastCalledWith({
        id: recruitmentSessionID,
      });
    });

    it('should return null when no recruitment session is found', async () => {
      const recruitmentSessionID = 2;
      jest.spyOn(mockedRepository, 'findBy').mockResolvedValue([]); // MAYBE THERE SHOULD NOT BE SQUARE BRACKETS BECAUSE THE SERVICE USES FINDONE()
      const result = await recruitmentSessionService.findRecruitmentSessionById(
        recruitmentSessionID,
      );

      expect(result).toEqual(null);
      expect(mockedRepository.findBy).toHaveBeenCalledTimes(1);
      expect(mockedRepository.findBy).toHaveBeenLastCalledWith({
        id: recruitmentSessionID,
      });
    });
  });

  describe('findActive', () => {
    it('should return an active recruitment session, the only one', async () => {
      const activeState: RecruitmentSessionState =
        RecruitmentSessionState.Active;
      jest
        .spyOn(mockedRepository, 'findBy')
        .mockResolvedValue([mockRecruitmentSession]); // SQUARE BRACKETS
      const result =
        await recruitmentSessionService.findActiveRecruitmentSession();

      expect(result).toEqual(mockRecruitmentSession);
      expect(mockedRepository.findBy).toHaveBeenCalledTimes(1);
      expect(mockedRepository.findBy).toHaveBeenCalledWith({
        state: activeState,
      });
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
