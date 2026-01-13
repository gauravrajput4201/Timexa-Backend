import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { AttendanceLog } from './schemas/attendance-log.schema';
import { InjectModel } from '@nestjs/mongoose';
import ApiResponse from '../../utils/ApiResponse';

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);
  private readonly MAX_SESSION_HOURS = 24;

  constructor(
    @InjectModel(AttendanceLog.name)
    private attendanceModel: Model<AttendanceLog>,
  ) {}

  private normalizeDate(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private validateUserId(userId: string) {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }
  }
  async checkIn(userId: string) {
    this.validateUserId(userId);
    const today = this.normalizeDate(new Date());

    let log = await this.attendanceModel.findOne({ 
      userId: new Types.ObjectId(userId), 
      date: today 
    });

    if (!log) {
      // create new log
      log = await this.attendanceModel.create({
        userId: new Types.ObjectId(userId),
        date: today,
        sessions: [{ checkIn: new Date(), checkOut: null, sessionMinutes: 0 }],
        totalMinutes: 0,
        entryExitTotalMinutes: 0,
      });

      this.logger.log(`User ${userId} checked in (first session today)`);

      return ApiResponse.created('Check-in successful', {
        attendanceLog: {
          id: log._id.toString(),
          userId: log.userId.toString(),
          date: log.date,
          sessions: log.sessions,
          totalMinutes: log.totalMinutes,
          entryExitTotalMinutes: log.entryExitTotalMinutes,
        },
      });
    }

    const lastSession = log.sessions[log.sessions.length - 1];

    if (lastSession && lastSession.checkOut === null) {
      throw new BadRequestException('Already checked in. Please check out first.');
    }

    log.sessions.push({ checkIn: new Date(), checkOut: null, sessionMinutes: 0 });
    const savedLog = await log.save();

    this.logger.log(`User ${userId} checked in (session #${savedLog.sessions.length})`);

    return ApiResponse.success('Check-in successful', {
      attendanceLog: {
        id: savedLog._id.toString(),
        userId: savedLog.userId.toString(),
        date: savedLog.date,
        sessions: savedLog.sessions,
        totalMinutes: savedLog.totalMinutes,
        entryExitTotalMinutes: savedLog.entryExitTotalMinutes,
      },
    });
  }

  
  async checkOut(userId: string) {
    this.validateUserId(userId);
    const today = this.normalizeDate(new Date());

    const log = await this.attendanceModel.findOne({
      userId: new Types.ObjectId(userId),
      date: today,
    });

    if (!log) {
      throw new BadRequestException('Cannot checkout before check-in. Please check in first.');
    }

    const lastSession = log.sessions[log.sessions.length - 1];
    const firstSession = log.sessions[0];

    if (!lastSession || lastSession.checkOut !== null) {
      throw new BadRequestException('Already checked out. Please check in first.');
    }

    const now = new Date();
    
    // Validate session duration (prevent sessions longer than 24 hours)
    const sessionDurationHours = (now.getTime() - lastSession.checkIn.getTime()) / (1000 * 60 * 60);
    this.logger.log(`Session duration: ${sessionDurationHours.toFixed(2)} hours`);
    if (sessionDurationHours > this.MAX_SESSION_HOURS) {
      throw new BadRequestException(
        `Session duration exceeds maximum ${this.MAX_SESSION_HOURS} hours. Please contact administrator.`
      );
    }

    lastSession.checkOut = now;

    const sessionMinutes = this.calculateMinutes(
      now.getTime(), 
      lastSession.checkIn.getTime()
    );

    const entryExitMinutes = this.calculateMinutes(
      now.getTime(),
      firstSession.checkIn.getTime()
    );

    lastSession.sessionMinutes = sessionMinutes;
    
    log.totalMinutes += sessionMinutes;
    
    // Update entry-exit total (first to last)
    log.entryExitTotalMinutes = entryExitMinutes;
    
    const savedLog = await log.save();

    this.logger.log(`User ${userId} checked out (session: ${sessionMinutes}m, total: ${savedLog.totalMinutes}m)`);

    return ApiResponse.success('Check-out successful', {
      attendanceLog: {
        id: savedLog._id.toString(),
        userId: savedLog.userId.toString(),
        date: savedLog.date,
        sessions: savedLog.sessions,
        totalMinutes: savedLog.totalMinutes,
        entryExitTotalMinutes: savedLog.entryExitTotalMinutes,
      },
    });
  }

  private calculateMinutes(endTime: number, startTime: number): number {
    const total = Math.floor((endTime - startTime) / (1000 * 60));
    return total;
  }
}
