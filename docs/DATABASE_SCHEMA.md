# Database Schema & Collections

> **Objective:** Document MongoDB collections, indexes, and data relationships for development and maintenance.

## Collections Overview

### Users Collection
**Purpose:** Store user authentication and profile data.

```javascript
{
  _id: ObjectId("..."),
  name: "John Doe",              // Optional display name
  email: "user@example.com",     // Unique, required
  password: "$2b$10$...",         // bcrypt hashed
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

**Indexes:**
```javascript
// Unique email for authentication
db.users.createIndex({ email: 1 }, { unique: true })

// Query performance for login
db.users.createIndex({ email: 1, password: 1 })
```

---

### Subscriptions Collection
**Purpose:** Store user subscription data with billing information.

```javascript
{
  _id: ObjectId("..."),
  userId: ObjectId("..."),       // Reference to users collection
  name: "Netflix",               // Service name
  cost: 15.99,                   // Monthly cost in user's currency
  currency: "USD",               // ISO currency code
  billingDate: 15,               // Day of month (1-31)
  category: "Entertainment",     // Service category
  isActive: true,                // Active/cancelled status
  nextBilling: ISODate("..."),   // Calculated next billing date
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

**Indexes:**
```javascript
// User's subscriptions lookup
db.subscriptions.createIndex({ userId: 1 })

// Active subscriptions for dashboard
db.subscriptions.createIndex({ userId: 1, isActive: 1 })

// Billing notifications (background jobs)
db.subscriptions.createIndex({
  nextBilling: 1,
  isActive: 1
})

// Category filtering
db.subscriptions.createIndex({ userId: 1, category: 1 })
```

---

## Data Relationships

### User → Subscriptions (One-to-Many)
```javascript
// Find user's subscriptions
db.subscriptions.find({ userId: ObjectId("...") })

// Aggregate user spending
db.subscriptions.aggregate([
  { $match: { userId: ObjectId("..."), isActive: true } },
  { $group: { _id: null, total: { $sum: "$cost" } } }
])
```

---

## Query Patterns

### Dashboard Data Loading
```javascript
// Monthly total calculation
db.subscriptions.aggregate([
  {
    $match: {
      userId: ObjectId("..."),
      isActive: true
    }
  },
  {
    $group: {
      _id: "$currency",
      total: { $sum: "$cost" },
      count: { $sum: 1 }
    }
  }
])
```

### Upcoming Renewals
```javascript
// Next 7 days billing
const nextWeek = new Date();
nextWeek.setDate(nextWeek.getDate() + 7);

db.subscriptions.find({
  userId: ObjectId("..."),
  isActive: true,
  nextBilling: {
    $gte: new Date(),
    $lte: nextWeek
  }
}).sort({ nextBilling: 1 })
```

### Category Analytics
```javascript
// Spending by category
db.subscriptions.aggregate([
  { $match: { userId: ObjectId("..."), isActive: true } },
  {
    $group: {
      _id: "$category",
      total: { $sum: "$cost" },
      services: { $push: "$name" }
    }
  },
  { $sort: { total: -1 } }
])
```

---

## Background Job Queries

### Email Notification System
```javascript
// Find subscriptions needing reminders
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
tomorrow.setHours(0, 0, 0, 0);

const dayAfter = new Date(tomorrow);
dayAfter.setDate(dayAfter.getDate() + 1);

db.subscriptions.aggregate([
  {
    $match: {
      isActive: true,
      nextBilling: { $gte: tomorrow, $lt: dayAfter }
    }
  },
  {
    $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "_id",
      as: "user"
    }
  }
])
```

---

## Data Validation

### Mongoose Schemas
```javascript
// User schema validation
const userSchema = new Schema({
  name: { type: String, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: { type: String, required: true, minlength: 6 }
});

// Subscription schema validation
const subscriptionSchema = new Schema({
  userId: { type: ObjectId, required: true, index: true },
  name: { type: String, required: true, trim: true },
  cost: { type: Number, required: true, min: 0 },
  currency: { type: String, required: true, length: 3 },
  billingDate: { type: Number, min: 1, max: 31 },
  category: { type: String, trim: true },
  isActive: { type: Boolean, default: true }
});
```

---

## Performance Considerations

### Index Strategy
- **Users:** Single unique index on email sufficient for authentication
- **Subscriptions:** Compound indexes for common query patterns
- **Background Jobs:** Index on nextBilling + isActive for efficient job processing

### Query Optimization
- Use projection to limit returned fields for large collections
- Aggregate pipelines more efficient than multiple queries
- Index hint for complex queries if needed

### Scaling Patterns
- **Current:** Single MongoDB instance handles 10k+ users
- **Growth:** Add read replicas for dashboard queries
- **Large Scale:** Consider sharding by userId for 100k+ users

---

**Bottom Line:** Schema designed for efficient user queries and background job processing. Indexes optimize common access patterns while maintaining flexibility for feature growth.