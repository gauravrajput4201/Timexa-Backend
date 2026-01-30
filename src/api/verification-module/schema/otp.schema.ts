import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type VerificationDocument = HydratedDocument<Verification>;

export enum VerificationPurpose {
  RESET_PASSWORD = 'RESET_PASSWORD',
  VERIFY_EMAIL = 'VERIFY_EMAIL',
  VERIFY_PHONE = 'VERIFY_PHONE',
}

export const OTP_EXPIRY_BY_PURPOSE: Record<VerificationPurpose, number> = {
  [VerificationPurpose.RESET_PASSWORD]: 5,
  [VerificationPurpose.VERIFY_EMAIL]: 10,
  [VerificationPurpose.VERIFY_PHONE]: 5,
};

export enum VerificationStatus {
  ACTIVE = 'ACTIVE',
  USED = 'USED',
  EXPIRED = 'EXPIRED',
}

export const MAX_OTP_ATTEMPTS = 3;

@Schema({ 
  timestamps: true,
  // autoIndex controlled globally by NODE_ENV
})
export class Verification {
  @Prop({ required: true, index: true })
  identifier: string;

  @Prop({ required: true, enum: VerificationPurpose, index: true })
  purpose: VerificationPurpose;

  @Prop({ required: true })
  hashedValue: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: 0 })
  attemptCount: number;

  @Prop({ default: VerificationStatus.ACTIVE, enum: VerificationStatus })
  status: VerificationStatus;
}

export const VerificationSchema = SchemaFactory.createForClass(Verification);

// TTL index - MongoDB will automatically delete documents after expiresAt time
VerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for faster queries
VerificationSchema.index({
  identifier: 1,
  purpose: 1,
  status: 1,
});
