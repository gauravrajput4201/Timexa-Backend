import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VerificationModuleController } from './verification-module.controller';
import { VerificationModuleService } from './verification-module.service';
import { Verification, VerificationSchema } from './schema/otp.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Verification.name, schema: VerificationSchema },
    ]),
  ],
  controllers: [VerificationModuleController],
  providers: [VerificationModuleService],
  exports: [VerificationModuleService], // Export if other modules need it
})
export class VerificationModuleModule {}
