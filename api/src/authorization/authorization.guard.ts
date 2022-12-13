import { abilityForUser } from '@hkrecruitment/shared';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsersService } from 'src/users/users.service';
import { CHECK_POLICIES_KEY, PolicyHandler } from './check-policies.decorator';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  private readonly logger = new Logger(AuthorizationGuard.name);

  constructor(
    private reflector: Reflector,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const role =
      (await this.usersService.getRoleForOauthId(
        context.switchToHttp().getRequest().user.sub,
      )) ?? 'none';
    context.switchToHttp().getRequest().user.role = role;
    this.logger.log(
      `user.sub: ${context.switchToHttp().getRequest().user.sub} -> ${role}}`,
    );
    const ability = abilityForUser(context.switchToHttp().getRequest().user);
    context.switchToHttp().getRequest().ability = ability;

    const handlers = this.reflector.get<PolicyHandler[]>(CHECK_POLICIES_KEY, context.getHandler()) ?? [];
    return handlers.every((handler) => handler(ability));
  }
}
