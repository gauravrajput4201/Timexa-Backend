/**
 * Production Index Creation Script
 * 
 * This script automatically reads your Mongoose schemas and creates
 * all indexes defined in them. No need to manually update this file
 * when adding new collections!
 * 
 * Usage:
 *   Development: npm run db:indexes
 *   Production:  npm run db:indexes:prod
 */

import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Import all your schemas
import { UserSchema } from '../src/api/auth/schemas/user.schema';
import { VerificationSchema } from '../src/api/verification-module/schema/otp.schema';
import { AttendanceLogSchema } from '../src/api/attendance/schemas/attendance-log.schema';

// Load environment variables
const envFile = process.env.NODE_ENV === 'production' 
  ? '.env.production' 
  : '.env.development';
dotenv.config({ path: path.resolve(__dirname, `../${envFile}`) });

async function createIndexes() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/timexa';

  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);

    // Define all your models with their schemas
    const models = [
      { name: 'User', schema: UserSchema, collection: 'users' },
      { name: 'Verification', schema: VerificationSchema, collection: 'verifications' },
      { name: 'AttendanceLog', schema: AttendanceLogSchema, collection: 'attendancelogs' },
    ];

    // Create indexes for each model
    for (const { name, schema, collection } of models) {
      console.log(`📊 Creating indexes for ${collection} collection...`);
      
      // Create a temporary model
      const Model = mongoose.model(name, schema, collection);
      
      // Use Mongoose to create indexes (respects schema definitions)
      await Model.createIndexes();
      
      console.log(`  ✅ All indexes created for ${collection}`);
      
      // Show created indexes
      const indexes = await Model.collection.getIndexes();
      Object.keys(indexes).forEach(indexName => {
        console.log(`     - ${indexName}`);
      });
      console.log('');
    }

    console.log('✅ All indexes created successfully!');
    console.log('\n💡 You can now deploy to production with NODE_ENV=production');

  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

// Run the script
createIndexes();
