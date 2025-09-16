// MongoDB initialization script
db = db.getSiblingDB('subscription_tracker');

// Create application user with read/write access
db.createUser({
  user: 'app_user',
  pwd: 'app_password',
  roles: [
    {
      role: 'readWrite',
      db: 'subscription_tracker'
    }
  ]
});

// Create collections with validation schemas
db.createCollection('users');
db.createCollection('subscriptions');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "createdAt": 1 });

db.subscriptions.createIndex({ "userId": 1, "createdAt": -1 });
db.subscriptions.createIndex({ "status": 1 });
db.subscriptions.createIndex({ "category": 1 });
db.subscriptions.createIndex({ "nextBillingDate": 1 });

print('Database initialized successfully');