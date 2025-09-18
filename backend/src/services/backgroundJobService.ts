import * as cron from 'node-cron';
import { UserModel, IUserDocument } from '../models/User';
import { SubscriptionModel } from '../models/Subscription';
import { SubscriptionService } from './subscription';
import { EmailService } from './emailService';
import { config } from '../utils/config';
import { createLogger, format, transports } from 'winston';

// Create logger for background jobs
const logger = createLogger({
  level: config.LOG_LEVEL,
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [new transports.Console()],
});

export class BackgroundJobService {
  private static jobs: cron.ScheduledTask[] = [];
  private static isRunning = false;

  /**
   * Start all background jobs
   */
  static start() {
    if (this.isRunning) {
      logger.warn('Background jobs are already running');
      return;
    }

    // Skip background jobs in test environment
    if (process.env.DISABLE_BACKGROUND_JOBS === 'true' || process.env.NODE_ENV === 'test') {
      logger.info('Background jobs disabled in test environment');
      return;
    }

    logger.info('Starting background job service...');

    // Daily job to check for renewal reminders (runs at 9:00 AM every day)
    const dailyRenewalJob = cron.schedule('0 9 * * *', async () => {
      await this.checkRenewalReminders();
    }, {
      timezone: 'UTC'
    });

    // Daily job to process actual renewals (runs at 2:00 AM every day)
    const renewalProcessingJob = cron.schedule('0 2 * * *', async () => {
      await this.processSubscriptionRenewals();
    }, {
      timezone: 'UTC'
    });

    // Development job that runs every minute for testing
    const devTestJob = cron.schedule('* * * * *', async () => {
      if (config.NODE_ENV === 'development') {
        logger.debug('Development test job running...');
        // Uncomment for testing: await this.checkRenewalReminders();
        // Uncomment for testing: await this.processSubscriptionRenewals();
      }
    }, {
      timezone: 'UTC'
    });

    this.jobs = [dailyRenewalJob, renewalProcessingJob, devTestJob];

    // Start all jobs
    this.jobs.forEach(job => job.start());
    this.isRunning = true;

    logger.info(`Background job service started with ${this.jobs.length} jobs`);
  }

  /**
   * Stop all background jobs
   */
  static stop() {
    if (!this.isRunning) {
      logger.warn('Background jobs are not running');
      return;
    }

    logger.info('Stopping background job service...');

    this.jobs.forEach(job => job.stop());
    this.jobs = [];
    this.isRunning = false;

    logger.info('Background job service stopped');
  }

  /**
   * Get the status of all jobs
   */
  static getStatus() {
    return {
      isRunning: this.isRunning,
      jobCount: this.jobs.length,
      jobs: this.jobs.map((job, index) => ({
        id: index,
        name: this.getJobName(index),
      })),
    };
  }

  /**
   * Check for subscriptions that need renewal reminders
   */
  private static async checkRenewalReminders() {
    try {
      logger.info('Starting renewal reminder check...');

      // Find all active users with notification preferences
      const usersWithNotifications = await UserModel.find({
        isActive: true,
        'preferences.notifications.email': true,
        'preferences.notifications.renewalReminders': true
      });

      logger.info(`Found ${usersWithNotifications.length} users with notifications enabled`);

      let subscriptionsNeedingReminder: any[] = [];

      // For each user, find their subscriptions within their reminder period
      for (const user of usersWithNotifications) {
        const userReminderDays = user.preferences?.notifications?.reminderDays || config.NOTIFICATION_REMINDER_DAYS;
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + userReminderDays);

        const userSubscriptions = await SubscriptionModel.find({
          userId: user._id,
          nextRenewal: {
            $lte: targetDate,
            $gte: new Date(), // Only future renewals
          },
          status: 'active',
        });

        // Attach user data to each subscription for later processing
        userSubscriptions.forEach(sub => {
          (sub as any).userId = user; // Replace ObjectId with user document
        });

        subscriptionsNeedingReminder.push(...userSubscriptions);
      }

      logger.info(`Found ${subscriptionsNeedingReminder.length} subscriptions needing renewal reminders`);

      let successCount = 0;
      let failureCount = 0;

      for (const subscription of subscriptionsNeedingReminder) {
        try {
          const user = subscription.userId as unknown as IUserDocument; // User data attached in previous step

          const daysUntilRenewal = Math.ceil(
            (subscription.nextRenewal.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          );

          await EmailService.sendRenewalReminder({
            to: user.email,
            userName: `${user.firstName} ${user.lastName}`,
            subscriptionName: subscription.service,
            renewalDate: subscription.nextRenewal,
            amount: subscription.cost.amount,
            currency: subscription.cost.currency,
            daysUntilRenewal,
          });

          successCount++;
          logger.debug(`Sent renewal reminder for ${subscription.service} to ${user.email}`);
        } catch (error) {
          failureCount++;
          logger.error('Failed to send renewal reminder', {
            error,
            subscriptionId: subscription._id,
            subscriptionName: subscription.service,
          });
        }
      }

      logger.info('Renewal reminder check completed', {
        total: subscriptionsNeedingReminder.length,
        success: successCount,
        failures: failureCount,
      });
    } catch (error) {
      logger.error('Renewal reminder check failed', { error });
    }
  }

  /**
   * Process subscription renewals that are due
   */
  private static async processSubscriptionRenewals() {
    try {
      logger.info('Starting subscription renewal processing...');

      const result = await SubscriptionService.processRenewals();

      logger.info('Subscription renewal processing completed', {
        renewed: result.renewed,
        failed: result.failed,
        total: result.renewed + result.failed
      });
    } catch (error) {
      logger.error('Subscription renewal processing failed', { error });
    }
  }

  /**
   * Get a human-readable name for a job
   */
  private static getJobName(index: number): string {
    const names = ['Daily Renewal Reminders', 'Renewal Processing', 'Development Test'];
    return names[index] || `Job ${index}`;
  }

  /**
   * Manually trigger renewal reminder check (for testing)
   */
  static async triggerRenewalCheck() {
    logger.info('Manually triggering renewal reminder check...');
    await this.checkRenewalReminders();
  }

  /**
   * Manually trigger renewal processing (for testing)
   */
  static async triggerRenewalProcessing() {
    logger.info('Manually triggering subscription renewal processing...');
    await this.processSubscriptionRenewals();
  }
}