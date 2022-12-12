import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './configuration';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { auth } from 'express-oauth2-jwt-bearer';
import { UsersModule } from './users/users.module';

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
  ],
})
export class AppModule implements NestModule {
  private readonly config: {
    issuer_url: string;
    audience: string;
  };

  constructor(private readonly configService: ConfigService) {
    this.config = this.configService.get('auth0');
  }

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        auth({
          // issuerBaseURL: this.config.issuer_url,
          // audience: this.config.audience,
          audience: 'http://hkrecruitment.org',
          issuerBaseURL: `https://dev-c8roocdl763ll5qf.eu.auth0.com/`,
        }),
      )
      .forRoutes('*');
  }
}
