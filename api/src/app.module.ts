import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { ApplicationsModule } from './application/applications.module';
import { RecruitmentSessionModule } from './recruitment-session/recruitment-session.module';
import { TimeSlotsModule } from './timeslots/timeslots.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from './authentication/jwt-guard.guard';
import { AuthorizationModule } from './authorization/authorization.module';
import { AuthorizationGuard } from './authorization/authorization.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        ({
          type: configService.get('DATABASE_TYPE'),
          host: configService.get('DATABASE_HOST'),
          port: configService.get('DATABASE_PORT'),
          username: configService.get('DATABASE_USERNAME'),
          password: configService.get('DATABASE_PASSWORD'),
          database: configService.get('DATABASE_NAME'),
          synchronize: configService.get('DATABASE_SYNCHRONIZE'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
        } as TypeOrmModuleOptions),
      inject: [ConfigService],
    }),
    ApplicationsModule,
    AuthenticationModule,
    AuthorizationModule,
    RecruitmentSessionModule,
    TimeSlotsModule,
    UsersModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AuthorizationGuard,
    },
  ],
})
export class AppModule {}
