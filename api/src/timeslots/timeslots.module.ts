import { Module } from '@nestjs/common';
import { TimeSlotsService } from './timeslots.service';
import { TimeSlotsController } from './timeslots.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeSlot } from './timeslot.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([TimeSlot]), UsersModule],
  providers: [TimeSlotsService],
  controllers: [TimeSlotsController],
  exports: [TimeSlotsService],
})
export class TimeSlotsModule {}
