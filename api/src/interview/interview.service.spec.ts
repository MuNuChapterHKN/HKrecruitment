import { InterviewService } from './interview.service';
import { TestBed } from '@automock/jest';
import { Repository } from 'typeorm';
import { Interview } from './interview.entity';
import { CreateInterviewDto } from './create-interview.dto';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createMock } from '@golevelup/ts-jest';
import { TimeSlot } from 'src/timeslots/timeslot.entity';
import { Application } from 'src/application/application.entity';

describe('InterviewService', () => {
  let service: InterviewService;
  let model: Repository<Interview>;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(InterviewService)
      .mock<Repository<Interview>>(getRepositoryToken(Interview) as string)
      .using(createMock<Repository<Interview>>())
      .compile();

    service = unit;
    model = unitRef.get(getRepositoryToken(Interview) as string);
  });

  describe('findById', () => {
    it('should return interview if found', async () => {
      const mockInterview = new Interview();
      mockInterview.id = -1;
      jest.spyOn(model, 'findOne').mockResolvedValue(mockInterview);

      expect(await service.findById(-1)).toBe(mockInterview);
      expect(model.findOne).toHaveBeenCalledTimes(1);
    });

    it('should return null if not found', async () => {
      jest.spyOn(model, 'findOne').mockResolvedValue(null);

      expect(await service.findById(0)).toBe(null);
      expect(model.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete', () => {
    it('should delete interview', async () => {
      const mockInterview = new Interview();
      jest.spyOn(model, 'remove').mockResolvedValue(mockInterview as any);

      expect(await service.delete(mockInterview)).toBe(mockInterview);
      expect(model.remove).toHaveBeenCalledTimes(1);
      expect(model.remove).toHaveBeenCalledWith(mockInterview);
    });
  });

  describe('create', () => {
    it('should create interview', async () => {
      const mockInterview = new Interview();
      const mockInterviewDto = new CreateInterviewDto();
      const mockApplication = new Application();
      const mockTimeSlot = new TimeSlot();

      jest.spyOn(model, 'save').mockResolvedValue(mockInterview as any);
      jest.spyOn(model, 'findOne').mockResolvedValue(null);

      expect(
        await service.create(mockInterviewDto, mockApplication, mockTimeSlot),
      ).toBe(mockInterview);
      expect(model.save).toHaveBeenCalledTimes(1);
      expect(model.save).toHaveBeenCalledWith(mockInterview);
    });
  });

  describe('update', () => {
    it('should update interview', async () => {
      const mockInterview = new Interview();
      jest.spyOn(model, 'save').mockResolvedValue(mockInterview as any);

      expect(await service.update(mockInterview)).toBe(mockInterview);
      expect(model.save).toHaveBeenCalledTimes(1);
      expect(model.save).toHaveBeenCalledWith(mockInterview);
    });
  });
});
