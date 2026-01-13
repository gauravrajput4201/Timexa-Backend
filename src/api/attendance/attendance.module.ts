import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AttendanceLog, AttendanceLogSchema } from './schemas/attendance-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AttendanceLog.name, schema: AttendanceLogSchema }]),
  ],
  providers: [AttendanceService],
  controllers: [AttendanceController]
})
export class AttendanceModule {}
