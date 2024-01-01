import { testDate } from '@mocks/data';
import { Test, TestingModule } from '@nestjs/testing';
import { AvailabilityService } from './availability.service';
import { Availability } from './availability.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mockedRepository } from '@mocks/repositories';

describe('AvailabilityService', () => {
  let service: AvailabilityService;

  /************* Test setup ************/

  beforeAll(() => {
    jest
      .spyOn(global, 'Date')
      .mockImplementation(() => testDate as unknown as string);
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvailabilityService,
        {
          provide: getRepositoryToken(Availability),
          useValue: mockedRepository,
        },
      ],
    }).compile();

    service = module.get<AvailabilityService>(AvailabilityService);
  });

  afterEach(() => jest.clearAllMocks());

  /*************** Tests ***************/

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
