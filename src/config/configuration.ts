export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/timexa',
    options: {
      retryWrites: true,
      w: 'majority',
      maxPoolSize: 10,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4, skip trying IPv6
    },
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.example.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY || '',
    fromEmail: process.env.RESEND_FROM_EMAIL || 'Timexa Team <onboarding@resend.dev>',
  },
}
);