import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('/api');
  const configService = app.get(ConfigService);

  // Global exception filter - wraps all errors in ApiResponse format
  app.useGlobalFilters(new HttpExceptionFilter());

  // Enable CORS for production
  app.enableCors(configService.get('cors'));

  // Global validation pipe for DTO validation
  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     whitelist: true,
  //     forbidNonWhitelisted: true,
  //     transform: true,
  //     transformOptions: {
  //       enableImplicitConversion: true,
  //     },
  //   }),
  // );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Timexa Backend ')
    .setDescription('The Timexa API - Production Ready Authentication System')
    .setVersion('1.0')
    .addTag('Authentication')
    .addBearerAuth(
      {
        description: ` Please enter token in following format: Bearer <JWT>`,
        name: 'Authorization',
        bearerFormat: 'Bearer',
        scheme: 'Bearer',
        type: 'http',
        in: 'Header',
      },
      'defaultBearerAuth',
    )
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  const port = configService.get<number>('port') || 3000;
  await app.listen(port, '0.0.0.0');
}
bootstrap();
