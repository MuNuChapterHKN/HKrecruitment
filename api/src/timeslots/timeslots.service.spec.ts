import { mockTimeSlot, testDate } from '@mocks/data';
import { mockedRepository } from '@mocks/repositories';
import { TestingModule, Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TimeSlot } from './timeslot.entity';
import { TimeSlotsService } from './timeslots.service';

describe('TimeSlotsService', () => {
  let timeSlotService: TimeSlotsService;

  /************* Test setup ************/

  beforeAll(() => {
    jest
      .spyOn(global, 'Date')
      .mockImplementation(() => testDate as unknown as string);
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimeSlotsService,
        {
          provide: getRepositoryToken(TimeSlot),
          useValue: mockedRepository,
        },
      ],
    }).compile();

    timeSlotService = module.get<TimeSlotsService>(TimeSlotsService);
  });

  afterEach(() => jest.clearAllMocks());

  /*************** Tests ***************/

  it('should be defined', () => {
    expect(timeSlotService).toBeDefined();
  });

  describe('deleteTimeSlot', () => {
    it('should remove the specified timeslot from the database', async () => {
      jest.spyOn(mockedRepository, 'remove').mockResolvedValue(mockTimeSlot);
      const result = await timeSlotService.deleteTimeSlot(mockTimeSlot);
      expect(result).toEqual(mockTimeSlot);
      expect(mockedRepository.remove).toHaveBeenCalledTimes(1);
    });
  });

  describe('listTimeSlots', () => {
    it('should return all timeslots', async () => {
      jest.spyOn(mockedRepository, 'find').mockResolvedValue([mockTimeSlot]);
      const result = await timeSlotService.listTimeSlots();
      expect(result).toEqual([mockTimeSlot]);
      expect(mockedRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('findById', () => {
    it('should return the timeslot with the specified id', async () => {
      jest.spyOn(mockedRepository, 'findBy').mockResolvedValue([mockTimeSlot]);
      const result = await timeSlotService.findById(mockTimeSlot.id);
      expect(result).toEqual(mockTimeSlot);
      expect(mockedRepository.findBy).toHaveBeenCalledTimes(1);
    });
  });

  describe('createTimeSlot', () => {
    it('should create a new timeslot', async () => {
      jest.spyOn(mockedRepository, 'save').mockResolvedValue(mockTimeSlot);
      const result = await timeSlotService.createTimeSlot(mockTimeSlot);
      expect(result).toEqual(mockTimeSlot);
      expect(mockedRepository.save).toHaveBeenCalledTimes(1);
    });
  });
});
