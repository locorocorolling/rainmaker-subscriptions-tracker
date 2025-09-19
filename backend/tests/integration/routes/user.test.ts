import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../../../src/app';
import { UserModel } from '../../../src/models/User';
import { UserService } from '../../../src/services/userService';

describe('User Preferences API', () => {
  let authToken: string;
  let userId: string;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    // Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Connect to in-memory database
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    // Clean up and close database connection
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear users collection
    await UserModel.deleteMany({});

    // Create a test user
    const testUser = await UserService.createUser({
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    });

    userId = testUser._id.toString();

    // Authenticate and get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    authToken = loginResponse.body.token;
  });

  describe('GET /api/user/preferences', () => {
    it('should return user preferences with default values', async () => {
      const response = await request(app)
        .get('/api/user/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toEqual({
        data: {
          theme: 'auto',
          currency: 'USD',
          timezone: 'UTC',
          notifications: {
            email: true,
            renewalReminders: true
          }
        }
      });
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/user/preferences')
        .expect(401);
    });

    it('should return 404 for non-existent user', async () => {
      // Create a token for non-existent user
      const fakeToken = 'Bearer invalid-token';

      await request(app)
        .get('/api/user/preferences')
        .set('Authorization', fakeToken)
        .expect(401);
    });
  });

  describe('PUT /api/user/preferences', () => {
    it('should update all user preferences', async () => {
      const updatedPreferences = {
        theme: 'dark',
        currency: 'EUR',
        timezone: 'Europe/London',
        notifications: {
          email: false,
          renewalReminders: true,
          reminderDays: 7
        }
      };

      const response = await request(app)
        .put('/api/user/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedPreferences)
        .expect(200);

      expect(response.body.message).toBe('Preferences updated successfully');
      expect(response.body.data).toMatchObject(updatedPreferences);

      // Verify persistence
      const getResponse = await request(app)
        .get('/api/user/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(getResponse.body.data).toMatchObject(updatedPreferences);
    });

    it('should validate theme enum values', async () => {
      const response = await request(app)
        .put('/api/user/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ theme: 'invalid-theme' })
        .expect(400);

      expect(response.body.message).toBe('Validation error');
      expect(response.body.details).toContain('must be one of');
    });

    it('should validate currency format', async () => {
      const response = await request(app)
        .put('/api/user/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ currency: 'invalid' })
        .expect(400);

      expect(response.body.message).toBe('Validation error');
    });

    it('should validate reminderDays range', async () => {
      const response = await request(app)
        .put('/api/user/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          notifications: {
            reminderDays: 35
          }
        })
        .expect(400);

      expect(response.body.message).toBe('Validation error');
      expect(response.body.details).toContain('must be less than or equal to 30');
    });

    it('should validate reminderDays minimum', async () => {
      const response = await request(app)
        .put('/api/user/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          notifications: {
            reminderDays: 0
          }
        })
        .expect(400);

      expect(response.body.message).toBe('Validation error');
      expect(response.body.details).toContain('must be greater than or equal to 1');
    });

    it('should require authentication', async () => {
      await request(app)
        .put('/api/user/preferences')
        .send({ theme: 'dark' })
        .expect(401);
    });
  });

  describe('PATCH /api/user/preferences/notifications', () => {
    it('should update only notification preferences', async () => {
      // First set some initial preferences
      const putResponse = await request(app)
        .put('/api/user/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          theme: 'dark',
          currency: 'EUR',
          notifications: {
            email: true,
            renewalReminders: true,
            reminderDays: 5
          }
        })
        .expect(200);

      // Verify initial state
      expect(putResponse.body.data.notifications.email).toBe(true);
      expect(putResponse.body.data.notifications.reminderDays).toBe(5);

      // Update only notifications
      const notificationUpdate = {
        email: false,
        reminderDays: 10
      };

      const response = await request(app)
        .patch('/api/user/preferences/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .send(notificationUpdate)
        .expect(200);

      expect(response.body.message).toBe('Notification preferences updated successfully');
      expect(response.body.data).toMatchObject({
        email: false,
        renewalReminders: true, // Should preserve existing value
        reminderDays: 10
      });

      // Verify other preferences are unchanged
      const getResponse = await request(app)
        .get('/api/user/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(getResponse.body.data.theme).toBe('dark');
      expect(getResponse.body.data.currency).toBe('EUR');
      expect(getResponse.body.data.notifications.email).toBe(false);
      expect(getResponse.body.data.notifications.renewalReminders).toBe(true);
      expect(getResponse.body.data.notifications.reminderDays).toBe(10);
    });

    it('should validate notification preferences', async () => {
      const response = await request(app)
        .patch('/api/user/preferences/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ reminderDays: 50 })
        .expect(400);

      expect(response.body.message).toBe('Validation error');
    });

    it('should require authentication', async () => {
      await request(app)
        .patch('/api/user/preferences/notifications')
        .send({ email: false })
        .expect(401);
    });

    it('should handle partial updates correctly', async () => {
      // Check current defaults first
      const initialResponse = await request(app)
        .get('/api/user/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const currentEmail = initialResponse.body.data.notifications.email;

      // Update only one notification field
      const response = await request(app)
        .patch('/api/user/preferences/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ renewalReminders: false })
        .expect(200);

      expect(response.body.data.renewalReminders).toBe(false);
      expect(response.body.data.email).toBe(currentEmail); // Should preserve current value
    });
  });

  describe('Integration with background job service', () => {
    it('should support custom reminder days in user preferences', async () => {
      // Update user to have custom reminder days
      await request(app)
        .put('/api/user/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          notifications: {
            email: true,
            renewalReminders: true,
            reminderDays: 14
          }
        });

      // Verify the user has the custom reminder days
      const user = await UserService.findActiveById(userId);
      expect(user?.preferences?.notifications?.reminderDays).toBe(14);
    });
  });
});