import { SchemaFactory, Schema, Prop } from '@nestjs/mongoose';

import { HydratedDocument, Types  } from "mongoose";

export type AttendanceLogDocument = HydratedDocument<AttendanceLog>;


@Schema({ timestamps: true })
export class AttendanceLog {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({
    type: [
      {
        checkIn: { type: Date, required: true },
        checkOut: { type: Date, default: null },
        sessionMinutes: { type: Number, default: 0 },
      },
    ],
    default: [],
  })
  sessions: {
    checkIn: Date;
    checkOut: Date | null;
    sessionMinutes: number;
  }[];

  @Prop({ type: Number, default: 0 })
  totalMinutes: number;

  @Prop({ type: Number, default: 0 })
  entryExitTotalMinutes: number;
}

export const AttendanceLogSchema = SchemaFactory.createForClass(AttendanceLog);
AttendanceLogSchema.index({ userId: 1, date: 1 }, { unique: true });