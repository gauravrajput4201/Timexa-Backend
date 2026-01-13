import { BadRequestException, Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { AttendanceLog } from './schemas/attendance-log.schema';
import { InjectModel } from '@nestjs/mongoose';
import ApiResponse from '../../utils/ApiResponse';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(AttendanceLog.name)
    private attendanceModel: Model<AttendanceLog>,
  ) {}

  private normalizeDate(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
  async checkIn(userId: string) {
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

      return ApiResponse.created('Check-in successful', {
        attendanceLog: {
          id: log._id.toString(),
          userId: log.userId.toString(),
          date: log.date,
          sessions: log.sessions,
          totalMinutes: log.totalMinutes,
          entryExittotalMinutes: log.entryExitTotalMinutes,
        },
      });
    }

    const lastSession = log.sessions[log.sessions.length - 1];

    if (lastSession && lastSession.checkOut === null) {
      throw new BadRequestException('Already checked in.');
    }

    log.sessions.push({ checkIn: new Date(), checkOut: null, sessionMinutes: 0 });
    const savedLog = await log.save();

    return ApiResponse.success('Check-in successful', {
      attendanceLog: {
        id: savedLog._id.toString(),
        userId: savedLog.userId.toString(),
        date: savedLog.date,
        sessions: savedLog.sessions,
        totalMinutes: savedLog.totalMinutes,
        entryExittotalMinutes: savedLog.entryExitTotalMinutes,
      },
    });
  }

  
  async checkOut(userId: string) {
    const today = this.normalizeDate(new Date());

    const log = await this.attendanceModel.findOne({
      userId: new Types.ObjectId(userId),
      date: today,
    });

    if (!log) {
      throw new BadRequestException('Cannot checkout before check-in.');
    }

    const lastSession = log.sessions[log.sessions.length - 1];
    const firstSession = log.sessions[0];

    if (!lastSession || lastSession.checkOut !== null) {
      throw new BadRequestException('Already checked out.');
    }

    const now = new Date();
    lastSession.checkOut = now;

    // Calculate session duration in minutes (this session only)
    const sessionMinutes = this.calculateMinutes(
      now.getTime(), 
      lastSession.checkIn.getTime()
    );

    // Calculate entry-exit total (first check-in to last check-out)
    const entryExitMinutes = this.calculateMinutes(
      now.getTime(),
      firstSession.checkIn.getTime()
    );

    // Update session minutes for this session
    lastSession.sessionMinutes = sessionMinutes;
    
    // Update total minutes (sum of all sessions)
    log.totalMinutes += sessionMinutes;
    
    // Update entry-exit total (first to last)
    log.entryExitTotalMinutes = entryExitMinutes;
    
    const savedLog = await log.save();

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
