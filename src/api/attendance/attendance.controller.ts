import { Controller, Post, UseGuards, Request, Get, Query } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AuthGuard } from 'src/guard/auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Attendance Logs')
@ApiBearerAuth('defaultBearerAuth')
@UseGuards(AuthGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('check-in')
  @ApiOperation({ summary: 'Check-in for authenticated user' })
  checkIn(@Request() req) {
    return this.attendanceService.checkIn(req.user.userId);
  }

  @Post('check-out')
  @ApiOperation({ summary: 'Check-out for authenticated user' })
  checkOut(@Request() req) {
    return this.attendanceService.checkOut(req.user.userId);
  }

  @Get('logs')
  @ApiOperation({ summary: 'Get attendance logs with pagination and sorting' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Records per page (default: 10, max: 100)' })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['date', 'totalMinutes'], description: 'Sort by field (default: date)' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Sort order (default: desc)' })
  getMyLogs(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: 'date' | 'totalMinutes',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.attendanceService.getUserAttendanceLogs(
      req.user.userId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      sortBy || 'date',
      sortOrder || 'desc',
    );
  }
}
