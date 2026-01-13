import { Controller, Param, Post, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AuthGuard } from 'src/guard/auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
@ApiTags('Attendance Logs')
@Controller('attendance')
@ApiBearerAuth('defaultBearerAuth')
@UseGuards(AuthGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('check-in/:userId')
  checkIn(@Param('userId') userId: string) {
    return this.attendanceService.checkIn(userId);
  }

  @Post('check-out/:userId')
  checkOut(@Param('userId') userId: string) {
    return this.attendanceService.checkOut(userId);
  }
}
