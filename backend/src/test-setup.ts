import { config } from './utils/config';

// Override config for testing
config.NODE_ENV = 'test';
// Use simple MongoDB connection without auth for tests
config.MONGODB_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/subscription_tracker_test';
config.JWT_SECRET = 'test-jwt-secret';

// Disable background jobs during tests
process.env.DISABLE_BACKGROUND_JOBS = 'true';
process.env.NODE_ENV = 'test';