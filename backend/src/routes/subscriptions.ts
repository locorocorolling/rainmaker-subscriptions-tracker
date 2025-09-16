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