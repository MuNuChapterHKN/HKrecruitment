import { TestBed } from '@automock/jest';
import { TimeSlotsController } from './timeslots.controller';
import { TimeSlotsService } from './timeslots.service';

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
});
