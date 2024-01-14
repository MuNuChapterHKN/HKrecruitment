import { mockAvailability, testDate } from '@mocks/data';
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

  // CRUD OPERATIONS

  describe('createAvailability', () => {
    it('should create a new availability', async () => {
      jest.spyOn(mockedRepository, 'save').mockResolvedValue(mockAvailability);
      const result = await service.createAvailability(mockAvailability);
      expect(result).toEqual(mockAvailability);
      expect(mockedRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteAvailability', () => {
    it('should remove the specified availability from the database', async () => {
      jest
        .spyOn(mockedRepository, 'remove')
        .mockResolvedValue(mockAvailability);
      const result = await service.deleteAvailability(mockAvailability);
      expect(result).toEqual(mockAvailability);
      expect(mockedRepository.remove).toHaveBeenCalledTimes(1);
    });
  });

  describe('listAvailabilities', () => {
    it('should return all availabilities', async () => {
      jest
        .spyOn(mockedRepository, 'find')
        .mockResolvedValue([mockAvailability]);
      const result = await service.listAvailabilities();
      expect(result).toEqual([mockAvailability]);
      expect(mockedRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAvailabilityById', () => {
    it('should return the availability with the specified id', async () => {
      jest
        .spyOn(mockedRepository, 'findBy')
        .mockResolvedValue([mockAvailability]);
      const result = await service.findAvailabilityById(mockAvailability.id);
      expect(result).toEqual(mockAvailability);
      expect(mockedRepository.findBy).toHaveBeenCalledTimes(1);
    });
  });
});
