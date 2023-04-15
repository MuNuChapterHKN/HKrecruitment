import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsController } from './applications.controller';

describe('ApplicationController', () => {
  let controller: ApplicationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationsController],
    }).compile();

    controller = module.get<ApplicationsController>(ApplicationsController);
  });

  it('The controller should be defined', () => {
    expect(controller).toBeDefined();
  });
});
