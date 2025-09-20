import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createLogger, format, transports } from 'winston';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { connectMongoDB, checkMongoDBHealth } from './utils/database';
import { config } from './utils/config';
import authRoutes from './routes/auth';
import subscriptionRoutes from './routes/subscriptions';
import userRoutes from './routes/user';
import { BackgroundJobService } from './services/backgroundJobService';

// Load environment variables
dotenv.config();

// Validate environment variables
config.validateEnv();

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
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'User ID'
            },
            name: {
              type: 'string',
              description: 'User full name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation date'
            }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Response message'
            },
            token: {
              type: 'string',
              description: 'JWT access token'
            },
            user: {
              $ref: '#/components/schemas/User'
            }
          }
        },
        Money: {
          type: 'object',
          properties: {
            amount: {
              type: 'number',
              description: 'Amount in minor units (e.g., cents)'
            },
            currency: {
              type: 'string',
              pattern: '^[A-Z]{3}$',
              description: 'ISO 4217 currency code'
            }
          }
        },
        BillingCycle: {
          type: 'object',
          properties: {
            value: {
              type: 'integer',
              minimum: 1,
              maximum: 365,
              description: 'Number of units'
            },
            unit: {
              type: 'string',
              enum: ['day', 'month', 'year'],
              description: 'Time unit'
            }
          }
        },
        Subscription: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Subscription ID'
            },
            service: {
              type: 'string',
              description: 'Service name'
            },
            description: {
              type: 'string',
              description: 'Service description'
            },
            category: {
              type: 'string',
              description: 'Subscription category'
            },
            cost: {
              $ref: '#/components/schemas/Money'
            },
            billingCycle: {
              $ref: '#/components/schemas/BillingCycle'
            },
            firstBillingDate: {
              type: 'string',
              format: 'date',
              description: 'First billing date'
            },
            nextRenewal: {
              type: 'string',
              format: 'date',
              description: 'Next renewal date'
            },
            status: {
              type: 'string',
              enum: ['active', 'paused', 'cancelled', 'expired'],
              description: 'Subscription status'
            },
            metadata: {
              type: 'object',
              properties: {
                color: {
                  type: 'string',
                  pattern: '^#[0-9A-Fa-f]{6}$',
                  description: 'Hex color code'
                },
                logoUrl: {
                  type: 'string',
                  format: 'uri',
                  description: 'Service logo URL'
                },
                url: {
                  type: 'string',
                  format: 'uri',
                  description: 'Service website URL'
                },
                notes: {
                  type: 'string',
                  maxLength: 1000,
                  description: 'User notes'
                }
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation date'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update date'
            }
          }
        },
        SubscriptionStats: {
          type: 'object',
          properties: {
            total: {
              type: 'integer',
              description: 'Total number of subscriptions'
            },
            active: {
              type: 'integer',
              description: 'Number of active subscriptions'
            },
            cancelled: {
              type: 'integer',
              description: 'Number of cancelled subscriptions'
            },
            paused: {
              type: 'integer',
              description: 'Number of paused subscriptions'
            },
            monthlyTotal: {
              type: 'number',
              description: 'Total monthly cost'
            },
            yearlyTotal: {
              type: 'number',
              description: 'Total yearly projected cost'
            },
            upcomingRenewals: {
              type: 'integer',
              description: 'Number of upcoming renewals in next 30 days'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message'
            },
            error: {
              type: 'string',
              description: 'Detailed error (development only)'
            }
          }
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
  apis: ['./src/routes/*.ts', './src/server.ts']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Create Express app
const app: express.Application = express();
const PORT = config.PORT;

// Trust proxy for reverse proxy setups (tunnels, load balancers, etc.)
app.set('trust proxy', true);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.getCorsOrigin(),
  credentials: true,
  optionsSuccessStatus: 200 // For legacy browser support
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
/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Health check successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 environment:
 *                   type: string
 *                   example: development
 *                 database:
 *                   type: object
 *                   properties:
 *                     mongodb:
 *                       type: string
 *                       example: connected
 *       500:
 *         description: Health check failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ERROR
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 environment:
 *                   type: string
 *                   example: development
 *                 database:
 *                   type: object
 *                   properties:
 *                     mongodb:
 *                       type: string
 *                       example: error
 *                 error:
 *                   type: string
 *                   description: Error details (development only)
 */
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
/**
 * @swagger
 * /api:
 *   get:
 *     summary: Get API information
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Subscription Tracker API
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *                 environment:
 *                   type: string
 *                   example: development
 *                 endpoints:
 *                   type: object
 *                   properties:
 *                     health:
 *                       type: string
 *                       example: /health
 *                     api:
 *                       type: string
 *                       example: /api
 *                     docs:
 *                       type: string
 *                       example: /api-docs
 *                     auth:
 *                       type: string
 *                       example: /api/auth
 *                     subscriptions:
 *                       type: string
 *                       example: /api/subscriptions
 */
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

// Auth routes
app.use('/api/auth', authRoutes);

// User routes
app.use('/api/user', userRoutes);

// Subscription routes
app.use('/api/subscriptions', subscriptionRoutes);

// Swagger UI (only in non-production environments)
if (config.NODE_ENV !== 'production') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Subscription Tracker API Documentation'
  }));

  // Raw OpenAPI specification (only in non-production environments)
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

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectMongoDB();

    // Start background job service
    BackgroundJobService.start();
    logger.info('⏰ Background job service started');

    // Start server
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📊 Health check: http://localhost:${PORT}/health`);
      logger.info(`🔧 API info: http://localhost:${PORT}/api`);
      logger.info(`🌍 Environment: ${config.NODE_ENV}`);
      logger.info(`🗄️  MongoDB URI: ${config.MONGODB_URI.replace(/:([^:@]+)@/, ':***@')}`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;