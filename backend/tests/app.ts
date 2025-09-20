import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createLogger, format, transports } from 'winston';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { checkMongoDBHealth } from '../src/utils/database';
import { config } from '../src/utils/config';
import authRoutes from '../src/routes/auth';
import subscriptionRoutes from '../src/routes/subscriptions';
import userRoutes from '../src/routes/user';
import { BackgroundJobService } from '../src/services/backgroundJobService';

// Load environment variables
dotenv.config();

// Create logger
const logger = createLogger({
  level: config.LOG_LEVEL,
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    })
  ]
});

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Subscription Tracker API',
      version: '1.0.0',
      description: 'A comprehensive API for managing subscriptions with user authentication and advanced features',
      contact: {
        name: 'API Support',
        email: 'support@subscriptiontracker.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: `http://localhost:${config.PORT}`,
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication endpoints'
      },
      {
        name: 'User',
        description: 'User preferences and settings endpoints'
      },
      {
        name: 'Subscriptions',
        description: 'Subscription management endpoints'
      },
      {
        name: 'Health',
        description: 'Health check endpoints'
      }
    ]
  },
  apis: ['../src/routes/*.ts', '../src/server.ts']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Create Express app
const app: express.Application = express();

// Trust proxy for reverse proxy setups (tunnels, load balancers, etc.)
app.set('trust proxy', true);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.getCorsOrigin(),
  credentials: true,
  optionsSuccessStatus: 200
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbHealth = await checkMongoDBHealth();
    const jobStatus = BackgroundJobService.getStatus();

    res.json({
      status: dbHealth ? 'OK' : 'ERROR',
      timestamp: new Date().toISOString(),
      environment: config.NODE_ENV,
      database: {
        mongodb: dbHealth ? 'connected' : 'disconnected'
      },
      jobs: jobStatus
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      environment: config.NODE_ENV,
      database: {
        mongodb: 'error'
      },
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

// Basic API info endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Subscription Tracker API',
    version: '1.0.0',
    environment: config.NODE_ENV,
    endpoints: {
      health: '/health',
      api: '/api',
      docs: config.NODE_ENV !== 'production' ? '/api-docs' : undefined,
      auth: '/api/auth',
      user: '/api/user',
      subscriptions: '/api/subscriptions'
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// Swagger UI (only in non-production environments)
if (config.NODE_ENV !== 'production') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Subscription Tracker API Documentation'
  }));

  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

export default app;