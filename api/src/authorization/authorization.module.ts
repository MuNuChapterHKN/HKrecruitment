import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';

@Module({
  providers: [UsersModule],
})
export class AuthorizationModule {}
