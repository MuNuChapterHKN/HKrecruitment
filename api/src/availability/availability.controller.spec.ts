import { mockAvailability, testDate } from '@mocks/data';
import { AvailabilityController } from './availability.controller';
import { AvailabilityService } from './availability.service';
import { TestBed } from '@automock/jest';

describe('AvailabilityController', () => {
  let controller: AvailabilityController;
  let service: AvailabilityService;

  /************* Test setup ************/

  beforeAll(() => {
    jest
      .spyOn(global, 'Date')
      .mockImplementation(() => testDate as unknown as string);
  });

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(AvailabilityController).compile();

    controller = unit;
    service = unitRef.get(AvailabilityService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  // CRUD OPERATIONS

  describe('createAvailability', () => {
    it('should allow creating a valid availability', async () => {
      const availability = {
        state: mockAvailability.state,
        lastModified: mockAvailability.lastModified,
        timeSlot: mockAvailability.timeSlot,
        user: mockAvailability.user,
      };

      jest
        .spyOn(service, 'createAvailability')
        .mockResolvedValue(mockAvailability);

      const result = await controller.createAvailability(availability);

      expect(result).toEqual(mockAvailability);
    });
  });

  // Read an availability
  describe('findAvailabilityById', () => {
    it('should allow finding an availability by id', async () => {
      jest
        .spyOn(service, 'findAvailabilityById')
        .mockResolvedValue(mockAvailability);

      const result = await controller.findAvailabilityById(mockAvailability.id);

      expect(result).toEqual(mockAvailability);
    });
  });

  // Delete an availability
  describe('deleteAvailability', () => {
    it('should allow deleting an availability', async () => {
      jest
        .spyOn(service, 'findAvailabilityById')
        .mockResolvedValue(mockAvailability);
      jest
        .spyOn(service, 'deleteAvailability')
        .mockResolvedValue(mockAvailability);

      await expect(
        controller.deleteAvailability(mockAvailability.id),
      ).resolves.toEqual(mockAvailability);
    });
  });
});
