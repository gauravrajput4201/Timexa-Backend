import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';

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
  private readonly resend: Resend;
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('resend.apiKey');
    
    if (!apiKey) {
      this.logger.error('RESEND_API_KEY is not configured in environment variables');
      throw new Error('RESEND_API_KEY is missing. Please add it to your .env file');
    }
    
    this.fromEmail = this.configService.get<string>('resend.fromEmail') || 'Timexa <onboarding@resend.dev>';
    this.resend = new Resend(apiKey);
    
    this.logger.log(`✅ Resend initialized with from: ${this.fromEmail}`);
  }

  private compileTemplate(templateName: string, context: Record<string, any>): string {
    try {
      const templatePath = path.join(
        process.cwd(),
        'src',
        'api',
        'mailer',
        'templates',
        `${templateName}.hbs`
      );
      const templateContent = fs.readFileSync(templatePath, 'utf-8');
      const template = Handlebars.compile(templateContent);
      return template(context);
    } catch (error) {
      this.logger.error(`Failed to compile template ${templateName}: ${error.message}`);
      throw new Error(`Template compilation failed: ${error.message}`);
    }
  }

  async sendTemplateEmail(options: EmailOptions) {
    try {
      let html: string;

      if (options.template) {
        html = this.compileTemplate(options.template, options.context || {});
      } else if (options.html) {
        html = options.html;
      } else {
        throw new Error('Either template or html must be provided');
      }

      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: html,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      this.logger.log(`Email sent successfully to ${options.to}`);

      return {
        success: true,
        messageId: result.data?.id,
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

  async sendOTPEmail(to: string, otp: string, time: number | string, logoUrl?: string) {
    return this.sendTemplateEmail({
      to,
      subject: 'Your Timexa OTP Code',
      template: 'otp',
      context: {
        otp: otp,
        logoUrl: logoUrl || this.getLogoBase64(),
        minuet: time,
        year: new Date().getFullYear(),
      },
    });
  }
}