import { Injectable } from '@nestjs/common';
import {  MAX_OTP_ATTEMPTS, OTP_EXPIRY_BY_PURPOSE, Verification, VerificationPurpose, VerificationStatus } from './schema/otp.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { hashValue, compareValue } from '../../utils/crypto.util';

@Injectable()
export class VerificationModuleService {
  constructor(
    @InjectModel(Verification.name)
    private verificationModel: Model<Verification>,
  ) {}

  async createVerificationOTP(
    identifier: string,
    purpose: string,
    otpLength: number,
  ): Promise<{ otp: string; document: any }> {
    await this.verificationModel.deleteMany({
      identifier,
      purpose,
      status: VerificationStatus.ACTIVE,
    });

    const otp = this.generateOtp(otpLength);

    const hashedOtp = await hashValue(otp);

    const expiresInMinutes =
      OTP_EXPIRY_BY_PURPOSE[purpose as VerificationPurpose] ?? 5;

    const expiresAt = new Date(Date.now() + expiresInMinutes * 60_000);

    const verification = new this.verificationModel({
      identifier,
      purpose,
      hashedValue: hashedOtp,
      expiresAt,
      status: VerificationStatus.ACTIVE,
      attemptCount: 0,
    });
    const document = await verification.save();
    return { otp, document };
  }

  async verifyOtp(
    identifier: string,
    purpose: VerificationPurpose,
    otp: string,
  ): Promise<boolean> {
    const otpDoc = await this.verificationModel
      .findOne({
        identifier,
        purpose,
        status: VerificationStatus.ACTIVE,
        expiresAt: { $gt: new Date() },
        attemptCount: { $lt: MAX_OTP_ATTEMPTS },
      })
      .sort({ createdAt: -1 });

    if (!otpDoc) {
      return false;
    }

    const isValid = await compareValue(otp, otpDoc.hashedValue);

    if (!isValid) {
      await this.verificationModel.updateOne(
        { _id: otpDoc._id },
        { $inc: { attemptCount: 1 } },
      );
      return false;
    }

    // success → delete immediately
    await this.verificationModel.deleteOne({ _id: otpDoc._id });

    return true;
  }

  private generateOtp(length: number): string {
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += Math.floor(Math.random() * 10).toString();
    }
    return otp;
  }
}
