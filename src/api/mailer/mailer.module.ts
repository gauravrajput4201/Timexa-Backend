import { Module } from '@nestjs/common';
import { MailerModule as NestMailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerController } from './mailer.controller';
import { MailerService } from './mailer.service';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import * as path from 'path';
import * as fs from 'fs';

@Module({
  imports: [
    NestMailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // Always use the source templates directory
        // This works in both development (ts-node) and production (compiled)
        const templateDir = path.join(process.cwd(), 'src', 'api', 'mailer', 'templates');

        console.log(`📧 Template directory: ${templateDir}`);
        console.log(`📧 Directory exists: ${fs.existsSync(templateDir)}`);

        return {
          transport: {
            host: configService.get<string>('smtp.host'),
            port: configService.get<number>('smtp.port'),
            secure: false,
            auth: {
              user: configService.get<string>('smtp.user'),
              pass: configService.get<string>('smtp.pass'),
            },
          },
          defaults: {
            from: '"Timexa" <no-reply@timexa.com>',
          },
          template: {
            dir: templateDir,
            adapter: new HandlebarsAdapter(),
            options: { strict: true },
          },
        };
      },
    }),
  ],
  controllers: [MailerController],
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule {}
