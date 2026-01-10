# Configuration Guide

## 📁 Configuration Structure

The application uses a **production-ready, modular configuration** system with separate files for different concerns:

```
src/
└── config/
    ├── configuration.ts      # Main configuration loader
    └── mongoose.config.ts    # MongoDB-specific configuration
```

## 🔧 Configuration Files

### 1. **configuration.ts**
Central configuration file that loads and structures all environment variables.

**Features:**
- ✅ Type-safe configuration
- ✅ Default values for all settings
- ✅ Organized by domain (database, cors, etc.)
- ✅ Cached for performance

### 2. **mongoose.config.ts**
Dedicated MongoDB configuration service implementing `MongooseOptionsFactory`.

**Production Features:**
- ✅ Connection pooling (min: 5, max: 10)
- ✅ Automatic reconnection
- ✅ Connection monitoring with event handlers
- ✅ IPv4 preference for better compatibility
- ✅ Timeouts for reliability
- ✅ Environment-specific settings:
  - **Development:** Auto-indexing enabled
  - **Production:** Auto-indexing disabled for performance

## 🌍 Environment Files

### Development (`.env`)
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/timexa
CORS_ORIGIN=*
```

### Production (`.env.production`)
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/timexa?retryWrites=true&w=majority
CORS_ORIGIN=https://yourdomain.com
```

## 📊 MongoDB Configuration Options

### Connection Pool Settings
- **maxPoolSize**: 10 - Maximum number of connections
- **minPoolSize**: 5 - Minimum number of connections kept alive
- **serverSelectionTimeoutMS**: 5000 - Time to wait for server selection
- **socketTimeoutMS**: 45000 - Socket timeout
- **family**: 4 - Force IPv4

### Write Concerns
- **retryWrites**: true - Automatically retry failed writes
- **w**: 'majority' - Wait for majority acknowledgment

### Environment-Specific
- **autoIndex**: true (dev) / false (prod) - Auto-create indexes
- **autoCreate**: true (dev) / false (prod) - Auto-create collections

## 🚀 Usage in Code

### Accessing Configuration
```typescript
import { ConfigService } from '@nestjs/config';

constructor(private configService: ConfigService) {}

// Get database URI
const dbUri = this.configService.get<string>('database.uri');

// Get port
const port = this.configService.get<number>('port');

// Get CORS settings
const corsOrigin = this.configService.get<string>('cors.origin');
```

### Type-Safe Access
```typescript
// The configuration object structure:
{
  port: number;
  nodeEnv: string;
  database: {
    uri: string;
    options: {
      retryWrites: boolean;
      w: string;
      maxPoolSize: number;
      minPoolSize: number;
      serverSelectionTimeoutMS: number;
      socketTimeoutMS: number;
      family: number;
    };
  };
  cors: {
    origin: string;
    credentials: boolean;
  };
}
```

## 🔒 Production Checklist

- [ ] Update `MONGODB_URI` with production database (MongoDB Atlas recommended)
- [ ] Set `CORS_ORIGIN` to your frontend domain
- [ ] Set `NODE_ENV=production`
- [ ] Use environment variables management (AWS Secrets Manager, Azure Key Vault, etc.)
- [ ] Enable MongoDB authentication
- [ ] Use connection string with SSL/TLS
- [ ] Set up monitoring for connection events
- [ ] Configure firewall rules for database access

## 🛡️ Security Best Practices

1. **Never commit `.env` files** - Use `.env.example` instead
2. **Use strong MongoDB credentials**
3. **Enable MongoDB authentication** in production
4. **Use SSL/TLS** for database connections
5. **Restrict CORS origins** to specific domains
6. **Use environment variable managers** for secrets
7. **Rotate database credentials** regularly

## 📈 Monitoring

The MongoDB config includes connection event handlers:

```typescript
connection.on('connected', () => {
  console.log('✅ MongoDB connected successfully');
});

connection.on('disconnected', () => {
  console.log('❌ MongoDB disconnected');
});

connection.on('error', (error) => {
  console.error('❌ MongoDB connection error:', error);
});
```

## 🔄 Adding New Configuration

To add new configuration values:

1. **Add to `.env`:**
   ```env
   NEW_SETTING=value
   ```

2. **Add to `configuration.ts`:**
   ```typescript
   export default () => ({
     // ... existing config
     newSetting: process.env.NEW_SETTING || 'default',
   });
   ```

3. **Access in code:**
   ```typescript
   const setting = this.configService.get<string>('newSetting');
   ```

## 🌐 Multiple Environments

Load different env files based on environment:

```typescript
ConfigModule.forRoot({
  envFilePath: `.env.${process.env.NODE_ENV}`,
  // ... other options
})
```

Then use:
- `.env.development`
- `.env.production`
- `.env.staging`
- `.env.test`
