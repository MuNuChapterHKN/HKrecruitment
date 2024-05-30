import { mockAvailability, testDate } from 'src/mocks/data';
import { Test, TestingModule } from '@nestjs/testing';
import { AvailabilityService } from './availability.service';
import { Availability } from './availability.entity';
import { getRepositoryToken, getDataSourceToken } from '@nestjs/typeorm';
import { mockedRepository } from 'src/mocks/repositories';
import { ConflictException } from '@nestjs/common';
import { mockDataSource } from 'src/mocks/data-sources';
import { AvailabilityState } from '@hkrecruitment/shared';

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
        {
          provide: getDataSourceToken(),
          useValue: mockDataSource,
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

  // CRUD OPERATIONS

  describe('findById', () => {
    it('should return the availability with the specified id', async () => {
      jest
        .spyOn(mockedRepository, 'findBy')
        .mockResolvedValue([mockAvailability]);
      const result = await service.findById(mockAvailability.id);
      expect(result).toEqual(mockAvailability);
      expect(mockedRepository.findBy).toHaveBeenCalledTimes(1);
    });
  });

  describe('createAvailability', () => {
    it('should create a new availability', async () => {
      jest.spyOn(mockedRepository, 'save').mockResolvedValue(mockAvailability);
      const result = await service.createAvailability(mockAvailability);
      expect(result).toEqual(mockAvailability);
      expect(mockedRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateAvailability', () => {
    it('should update the availability with the specified id', async () => {
      const mockUpdatedAvailability = {
        ...mockAvailability,
        state: AvailabilityState.Interviewing,
      };
      jest
        .spyOn(mockedRepository, 'save')
        .mockResolvedValue(mockUpdatedAvailability);
      const result = await service.updateAvailability(
        mockAvailability.id,
        mockUpdatedAvailability,
      );
      expect(result).toEqual(mockUpdatedAvailability);
      expect(mockedRepository.save).toHaveBeenCalledTimes(1);
      expect(mockedRepository.save).toHaveBeenCalledWith({
        ...mockUpdatedAvailability,
        id: mockAvailability.id,
      });
    });
  });

  describe('deleteAvailability', () => {
    it('should remove the specified availability from the database', async () => {
      const mockAvailabilityRepository = {
        findOneBy: mockAvailability,
        remove: mockAvailability,
      };
      const mockedRepositories = mockDataSource.setMockResults({
        Availability: mockAvailabilityRepository,
      });
      const result = await service.deleteAvailability(mockAvailability.id);
      expect(result).toEqual(mockAvailability);
      expect(mockDataSource.createQueryRunner).toHaveBeenCalledTimes(1);
      expect(
        mockedRepositories['Availability'].findOneBy,
      ).toHaveBeenCalledTimes(1);
      expect(mockedRepositories['Availability'].findOneBy).toHaveBeenCalledWith(
        { id: mockAvailability.id },
      );
      expect(mockedRepositories['Availability'].remove).toHaveBeenCalledTimes(
        1,
      );
      expect(mockedRepositories['Availability'].remove).toHaveBeenCalledWith(
        mockAvailability,
      );
    });

    it('should throw a conflict error if the availability is in use', async () => {
      const mockAvailabilityInUse = {
        ...mockAvailability,
        state: AvailabilityState.Interviewing,
      };
      const mockAvailabilityRepository = {
        findOneBy: mockAvailabilityInUse,
        remove: mockAvailabilityInUse,
      };
      const mockedRepositories = mockDataSource.setMockResults({
        Availability: mockAvailabilityRepository,
      });
      jest
        .spyOn(mockedRepositories['Availability'], 'findOneBy')
        .mockResolvedValue(mockAvailabilityInUse);
      jest
        .spyOn(mockedRepositories['Availability'], 'remove')
        .mockResolvedValue(mockAvailabilityInUse);
      const result = service.deleteAvailability(mockAvailabilityInUse.id);
      await expect(result).rejects.toThrow(ConflictException);
      expect(mockedRepositories['Availability'].findOneBy).toHaveBeenCalledWith(
        { id: mockAvailability.id },
      );
      expect(
        mockedRepositories['Availability'].findOneBy,
      ).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAvailabilityById', () => {
    it('should return the availability with the specified id', async () => {
      jest
        .spyOn(mockedRepository, 'findBy')
        .mockResolvedValue([mockAvailability]);
      const result = await service.findById(mockAvailability.id);
      expect(result).toEqual(mockAvailability);
      expect(mockedRepository.findBy).toHaveBeenCalledTimes(1);
    });

    it('should return null if no availability is found', async () => {
      jest.spyOn(mockedRepository, 'findBy').mockResolvedValue([]);
      const result = await service.findById(mockAvailability.id);
      expect(result).toBeNull();
      expect(mockedRepository.findBy).toHaveBeenCalledTimes(1);
    });
  });

  describe('findByUserAndTimeSlot', () => {
    it('should return the availability with the specified user and time slot', async () => {
      jest
        .spyOn(mockedRepository, 'findBy')
        .mockResolvedValue([mockAvailability]);
      const result = await service.findByUserAndTimeSlot(
        mockAvailability.user,
        mockAvailability.timeSlot,
      );
      expect(result).toEqual(mockAvailability);
      expect(mockedRepository.findBy).toHaveBeenCalledTimes(1);
      expect(mockedRepository.findBy).toHaveBeenCalledWith({
        user: mockAvailability.user,
        timeSlot: mockAvailability.timeSlot,
      });
    });

    it('should return null if no availability is found', async () => {
      jest.spyOn(mockedRepository, 'findBy').mockResolvedValue([]);
      const result = await service.findByUserAndTimeSlot(
        mockAvailability.user,
        mockAvailability.timeSlot,
      );
      expect(result).toBeNull();
      expect(mockedRepository.findBy).toHaveBeenCalledTimes(1);
      expect(mockedRepository.findBy).toHaveBeenCalledWith({
        user: mockAvailability.user,
        timeSlot: mockAvailability.timeSlot,
      });
    });
  });
});
