import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  private readonly logger = new Logger(AuthorizationGuard.name);

  constructor(private readonly usersService: UsersService) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const role = await this.usersService.getRoleForOauthId(context.switchToHttp().getRequest().user.sub) ?? 'none';
    context.switchToHttp().getRequest().user.role = role;
    this.logger.log(`user.sub: ${context.switchToHttp().getRequest().user.sub} -> ${role}}`);
    return true;
  }
}
