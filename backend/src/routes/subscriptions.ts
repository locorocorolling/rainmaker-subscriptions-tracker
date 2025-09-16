import { Router, Request, Response } from 'express';
import { SubscriptionService } from '../services/subscription';
import { authenticateToken } from '../middleware/auth';
import Joi from 'joi';

const router: Router = Router();

// Validation schemas
const createSubscriptionSchema = Joi.object({
  service: Joi.string().required().max(100),
  description: Joi.string().allow('').max(500),
  category: Joi.string().required().max(50),
  cost: Joi.object({
    amount: Joi.number().required().min(0),
    currency: Joi.string().required().pattern(/^[A-Z]{3}$/)
  }).required(),
  billingCycle: Joi.object({
    value: Joi.number().required().min(1).max(365),
    unit: Joi.string().required().valid('day', 'month', 'year')
  }).required(),
  firstBillingDate: Joi.date().required().min('now'),
  status: Joi.string().valid('active', 'paused', 'cancelled', 'expired').default('active'),
  metadata: Joi.object({
    color: Joi.string().pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
    logoUrl: Joi.string().uri(),
    url: Joi.string().uri(),
    notes: Joi.string().max(1000)
  }).default({})
});

const updateSubscriptionSchema = Joi.object({
  service: Joi.string().max(100),
  description: Joi.string().allow('').max(500),
  category: Joi.string().max(50),
  cost: Joi.object({
    amount: Joi.number().min(0),
    currency: Joi.string().pattern(/^[A-Z]{3}$/)
  }),
  billingCycle: Joi.object({
    value: Joi.number().min(1).max(365),
    unit: Joi.string().valid('day', 'month', 'year')
  }),
  firstBillingDate: Joi.date().min('now'),
  status: Joi.string().valid('active', 'paused', 'cancelled', 'expired'),
  metadata: Joi.object({
    color: Joi.string().pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
    logoUrl: Joi.string().uri(),
    url: Joi.string().uri(),
    notes: Joi.string().max(1000)
  })
}).min(1); // At least one field must be provided

const querySchema = Joi.object({
  status: Joi.string().valid('active', 'paused', 'cancelled', 'expired'),
  category: Joi.string(),
  search: Joi.string(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10)
});

// All subscription routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/subscriptions:
 *   post:
 *     summary: Create a new subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Subscription'
 *     responses:
 *       201:
 *         description: Subscription created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Subscription created successfully
 *                 subscription:
 *                   $ref: '#/components/schemas/Subscription'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Create a new subscription
router.post('/', async (req: Request, res: Response) => {
  try {
    const { error } = createSubscriptionSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        message: 'Validation error',
        details: error.details[0].message
      });
      return;
    }

    const userId = (req as any).user.userId;
    const subscription = await SubscriptionService.createSubscription(userId, req.body);

    res.status(201).json({
      message: 'Subscription created successfully',
      subscription
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

/**
 * @swagger
 * /api/subscriptions:
 *   get:
 *     summary: Get user's subscriptions with filtering and pagination
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [active, paused, cancelled, expired]
 *         description: Filter by subscription status
 *       - name: category
 *         in: query
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *         description: Search in service name and description
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Subscriptions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 subscriptions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Subscription'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     total:
 *                       type: integer
 *                       example: 25
 *                     pages:
 *                       type: integer
 *                       example: 3
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Get all subscriptions for the authenticated user
router.get('/', async (req: Request, res: Response) => {
  try {
    const { error, value } = querySchema.validate(req.query);
    if (error) {
      res.status(400).json({
        message: 'Validation error',
        details: error.details[0].message
      });
      return;
    }

    const userId = (req as any).user.userId;
    const { page, limit, ...filters } = value;
    const offset = (page - 1) * limit;

    if (filters.search) {
      // Use search functionality
      const result = await SubscriptionService.searchSubscriptions(userId, filters.search, {
        status: filters.status,
        category: filters.category,
        limit,
        offset
      });

      return res.json({
        subscriptions: result.subscriptions,
        pagination: {
          page,
          limit,
          total: result.total,
          pages: Math.ceil(result.total / limit)
        }
      });
    } else {
      // Use regular filtering
      const subscriptions = await SubscriptionService.getUserSubscriptions(userId, filters);
      const total = subscriptions.length;

      // Apply pagination
      const paginatedSubscriptions = subscriptions.slice(offset, offset + limit);

      return res.json({
        subscriptions: paginatedSubscriptions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    }
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
    return;
  }
});

/**
 * @swagger
 * /api/subscriptions/stats:
 *   get:
 *     summary: Get subscription statistics
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stats:
 *                   $ref: '#/components/schemas/SubscriptionStats'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Get subscription statistics
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const stats = await SubscriptionService.getSubscriptionStats(userId);

    res.json({
      stats
    });
  } catch (error) {
    console.error('Get subscription stats error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

/**
 * @swagger
 * /api/subscriptions/upcoming:
 *   get:
 *     summary: Get upcoming renewals
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: days
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 365
 *           default: 7
 *         description: Number of days to look ahead
 *     responses:
 *       200:
 *         description: Upcoming renewals retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 upcoming:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Subscription'
 *                 days:
 *                   type: integer
 *                   example: 7
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Get upcoming renewals
router.get('/upcoming', async (req: Request, res: Response) => {
  try {
    const daysSchema = Joi.object({
      days: Joi.number().integer().min(1).max(365).default(7)
    });

    const { error, value } = daysSchema.validate(req.query);
    if (error) {
      res.status(400).json({
        message: 'Validation error',
        details: error.details[0].message
      });
      return;
    }

    const userId = (req as any).user.userId;
    const upcoming = await SubscriptionService.getUpcomingRenewals(userId, value.days);

    res.json({
      upcoming,
      days: value.days
    });
  } catch (error) {
    console.error('Get upcoming renewals error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

/**
 * @swagger
 * /api/subscriptions/{id}:
 *   get:
 *     summary: Get a specific subscription by ID
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Subscription ID
 *     responses:
 *       200:
 *         description: Subscription retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 subscription:
 *                   $ref: '#/components/schemas/Subscription'
 *       404:
 *         description: Subscription not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Get a specific subscription by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;

    const subscription = await SubscriptionService.getSubscriptionById(id, userId);
    if (!subscription) {
      res.status(404).json({
        message: 'Subscription not found'
      });
      return;
    }

    res.json({
      subscription
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

/**
 * @swagger
 * /api/subscriptions/{id}:
 *   put:
 *     summary: Update a subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Subscription ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               service:
 *                 type: string
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               category:
 *                 type: string
 *                 maxLength: 50
 *               cost:
 *                 $ref: '#/components/schemas/Money'
 *               billingCycle:
 *                 $ref: '#/components/schemas/BillingCycle'
 *               firstBillingDate:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [active, paused, cancelled, expired]
 *               metadata:
 *                 type: object
 *                 properties:
 *                   color:
 *                     type: string
 *                     pattern: '^#[0-9A-Fa-f]{6}$'
 *                   logoUrl:
 *                     type: string
 *                     format: uri
 *                   url:
 *                     type: string
 *                     format: uri
 *                   notes:
 *                     type: string
 *                     maxLength: 1000
 *     responses:
 *       200:
 *         description: Subscription updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Subscription updated successfully
 *                 subscription:
 *                   $ref: '#/components/schemas/Subscription'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Subscription not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Update a subscription
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { error } = updateSubscriptionSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        message: 'Validation error',
        details: error.details[0].message
      });
      return;
    }

    const { id } = req.params;
    const userId = (req as any).user.userId;

    const subscription = await SubscriptionService.updateSubscription(id, userId, req.body);
    if (!subscription) {
      res.status(404).json({
        message: 'Subscription not found'
      });
      return;
    }

    res.json({
      message: 'Subscription updated successfully',
      subscription
    });
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

/**
 * @swagger
 * /api/subscriptions/{id}:
 *   delete:
 *     summary: Cancel a subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Subscription ID
 *     responses:
 *       200:
 *         description: Subscription cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Subscription cancelled successfully
 *                 subscription:
 *                   $ref: '#/components/schemas/Subscription'
 *       404:
 *         description: Subscription not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Cancel a subscription
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;

    const subscription = await SubscriptionService.cancelSubscription(id, userId);
    if (!subscription) {
      res.status(404).json({
        message: 'Subscription not found'
      });
      return;
    }

    res.json({
      message: 'Subscription cancelled successfully',
      subscription
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

export default router;