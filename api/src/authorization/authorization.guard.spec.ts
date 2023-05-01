import { AuthorizationGuard } from './authorization.guard';
import { Reflector } from '@nestjs/core';
import { UsersService } from 'src/users/users.service';
import { Role, abilityForUser } from '@hkrecruitment/shared';
import { ExecutionContext } from '@nestjs/common';
import { TestBed } from '@automock/jest';
import { createMock } from '@golevelup/ts-jest';

describe('AuthorizationGuard', () => {
  let reflector: Reflector;
  let usersService: UsersService;
  let authorizationGuard: AuthorizationGuard;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(AuthorizationGuard).compile();

    reflector = unitRef.get(Reflector);
    usersService = unitRef.get(UsersService);
    authorizationGuard = unit;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should allow access if no policies are defined', async () => {
    const context = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({ user: {} }),
      }),
    });
    jest
      .spyOn(usersService, 'getRoleAndAbilityForOauthId')
      .mockResolvedValue([
        Role.None,
        abilityForUser({ sub: 'test', role: Role.None }),
      ]);
    const canActivate = await authorizationGuard.canActivate(context);
    expect(canActivate).toBe(true);
  });

  it('should allow access if all policies are fulfilled', async () => {
    const mockUser = {};
    const context = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({ user: mockUser }),
      }),
    });
    const handler = jest.fn(() => true);
    jest.spyOn(reflector, 'get').mockReturnValue([handler]);
    const mockAbility = abilityForUser({ sub: 'test', role: Role.None });
    jest
      .spyOn(usersService, 'getRoleAndAbilityForOauthId')
      .mockResolvedValue([Role.None, mockAbility]);

    const canActivate = await authorizationGuard.canActivate(context);
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
