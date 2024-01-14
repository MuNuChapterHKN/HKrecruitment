import { TestBed } from '@automock/jest';
import { mockTimeSlot, testDateTimeEnd, testDateTimeStart } from '@mocks/data';
import { TimeSlotsController } from './timeslots.controller';
import { TimeSlotsService } from './timeslots.service';
import { testDateTime10Minutes } from '@mocks/data';
import { testDateTime3Hours } from '@mocks/data';

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

  // Create a time slot
  describe('createTimeSlot', () => {
    it('should allow creating a valid time slot', async () => {
      const timeSlot = {
        start: mockTimeSlot.start,
        end: mockTimeSlot.end,
      };

      jest.spyOn(service, 'countOverlappingTimeSlots').mockResolvedValue(0);
      jest.spyOn(service, 'createTimeSlot').mockResolvedValue(mockTimeSlot);

      const result = await controller.createTimeSlot(timeSlot);

      expect(result).toEqual(mockTimeSlot);
    });

    it('should throw an error if the duration is less than 30 minutes', async () => {
      const timeSlot = {
        start: testDateTimeStart,
        end: testDateTime10Minutes,
      };

      await expect(controller.createTimeSlot(timeSlot)).rejects.toThrow(
        'The duration of the time slot must be at least 30 minutes',
      );
    });

    it('should throw an error if the duration is more than 60 minutes', async () => {
      const timeSlot = {
        start: testDateTimeStart,
        end: testDateTime3Hours,
      };

      await expect(controller.createTimeSlot(timeSlot)).rejects.toThrow(
        'The duration of the time slot must be at most 60 minutes',
      );
    });

    it('should throw an error if the time slot overlaps with an existing time slot', async () => {
      const timeSlot = {
        start: testDateTimeStart,
        end: testDateTimeEnd,
      };

      jest.spyOn(service, 'countOverlappingTimeSlots').mockResolvedValue(1);

      await expect(controller.createTimeSlot(timeSlot)).rejects.toThrow(
        'The time slot overlaps with existing time slots',
      );
    });
  });

  describe('deleteTimeSlot', () => {
    it('should allow deleting an existing time slot', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(mockTimeSlot);
      jest.spyOn(service, 'deleteTimeSlot').mockResolvedValue(mockTimeSlot);

      await expect(controller.deleteTimeSlot(mockTimeSlot.id)).resolves.toEqual(
        mockTimeSlot,
      );
      expect(service.deleteTimeSlot).toHaveBeenCalledWith(mockTimeSlot);
      expect(service.deleteTimeSlot).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if the time slot does not exist', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(null);
      jest.spyOn(service, 'deleteTimeSlot').mockResolvedValue(mockTimeSlot);

      await expect(
        controller.deleteTimeSlot(mockTimeSlot.id),
      ).rejects.toThrowError('Time slot not found');
      expect(service.deleteTimeSlot).toHaveBeenCalledTimes(0);
    });
  });
});
