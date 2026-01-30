import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './api/auth/auth.module';
import configuration from './config/configuration';
import { MongooseConfigService } from './config/mongoose.config';
import { JwtService } from '@nestjs/jwt';
import { UsersModule } from './api/users/users.module';
import { AttendanceModule } from './api/attendance/attendance.module';
import { MailerModule } from './api/mailer/mailer.module';
import { VerificationModuleModule } from './api/verification-module/verification-module.module';

@Module({
  imports: [
    // Environment Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      load: [configuration],
      cache: true,
      expandVariables: true, // Enable variable expansion
    }),
    
    // MongoDB Connection with dedicated config service
    MongooseModule.forRootAsync({
      useClass: MongooseConfigService,
    }),
    
    AuthModule,
    UsersModule,
    AttendanceModule,
    MailerModule,
    VerificationModuleModule,
    
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
