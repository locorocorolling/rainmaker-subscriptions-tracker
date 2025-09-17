import * as cron from 'node-cron';
import { UserModel } from '../models/User';
import { SubscriptionModel } from '../models/Subscription';
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

    logger.info('Starting background job service...');

    // Daily job to check for renewal reminders (runs at 9:00 AM every day)
    const dailyRenewalJob = cron.schedule('0 9 * * *', async () => {
      await this.checkRenewalReminders();
    }, {
      timezone: 'UTC'
    });

    // Development job that runs every minute for testing
    const devTestJob = cron.schedule('* * * * *', async () => {
      if (config.NODE_ENV === 'development') {
        logger.debug('Development test job running...');
        // Uncomment for testing: await this.checkRenewalReminders();
      }
    }, {
      timezone: 'UTC'
    });

    this.jobs = [dailyRenewalJob, devTestJob];

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

      const reminderDays = config.NOTIFICATION_REMINDER_DAYS;
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + reminderDays);

      // Find all active subscriptions that are due for renewal reminder
      const subscriptionsNeedingReminder = await SubscriptionModel.find({
        nextRenewal: {
          $lte: targetDate,
          $gte: new Date(), // Only future renewals
        },
        status: 'active',
      }).populate('userId');

      logger.info(`Found ${subscriptionsNeedingReminder.length} subscriptions needing renewal reminders`);

      let successCount = 0;
      let failureCount = 0;

      for (const subscription of subscriptionsNeedingReminder) {
        try {
          const user = subscription.userId as any; // This will be populated user data

          // Check if user wants renewal reminders
          if (!user.preferences?.notifications?.renewalReminders || !user.preferences?.notifications?.email) {
            logger.debug(`Skipping email for user ${user.email} - notifications disabled`);
            continue;
          }

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
   * Get a human-readable name for a job
   */
  private static getJobName(index: number): string {
    const names = ['Daily Renewal Reminders', 'Development Test'];
    return names[index] || `Job ${index}`;
  }

  /**
   * Manually trigger renewal reminder check (for testing)
   */
  static async triggerRenewalCheck() {
    logger.info('Manually triggering renewal reminder check...');
    await this.checkRenewalReminders();
  }
}