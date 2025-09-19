import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { UserService } from '../services/userService';
import { authenticateToken } from '../middleware/auth';
import { ApiResponse, UserPreferences } from '@shared/types/api';

const router: Router = Router();

// Validation schema for preferences
const preferencesSchema = Joi.object({
  theme: Joi.string().valid('light', 'dark', 'auto'),
  currency: Joi.string().pattern(/^[A-Z]{3}$/),
  timezone: Joi.string(),
  notifications: Joi.object({
    email: Joi.boolean(),
    renewalReminders: Joi.boolean(),
    reminderDays: Joi.number().integer().min(1).max(30)
  })
});

const notificationsSchema = Joi.object({
  email: Joi.boolean(),
  renewalReminders: Joi.boolean(),
  reminderDays: Joi.number().integer().min(1).max(30)
});

/**
 * @swagger
 * /api/user/preferences:
 *   get:
 *     summary: Get user preferences
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User preferences retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     theme:
 *                       type: string
 *                       enum: [light, dark, auto]
 *                     currency:
 *                       type: string
 *                     timezone:
 *                       type: string
 *                     notifications:
 *                       type: object
 *                       properties:
 *                         email:
 *                           type: boolean
 *                         renewalReminders:
 *                           type: boolean
 *                         reminderDays:
 *                           type: number
 *       401:
 *         description: Unauthorized
 */
// Get user preferences
router.get('/preferences', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const user = await UserService.findActiveById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({
      data: user.preferences
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/user/preferences:
 *   put:
 *     summary: Update user preferences
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               theme:
 *                 type: string
 *                 enum: [light, dark, auto]
 *               currency:
 *                 type: string
 *               timezone:
 *                 type: string
 *               notifications:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: boolean
 *                   renewalReminders:
 *                     type: boolean
 *                   reminderDays:
 *                     type: number
 *                     minimum: 1
 *                     maximum: 30
 *     responses:
 *       200:
 *         description: Preferences updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     theme:
 *                       type: string
 *                       enum: [light, dark, auto]
 *                     currency:
 *                       type: string
 *                     timezone:
 *                       type: string
 *                     notifications:
 *                       type: object
 *                       properties:
 *                         email:
 *                           type: boolean
 *                         renewalReminders:
 *                           type: boolean
 *                         reminderDays:
 *                           type: number
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
// Update user preferences
router.put('/preferences', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { error } = preferencesSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        message: 'Validation error',
        details: error.details[0].message
      });
      return;
    }

    const userId = (req as any).user.userId;

    const updatedUser = await UserService.updatePreferences(userId, req.body);
    if (!updatedUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({
      data: updatedUser.preferences,
      message: 'Preferences updated successfully'
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/user/preferences/notifications:
 *   patch:
 *     summary: Update only notification preferences
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: boolean
 *               renewalReminders:
 *                 type: boolean
 *               reminderDays:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 30
 *     responses:
 *       200:
 *         description: Notification preferences updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: boolean
 *                     renewalReminders:
 *                       type: boolean
 *                     reminderDays:
 *                       type: number
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
// Update notification preferences only
router.patch('/preferences/notifications', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { error } = notificationsSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        message: 'Validation error',
        details: error.details[0].message
      });
      return;
    }

    const userId = (req as any).user.userId;

    // Get current preferences
    const currentUser = await UserService.findActiveById(userId);
    if (!currentUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Merge notification updates with existing preferences
    const updatedNotifications = {
      ...currentUser.preferences?.notifications,
      ...req.body
    };

    const updatedPreferences = {
      theme: currentUser.preferences?.theme,
      currency: currentUser.preferences?.currency,
      timezone: currentUser.preferences?.timezone,
      notifications: updatedNotifications
    };

    const updatedUser = await UserService.updatePreferences(userId, updatedPreferences);

    res.json({
      data: updatedUser?.preferences?.notifications,
      message: 'Notification preferences updated successfully'
    });
  } catch (error) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;