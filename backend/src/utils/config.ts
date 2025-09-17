import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  // Server
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Database
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/subscription_tracker?authSource=admin',
  MONGODB_TEST_URI: process.env.MONGODB_TEST_URI || 'mongodb://admin:password@localhost:27017/subscription_tracker_test?authSource=admin',

  // Redis
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5174',

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',

  // Notifications
  NOTIFICATION_REMINDER_DAYS: parseInt(process.env.NOTIFICATION_REMINDER_DAYS || '7'),

  // Email
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',

  // Validate required environment variables in production
  validateEnv: () => {
    if (process.env.NODE_ENV === 'production') {
      const requiredEnvVars = [
        'MONGODB_URI',
        'REDIS_URL',
        'JWT_SECRET',
        'CORS_ORIGIN'
      ];

      const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

      if (missingEnvVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
      }

      if (process.env.JWT_SECRET === 'your-secret-key-change-in-production') {
        throw new Error('JWT_SECRET must be changed from the default value in production');
      }
    }
  }
};