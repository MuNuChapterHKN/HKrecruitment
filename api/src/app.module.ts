import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './configuration';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtGuard } from './authentication/jwt-guard.guard';
import { AuthorizationModule } from './authorization/authorization.module';
import { TimerInterceptor } from './timer/timer.interceptor';
import { AuthorizationGuard } from './authorization/authorization.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        ...configService.get<TypeOrmModuleOptions>('database'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthenticationModule,
    AuthorizationModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AuthorizationGuard
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TimerInterceptor
    }
  ]
})
export class AppModule {}
