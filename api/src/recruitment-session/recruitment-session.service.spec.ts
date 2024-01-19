import { mockRecruitmentSession, testDate } from '@mocks/data';
import { mockedRepository } from '@mocks/repositories';
import { TestingModule, Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RecruitmentSession } from './recruitment-session.entity';
import { RecruitmentSessionService } from './recruitment-session.service';

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

  describe('deleteRecruitmentSession', () => {
    it('should remove the specified recruitment session from the database', async () => {
      jest
        .spyOn(mockedRepository, 'remove')
        .mockResolvedValue(mockRecruitmentSession);
      const result = await recruitmentSessionService.deletRecruitmentSession(
        mockRecruitmentSession,
      );
      expect(result).toEqual(mockRecruitmentSession);
      expect(mockedRepository.remove).toHaveBeenCalledTimes(1);
    });
  });
});
