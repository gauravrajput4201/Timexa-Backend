import { Controller, Post, UseGuards, Request } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AuthGuard } from 'src/guard/auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Attendance Logs')
@ApiBearerAuth('defaultBearerAuth')
@UseGuards(AuthGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('check-in')
  checkIn(@Request() req) {
    return this.attendanceService.checkIn(req.user.userId);
  }

  @Post('check-out')
  checkOut(@Request() req) {
    return this.attendanceService.checkOut(req.user.userId);
  }
}
