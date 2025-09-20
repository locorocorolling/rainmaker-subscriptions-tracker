// MongoDB initialization script for subscription tracker
// Matches current schema and supports environment variable injection
db = db.getSiblingDB('subscription_tracker');

// Create application user with read/write access (if credentials provided)
if (process.env.MONGO_APP_USERNAME && process.env.MONGO_APP_PASSWORD) {
  try {
    db.createUser({
      user: process.env.MONGO_APP_USERNAME,
      pwd: process.env.MONGO_APP_PASSWORD,
      roles: [
        {
          role: 'readWrite',
          db: 'subscription_tracker'
        }
      ]
    });
    print('Application user created successfully');
  } catch (error) {
    if (error.code === 11000) {
      print('Application user already exists, skipping creation');
    } else {
      print('Error creating application user: ' + error.message);
    }
  }
} else {
  print('No application user credentials provided, skipping user creation');
}

// Create collections with proper structure
db.createCollection('users');
db.createCollection('subscriptions');

// Create indexes for users collection (matching User.ts model)
try {
  db.users.createIndex({ "email": 1 }, { unique: true });
  db.users.createIndex({ "isActive": 1 });
  db.users.createIndex({ "createdAt": 1 });
  print('User indexes created successfully');
} catch (error) {
  print('Error creating user indexes: ' + error.message);
}

// Create indexes for subscriptions collection (matching Subscription.ts model)
try {
  db.subscriptions.createIndex({ "userId": 1, "createdAt": -1 });
  db.subscriptions.createIndex({ "status": 1, "nextRenewal": 1 }); // Compound index for renewals and reminders
  db.subscriptions.createIndex({ "category": 1 });
  db.subscriptions.createIndex({ "userId": 1, "status": 1 });
  print('Subscription indexes created successfully');
} catch (error) {
  print('Error creating subscription indexes: ' + error.message);
}

print('Database initialization completed successfully');