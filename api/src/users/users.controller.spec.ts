import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;
  let allUsers = [
    {
      id: '1',
      firstName: 'Giorgio',
      lastName: 'Mazzei',
      sex: 'M',
      email: 'mail@example.com',
      role: 'admin',
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn().mockResolvedValue(allUsers),
            findByOauthId: jest.fn().mockResolvedValue(allUsers[0]),
            delete: jest.fn().mockResolvedValue(allUsers[0]),
            update: jest
              .fn()
              .mockImplementation((user) => Promise.resolve(user)),
            create: jest
              .fn()
              .mockImplementation((user) => Promise.resolve(user)),
            getRoleAndAbilityForOauthId: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    // expect(controller).toBeDefined();
  });
});
