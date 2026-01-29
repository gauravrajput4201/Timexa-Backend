import { Injectable } from '@nestjs/common';
import { OTP_EXPIRY_BY_PURPOSE, Verification, VerificationPurpose, VerificationStatus } from './schema/otp.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class VerificationModuleService {
    

    constructor(
         @InjectModel(Verification.name) private verificationModel: Model<Verification>, 
    ){}
    
    async createVerificationOTP(identifier: string, purpose: string, otpLength: number): Promise<{ otp: string; document: any }> {
        await this.verificationModel.deleteMany({
          identifier,
          purpose,
          status: VerificationStatus.ACTIVE,
        });
          
        const otp = this.generateOtp(otpLength);

        const hashedOtp = await bcrypt.hash(otp, 10);

        const expiresInMinutes = OTP_EXPIRY_BY_PURPOSE[purpose as VerificationPurpose]||5;

        const expiresAt = new Date(Date.now() + expiresInMinutes * 60_000);

        const verification = new this.verificationModel({
          identifier,
          purpose,
          otp: hashedOtp,
          expiresAt,
          status: VerificationStatus.ACTIVE,
          attemptCount: 0,
        });
        const document = await verification.save();
        
        // Return both the plain OTP (to send via email) and the saved document
        return { otp, document };
    }



    private generateOtp(length: number): string {
        let otp = '';
        for (let i = 0; i < length; i++) {
            otp += Math.floor(Math.random() * 10).toString();
        }
        return otp;
    }
}


// const otpDoc = await verificationModel
//   .findOne({
//     identifier: emailOrPhone,
//     purpose: VerificationPurpose.RESET_PASSWORD,
//     status: VerificationStatus.ACTIVE,
//     expiresAt: { $gt: new Date() },
//     attemptCount: { $lt: MAX_ATTEMPTS },
//   })
//   .sort({ createdAt: -1 });