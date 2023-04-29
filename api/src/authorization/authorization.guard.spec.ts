import { Test, TestingModule } from '@nestjs/testing';
import { AuthorizationGuard } from './authorization.guard';
import { Reflector } from '@nestjs/core';
import { UsersService } from 'src/users/users.service';
import { Role, abilityForUser } from '@hkrecruitment/shared';

describe('AuthorizationGuard', () => {
  let reflector: Reflector;
  let usersService: UsersService;
  let authorizationGuard: AuthorizationGuard;

  beforeEach(async () => {
    // mock reflector
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorizationGuard,
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            getRoleAndAbilityForOauthId: jest.fn(),
          },
        },
      ],
    }).compile();

    reflector = module.get<Reflector>(Reflector);
    usersService = module.get<UsersService>(UsersService);
    authorizationGuard = module.get<AuthorizationGuard>(AuthorizationGuard);
  });

  it('should allow access if no policies are defined', async () => {
    const context = {
      getHandler: jest.fn(),
      switchToHttp: jest.fn().mockReturnThis(),
      getRequest: jest.fn(() => ({ user: {} })),
    };
    jest
      .spyOn(usersService, 'getRoleAndAbilityForOauthId')
      .mockResolvedValue([
        Role.None,
        abilityForUser({ sub: 'test', role: Role.None }),
      ]);
    const canActivate = await authorizationGuard.canActivate(context as any);
    expect(canActivate).toBe(true);
  });

  it('should allow access if all policies are fulfilled', async () => {
    const mockUser = {};
    const context = {
      getHandler: jest.fn(),
      switchToHttp: jest.fn().mockReturnThis(),
      getRequest: jest.fn(() => ({ user: mockUser })),
    };
    const handler = jest.fn(() => true);
    jest.spyOn(reflector, 'get').mockReturnValue([handler]);
    const mockAbility = abilityForUser({ sub: 'test', role: Role.None });
    jest
      .spyOn(usersService, 'getRoleAndAbilityForOauthId')
      .mockResolvedValue([Role.None, mockAbility]);

    const canActivate = await authorizationGuard.canActivate(context as any);
    expect(canActivate).toBe(true);
    expect(mockUser).toHaveProperty('role', Role.None);

    expect(usersService.getRoleAndAbilityForOauthId).toHaveBeenCalledTimes(1);
    expect(usersService.getRoleAndAbilityForOauthId).toHaveBeenCalledWith(
      undefined,
    );

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(mockAbility);
  });
});
