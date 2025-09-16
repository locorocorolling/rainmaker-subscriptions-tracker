import mongoose from 'mongoose';
import { createClient } from 'redis';
import { logger } from './logger';

// MongoDB connection
export const connectMongoDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/subscription_tracker?authSource=admin';

    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(mongoUri, options);
    logger.info('✅ MongoDB connected successfully');
  } catch (error) {
    logger.error('❌ MongoDB connection failed:', error);
    throw error;
  }
};

// Redis connection
export const connectRedis = async (): Promise<ReturnType<typeof createClient>> => {
  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    const redisClient = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 1000),
      },
    });

    redisClient.on('error', (err) => {
      logger.error('Redis client error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('✅ Redis connected successfully');
    });

    redisClient.on('reconnecting', () => {
      logger.warn('Redis reconnecting...');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    logger.error('❌ Redis connection failed:', error);
    throw error;
  }
};

// Graceful shutdown
export const gracefulShutdown = async (redisClient: any): Promise<void> => {
  try {
    logger.info('Initiating graceful shutdown...');

    await mongoose.connection.close();
    logger.info('✅ MongoDB connection closed');

    if (redisClient && redisClient.isOpen) {
      await redisClient.quit();
      logger.info('✅ Redis connection closed');
    }

    logger.info('✅ Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Error during graceful shutdown:', error);
    process.exit(1);
  }
};

// Health check functions
export const checkMongoDBHealth = async (): Promise<boolean> => {
  try {
    if (mongoose.connection.db) {
      await mongoose.connection.db.admin().ping();
    } else {
      // If db is not available, check connection state
      if (mongoose.connection.readyState !== 1) {
        return false;
      }
    }
    return true;
  } catch (error) {
    logger.error('MongoDB health check failed:', error);
    return false;
  }
};

export const checkRedisHealth = async (redisClient: any): Promise<boolean> => {
  try {
    await redisClient.ping();
    return true;
  } catch (error) {
    logger.error('Redis health check failed:', error);
    return false;
  }
};

// Connection event listeners
mongoose.connection.on('connected', () => {
  logger.info('✅ MongoDB connected');
});

mongoose.connection.on('error', (error) => {
  logger.error('❌ MongoDB connection error:', error);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('⚠️  MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  logger.info('✅ MongoDB reconnected');
});