import { Injectable, Logger } from '@nestjs/common';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';
import * as fs from 'fs';
import * as path from 'path';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  template?: string;
  context?: Record<string, any>;
  text?: string;
  html?: string;
}

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  constructor(private readonly nestMailerService: NestMailerService) {}

  async sendTemplateEmail(options: EmailOptions) {
    try {
      const result = await this.nestMailerService.sendMail({
        to: options.to,
        subject: options.subject,
        template: options.template,
        context: options.context || {},
      });

      this.logger.log(`Email sent successfully to ${options.to}`);
    
      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  private getLogoBase64(): string {
    try {
      // Use process.cwd() to get consistent path in both dev and production
      const logoPath = path.join(process.cwd(), 'src', 'public', 'logo.png');
      const logoBuffer = fs.readFileSync(logoPath);
      return `data:image/png;base64,${logoBuffer.toString('base64')}`;
    } catch (error) {
      this.logger.warn('Logo file not found, using placeholder');
      return 'https://via.placeholder.com/40';
      
    }
  }

  async sendWelcomeEmail(to: string, userName: string, logoUrl?: string) {
    return this.sendTemplateEmail({
      to,
      subject: 'Welcome to Timexa!',
      template: 'welcome',
      context: {
        name: userName,
        logoUrl: logoUrl || this.getLogoBase64(),
        year: new Date().getFullYear(),
      },
    });
  }

  async sendOTPEmail(to: string, otp: string, time: number|string, logoUrl?: string) {
    return this.sendTemplateEmail({
      to,
      subject: 'Your Timexa OTP Code',
      template: 'otp',
      context: {
        otp: otp, // Add the OTP to the context
        logoUrl: logoUrl || this.getLogoBase64(),
        minuet: time,
        year: new Date().getFullYear(),
      },
    });
  }
}