import { testDate } from '@mocks/data';
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
});
