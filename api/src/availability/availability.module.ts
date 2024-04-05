import { Module } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { AvailabilityController } from './availability.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Availability } from './availability.entity';
import { UsersModule } from 'src/users/users.module';
import { TimeSlotsModule } from 'src/timeslots/timeslots.module';

@Module({
  imports: [TypeOrmModule.forFeature([Availability]), UsersModule, TimeSlotsModule],
  providers: [AvailabilityService],
  controllers: [AvailabilityController],
  exports: [AvailabilityService],
})
export class AvailabilityModule {}
