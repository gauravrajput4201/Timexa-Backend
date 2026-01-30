import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';

@Injectable()
export class MongooseConfigService implements MongooseOptionsFactory {
  constructor(private configService: ConfigService) {}

  createMongooseOptions(): MongooseModuleOptions {
    const isDevelopment = this.configService.get('nodeEnv') === 'development';

    return {
      uri: this.configService.get<string>('database.uri'),
      ...this.configService.get('database.options'),

      // Production-ready settings
      autoIndex: isDevelopment, // Only auto-create indexes in development
      autoCreate: isDevelopment, // Only auto-create collections in development

      // Connection event handlers for monitoring
      connectionFactory: (connection) => {
        connection.on('connected', () => {
          console.log('✅ MongoDB connected successfully');
        });

        connection.on('disconnected', () => {
          console.log('❌ MongoDB disconnected');
        });

        connection.on('error', (error) => {
          console.error('❌ MongoDB connection error:', error);
        });

        return connection;
      },
    };
  }
}
