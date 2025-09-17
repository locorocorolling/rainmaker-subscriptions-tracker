import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  // Server
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Database
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://app_user:app_password@localhost:27017/subscription_tracker?authSource=subscription_tracker',
  MONGODB_TEST_URI: process.env.MONGODB_TEST_URI || 'mongodb://admin:password@localhost:27017/subscription_tracker_test?authSource=admin',

  // Redis
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // CORS - supports boolean, '*', single URL, or comma-separated list
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5174',

  // Parse CORS origins using built-in cors library patterns
  getCorsOrigin: () => {
    const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5174';

    // Handle special cases
    if (corsOrigin === '*' || corsOrigin === 'true') {
      return true; // Allow all origins
    }

    if (corsOrigin === 'false') {
      return false; // Disable CORS
    }

    // Handle comma-separated list
    if (corsOrigin.includes(',')) {
      return corsOrigin.split(',').map(origin => origin.trim());
    }

    // Single origin
    return corsOrigin;
  },

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
        // 'CORS_ORIGIN' // Made optional to allow flexibility
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