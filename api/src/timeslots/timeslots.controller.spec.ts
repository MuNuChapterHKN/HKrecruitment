import { TestBed } from '@automock/jest';
import { TimeSlotsController } from './timeslots.controller';
import { TimeSlotsService } from './timeslots.service';
import { TimeSlot } from './timeslot.entity';

describe('TimeSlotController', () => {
  let controller: TimeSlotsController;
  let service: TimeSlotsService;

  /************* Test setup ************/

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(TimeSlotsController).compile();
    controller = unit;
    service = unitRef.get(TimeSlotsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  
  describe('findAvailableTimeSlots', () => {
    it('should return an array of available time slots', async () => {
      const expectedTimeSlots: TimeSlot[] = [
        {
          id: 71,
          start: new Date('2024-05-19T13:00:00.000Z'),
          end: new Date('2024-05-19T14:00:00.000Z'),
        } as TimeSlot,
        {
          id: 73,
          start: new Date('2024-05-19T15:00:00.000Z'),
          end: new Date('2024-05-19T16:00:00.000Z'),
        } as TimeSlot,
      ];

      jest
        .spyOn(service, 'findAvailableTimeSlots')
        .mockResolvedValue(expectedTimeSlots);

      // Act
      const result = await controller.findAvailableTimeSlots();

      // Assert
      expect(result).toEqual(expectedTimeSlots);
      expect(service.findAvailableTimeSlots).toHaveBeenCalledTimes(1);
    });

    it("should return an empty array if there are no available time slots", async () => {
      const expectedTimeSlots: TimeSlot[] = [];

      jest
        .spyOn(service, 'findAvailableTimeSlots')
        .mockResolvedValue(expectedTimeSlots);

      // Act
      const result = await controller.findAvailableTimeSlots();

      // Assert
      expect(result).toEqual(expectedTimeSlots);
      expect(service.findAvailableTimeSlots).toHaveBeenCalledTimes(1);
    });
  });
});
