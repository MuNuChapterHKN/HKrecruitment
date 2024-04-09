import { mockGenerateTimeSlots, mockTimeSlot, testDate } from 'src/mocks/data';
import { mockedRepository } from 'src/mocks/repositories';
import { TestingModule, Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TimeSlot } from './timeslot.entity';
import { TimeSlotsService } from './timeslots.service';
import { mockDataSource } from 'src/mocks/data-sources';

describe('TimeSlotsService', () => {
  let timeSlotService: TimeSlotsService;
  let mockDate: jest.SpyInstance;

  /************* Test setup ************/

  beforeAll(() => {
    mockDate = jest
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

  describe('createRecruitmentSessionTimeSlots', () => {
    it('should create recruitment session time slots', async () => {
      const expectedTimeSlots: Partial<TimeSlot>[] = [
        {
          start: new Date('2023-01-01T10:30:00'),
          end: new Date('2023-01-01T11:00:00'),
        },
        {
          start: new Date('2023-01-01T11:00:00'),
          end: new Date('2023-01-01T11:30:00'),
        },
        {
          start: new Date('2023-01-01T10:00:00'),
          end: new Date('2022-01-01T11:00:00'),
        },
        {
          start: new Date('2023-01-01T10:00:00'),
          end: new Date('2022-01-01T11:00:00'),
        },
      ];

      mockDataSource.setMockResults({ TimeSlot: { save: expectedTimeSlots } });
      const queryRunner = mockDataSource.createQueryRunner();
      const result = await timeSlotService.createRecruitmentSessionTimeSlots(
        queryRunner,
        mockGenerateTimeSlots,
      );

      expect(result).toEqual(expectedTimeSlots);
      expect(
        queryRunner.manager.getRepository(TimeSlot).save,
      ).toHaveBeenCalledTimes(1);
    });
  });

  describe('generateTimeSlots', () => {
    it('should generate time slots', () => {
      mockDate.mockRestore();
      const slotDuration = 60;
      const interviewStart = new Date('2022-01-01T09:00:00');
      const interviewEnd = new Date('2022-01-01T12:00:00');
      const days = [new Date('2022-01-01'), new Date('2022-01-03')];
      const expectedTimeSlots: Partial<TimeSlot>[] = [
        {
          start: new Date('2022-01-01T09:00:00'),
          end: new Date('2022-01-01T10:00:00'),
        },
        {
          start: new Date('2022-01-03T09:00:00'),
          end: new Date('2022-01-03T10:00:00'),
        },
        {
          start: new Date('2022-01-01T10:00:00'),
          end: new Date('2022-01-01T11:00:00'),
        },
        {
          start: new Date('2022-01-03T10:00:00'),
          end: new Date('2022-01-03T11:00:00'),
        },
        {
          start: new Date('2022-01-01T11:00:00'),
          end: new Date('2022-01-01T12:00:00'),
        },
        {
          start: new Date('2022-01-03T11:00:00'),
          end: new Date('2022-01-03T12:00:00'),
        },
      ];
      testTimeSlotsGeneration(
        timeSlotService,
        slotDuration,
        interviewStart,
        interviewEnd,
        days,
        expectedTimeSlots,
      );
    });

    it("shouldn't generate time slots that overflow interviewEnd time", () => {
      mockDate.mockRestore();
      const slotDuration = 50;
      const interviewStart = new Date('2022-02-02T09:00:00');
      const interviewEnd = new Date('2022-02-02T11:00:00');
      const days = [new Date('2022-02-02'), new Date('2022-02-04')];
      const expectedTimeSlots: Partial<TimeSlot>[] = [
        {
          start: new Date('2022-02-02T09:00:00'),
          end: new Date('2022-02-02T09:50:00'),
        },
        {
          start: new Date('2022-02-04T09:00:00'),
          end: new Date('2022-02-04T09:50:00'),
        },
        {
          start: new Date('2022-02-02T09:50:00'),
          end: new Date('2022-02-02T10:40:00'),
        },
        {
          start: new Date('2022-02-04T09:50:00'),
          end: new Date('2022-02-04T10:40:00'),
        },
      ];
      testTimeSlotsGeneration(
        timeSlotService,
        slotDuration,
        interviewStart,
        interviewEnd,
        days,
        expectedTimeSlots,
      );
    });
  });
});

function testTimeSlotsGeneration(
  timeSlotService: TimeSlotsService,
  slotDuration: number,
  interviewStart: Date,
  interviewEnd: Date,
  days: Date[],
  expectedResult: Partial<TimeSlot>[],
) {
  const expectedTimeSlots: Partial<TimeSlot>[] = expectedResult.map(
    (timeSlot) =>
      ({
        ...timeSlot,
        id: undefined,
        availabilities: undefined,
      } as TimeSlot),
  );

  const result = timeSlotService.generateTimeSlots(
    slotDuration,
    interviewStart,
    interviewEnd,
    days,
  );

  expect(result).toEqual(expectedTimeSlots);
}
