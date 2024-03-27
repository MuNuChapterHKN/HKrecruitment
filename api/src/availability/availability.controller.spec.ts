import { mockAvailability, mockCreateAvailabilityDto, mockClerk, mockTimeSlot, testDate } from 'src/mocks/data';
import { createMock } from '@golevelup/ts-jest';
import { AvailabilityController } from './availability.controller';
import { AvailabilityService } from './availability.service';
import { TestBed } from '@automock/jest';
import { AuthenticatedRequest } from 'src/authorization/authenticated-request.types';
import { UsersService } from 'src/users/users.service';
import { TimeSlotsService } from 'src/timeslots/timeslots.service';
import { Action } from '@hkrecruitment/shared';
import { createMockAbility } from '@hkrecruitment/shared/abilities.spec';

describe('AvailabilityController', () => {
  let controller: AvailabilityController;
  let availabilityService: AvailabilityService;
  let userService: UsersService;
  let timeslotService: TimeSlotsService;


  /************* Test setup ************/

  beforeAll(() => {
    jest
      .spyOn(global, 'Date')
      .mockImplementation(() => testDate as unknown as string);
  });

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(AvailabilityController).compile();

    controller = unit;
    availabilityService = unitRef.get(AvailabilityService);
    userService = unitRef.get(UsersService);
    timeslotService = unitRef.get(TimeSlotsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(availabilityService).toBeDefined();
    expect(userService).toBeDefined();
    expect(timeslotService).toBeDefined();
  });

  // CRUD OPERATIONS

  describe('createAvailability', () => {
    it('should allow creating a valid availability', async () => {

      const mockRequest = getMockRequest();

      jest.spyOn(userService, 'findByOauthId').mockResolvedValue(mockClerk);
      jest.spyOn(timeslotService, 'findById').mockResolvedValue(mockTimeSlot);
      jest
        .spyOn(availabilityService, 'createAvailability')
        .mockResolvedValue(mockAvailability);

      const result = await controller.createAvailability(mockCreateAvailabilityDto, mockRequest);

      expect(result).toEqual(mockAvailability);
    });

    it('should throw an error if the availability is invalid', async () => {
      const mockRequest = getMockRequest();

      jest.spyOn(userService, 'findByOauthId').mockResolvedValue(mockClerk);
      jest.spyOn(timeslotService, 'findById').mockResolvedValue(mockTimeSlot);
      jest.spyOn(availabilityService, 'createAvailability').mockResolvedValue(undefined);

      await expect(
        controller.createAvailability(mockCreateAvailabilityDto, mockRequest),
      ).rejects.toThrowError();
    });

    it('should throw an error if the timeslot does not exist', async () => {
      const mockRequest = getMockRequest();

      jest.spyOn(timeslotService, 'findById').mockResolvedValue(null);

      await expect(
        controller.createAvailability(mockCreateAvailabilityDto, mockRequest),
      ).rejects.toThrowError('Timeslot not found');
    });

    it('should throw an error if the user does not exist', async () => {

      const mockRequest = getMockRequest();

      jest.spyOn(timeslotService, 'findById').mockResolvedValue(mockTimeSlot);
      jest.spyOn(userService, 'findByOauthId').mockResolvedValue(null);

      await expect(
        controller.createAvailability(mockCreateAvailabilityDto, mockRequest),
      ).rejects.toThrowError('User not found');
    });

    it('should throw a conflict error if an availability already exists for the user in the same timeslot', async () => {
      const mockRequest = getMockRequest();

      jest.spyOn(userService, 'findByOauthId').mockResolvedValue(mockClerk);
      jest.spyOn(timeslotService, 'findById').mockResolvedValue(mockTimeSlot);
      jest.spyOn(availabilityService, 'findByUserAndTimeSlot').mockResolvedValue(mockAvailability);

      await expect(
        controller.createAvailability(mockCreateAvailabilityDto, mockRequest),
      ).rejects.toThrowError('Availability already exists for this timeslot');
    });
  });

  // Delete an availability
  describe('deleteAvailability', () => {
    it('should allow deleting an availability', async () => {
      const mockAbility = createMockAbility(({ can }) => {
        can(Action.Delete, 'Availability');
      });
      const mockReq = createMock<AuthenticatedRequest>();
      mockReq.user.sub = mockAvailability.user.oauthId;

      jest.spyOn(availabilityService, 'findById').mockResolvedValue(mockAvailability);
      jest
        .spyOn(availabilityService, 'deleteAvailability')
        .mockResolvedValue(mockAvailability);

      await expect(
        controller.deleteAvailability(mockAbility, mockAvailability.id, mockReq),
      ).resolves.toEqual(mockAvailability);
    });

    it('should throw an error if the user does not have the ability to delete the availability', async () => {
      const mockAbility = createMockAbility(({ cannot }) => {
        cannot(Action.Delete, 'Availability');
      });
      const mockReq = createMock<AuthenticatedRequest>();
      mockReq.user.sub = '123';

      jest.spyOn(availabilityService, 'findById').mockResolvedValue(mockAvailability);
      await expect(
        controller.deleteAvailability(mockAbility, mockAvailability.id, mockReq),
      ).rejects.toThrowError('Forbidden');
    });

    it("should throw an error if the user tries to delete someone else's availability", async () => {
      const mockAbility = createMockAbility(({ can }) => {
        can(Action.Delete, 'Availability');
      });
      const mockReq = createMock<AuthenticatedRequest>();
      mockReq.user.sub = '345';

      jest.spyOn(availabilityService, 'findById').mockResolvedValue(mockAvailability);
      await expect(
        controller.deleteAvailability(mockAbility, mockAvailability.id, mockReq),
      ).rejects.toThrowError('Forbidden');
    });

    it('should throw an error if the availability does not exist', async () => {
      const mockAbility = createMockAbility(({ can }) => {
        can(Action.Create, 'Availability');
      });
      const mockReq = createMock<AuthenticatedRequest>();
      mockReq.user.sub = '123';

      jest.spyOn(availabilityService, 'findById').mockResolvedValue(undefined);

      await expect(
        controller.deleteAvailability(mockAbility, mockAvailability.id, mockReq),
      ).rejects.toThrowError('Not Found');
    });

    // TODO: Delete an availability that is in use, where the user is optional
    // TODO: Delete an availability that is in use, with an existing replacement
    // TODO: Delete an availability that is in use, with no existing replacement
  });
});

function getMockRequest() {
  const mockRequest = createMock<AuthenticatedRequest>();
  mockRequest.user.sub = '123';
  return mockRequest;
}
