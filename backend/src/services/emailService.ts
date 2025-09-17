import { Resend } from 'resend';
import { config } from '../utils/config';
import { createLogger, format, transports } from 'winston';

// Create logger for email service
const logger = createLogger({
  level: config.LOG_LEVEL,
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [new transports.Console()],
});

// Initialize Resend
const resend = new Resend(config.RESEND_API_KEY);

// Email templates
const emailTemplates = {
  renewalReminder: ({
    userName,
    subscriptionName,
    renewalDate,
    amount,
    currency,
    daysUntilRenewal,
  }: {
    userName: string;
    subscriptionName: string;
    renewalDate: Date;
    amount: number;
    currency: string;
    daysUntilRenewal: number;
  }) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Subscription Renewal Reminder</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: #4f46e5;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            background: #f9fafb;
            padding: 30px;
            border-radius: 0 0 8px 8px;
        }
        .subscription-info {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #4f46e5;
        }
        .amount {
            font-size: 24px;
            font-weight: bold;
            color: #4f46e5;
        }
        .date {
            font-weight: bold;
            color: #dc2626;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #6b7280;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Subscription Renewal Reminder</h1>
    </div>
    <div class="content">
        <p>Hi ${userName},</p>
        <p>This is a friendly reminder that your subscription will be renewed soon.</p>

        <div class="subscription-info">
            <h3>${subscriptionName}</h3>
            <p><strong>Renewal Date:</strong> <span class="date">${renewalDate.toLocaleDateString()}</span></p>
            <p><strong>Amount:</strong> <span class="amount">${currency} ${amount.toFixed(2)}</span></p>
            <p><strong>Days until renewal:</strong> ${daysUntilRenewal} days</p>
        </div>

        <p>Please ensure you have sufficient funds in your account or consider canceling if you no longer need this subscription.</p>

        <div class="footer">
            <p>This is an automated reminder from your Subscription Tracker.</p>
            <p>To change your notification preferences, please log in to your account.</p>
        </div>
    </div>
</body>
</html>
`,

  weeklyReport: ({
    userName,
    totalSubscriptions,
    upcomingRenewals,
    totalMonthlyCost,
  }: {
    userName: string;
    totalSubscriptions: number;
    upcomingRenewals: number;
    totalMonthlyCost: number;
  }) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Weekly Subscription Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: #4f46e5;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            background: #f9fafb;
            padding: 30px;
            border-radius: 0 0 8px 8px;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            border-left: 4px solid #4f46e5;
        }
        .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #4f46e5;
        }
        .stat-label {
            font-size: 14px;
            color: #6b7280;
            margin-top: 5px;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #6b7280;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Weekly Subscription Report</h1>
    </div>
    <div class="content">
        <p>Hi ${userName},</p>
        <p>Here's your weekly subscription summary:</p>

        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">${totalSubscriptions}</div>
                <div class="stat-label">Total Subscriptions</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${upcomingRenewals}</div>
                <div class="stat-label">Upcoming Renewals</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">$${totalMonthlyCost.toFixed(2)}</div>
                <div class="stat-label">Monthly Cost</div>
            </div>
        </div>

        <p>Log in to your account to view detailed information about your subscriptions.</p>

        <div class="footer">
            <p>This is your weekly subscription report.</p>
            <p>To unsubscribe from these reports, please update your notification preferences.</p>
        </div>
    </div>
</body>
</html>
`,
};

export class EmailService {
  /**
   * Send a renewal reminder email
   */
  static async sendRenewalReminder({
    to,
    userName,
    subscriptionName,
    renewalDate,
    amount,
    currency,
    daysUntilRenewal,
  }: {
    to: string;
    userName: string;
    subscriptionName: string;
    renewalDate: Date;
    amount: number;
    currency: string;
    daysUntilRenewal: number;
  }) {
    try {
      const subject = `Reminder: ${subscriptionName} renews in ${daysUntilRenewal} days`;
      const html = emailTemplates.renewalReminder({
        userName,
        subscriptionName,
        renewalDate,
        amount,
        currency,
        daysUntilRenewal,
      });

      const result = await resend.emails.send({
        from: 'noreply@subscription-tracker.app',
        to,
        subject,
        html,
      });

      logger.info('Renewal reminder email sent', {
        to,
        subscriptionName,
        daysUntilRenewal,
        emailId: result.data?.id,
      });

      return result;
    } catch (error) {
      logger.error('Failed to send renewal reminder email', {
        error,
        to,
        subscriptionName,
      });
      throw error;
    }
  }

  /**
   * Send a weekly report email
   */
  static async sendWeeklyReport({
    to,
    userName,
    totalSubscriptions,
    upcomingRenewals,
    totalMonthlyCost,
  }: {
    to: string;
    userName: string;
    totalSubscriptions: number;
    upcomingRenewals: number;
    totalMonthlyCost: number;
  }) {
    try {
      const subject = 'Your Weekly Subscription Report';
      const html = emailTemplates.weeklyReport({
        userName,
        totalSubscriptions,
        upcomingRenewals,
        totalMonthlyCost,
      });

      const result = await resend.emails.send({
        from: 'noreply@subscription-tracker.app',
        to,
        subject,
        html,
      });

      logger.info('Weekly report email sent', {
        to,
        totalSubscriptions,
        totalMonthlyCost,
        emailId: result.data?.id,
      });

      return result;
    } catch (error) {
      logger.error('Failed to send weekly report email', {
        error,
        to,
      });
      throw error;
    }
  }

  /**
   * Test email service configuration
   */
  static async testConnection() {
    if (!config.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    try {
      // Send a test email to verify API key is valid
      const result = await resend.emails.send({
        from: 'noreply@subscription-tracker.app',
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<p>This is a test email to verify the Resend configuration.</p>',
      });

      logger.info('Email service test completed', {
        emailId: result.data?.id,
      });

      return result;
    } catch (error) {
      logger.error('Email service test failed', { error });
      throw error;
    }
  }
}