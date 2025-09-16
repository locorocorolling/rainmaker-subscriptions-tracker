# Auth Solutions Comparison & Custom Implementation

## Firebase Auth vs Supabase Auth vs Cognito vs Custom

### Firebase Auth (Easiest Setup)
**Setup Time:** 30 minutes
**Pros:**
- Literally just `npm install firebase` and 5 lines of config
- No backend auth code needed - frontend handles everything
- JWT verification is one line: `admin.auth().verifyIdToken(token)`
- Great documentation and examples

**Cons:**
- Google dependency (less enterprise-friendly than AWS)
- Mixing Google + MongoDB is unusual stack
- Less control over user management

**Implementation:**
```javascript
// Frontend: Firebase handles everything
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

// Backend: Just verify tokens
import admin from 'firebase-admin';
const decodedToken = await admin.auth().verifyIdToken(idToken);
```

### Supabase Auth (Moderate Setup)
**Setup Time:** 45-60 minutes  
**Pros:**
- More control than Firebase
- Built-in user management
- Good JWT verification
- Popular in modern stack

**Cons:**
- Requires Supabase project setup
- More configuration than Firebase
- Another external service dependency
- Mixing Supabase + MongoDB is less common

### AWS Cognito (Production-Ready)
**Setup Time:** 1-2 hours
**Pros:**
- Perfect match with DocumentDB
- Enterprise-grade security
- Extensive configuration options
- Shows AWS ecosystem knowledge
- Great for interview "production thinking"

**Cons:**
- Most complex setup (User Pools, Identity Pools, IAM)
- Steep learning curve
- Can be overkill for demo

**Implementation:**
```javascript
// Requires: User Pool creation, Identity Pool setup, IAM roles
const cognitoJwtVerifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID,
  tokenUse: "access",
  clientId: process.env.COGNITO_CLIENT_ID,
});
```

### Custom JWT Auth (Full Control)
**Setup Time:** 2-3 hours
**Pros:**
- Complete control
- No external dependencies
- Fastest for time-constrained project
- Shows security implementation skills
- No service failures during demo

**Cons:**
- More code to write and maintain
- Need to implement password reset, etc.
- Security considerations on you

## Recommended Choice: **Custom JWT Auth**

For your 16-20 hour constraint, custom auth is the best choice because:
1. **Zero external dependencies** - no signup, no API keys, no service downtime
2. **Complete control** - exactly what you need, nothing more
3. **Interview value** - shows you understand auth fundamentals
4. **Speed** - 2-3 hours total vs 1-2 hours setup + learning curve

---

# Custom JWT Auth Implementation

## File Structure
```
src/
├── models/
│   └── User.js
├── middleware/
│   └── auth.js
├── routes/
│   └── auth.js
├── utils/
│   └── jwt.js
└── services/
    └── authService.js
```

## 1. User Model (Mongoose Schema)

```javascript
// src/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
      message: 'Invalid email format'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  preferences: {
    timezone: {
      type: String,
      default: 'America/New_York'
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
    },
    notificationHour: {
      type: Number,
      default: 9,
      min: 0,
      max: 23
    },
    emailNotifications: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

export default mongoose.model('User', userSchema);
```

## 2. JWT Utilities

```javascript
// src/utils/jwt.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

export const generateTokens = (userId) => {
  const payload = { userId };
  
  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'subscription-tracker',
    audience: 'subscription-tracker-users'
  });
  
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
    issuer: 'subscription-tracker',
    audience: 'subscription-tracker-users'
  });
  
  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'subscription-tracker',
      audience: 'subscription-tracker-users'
    });
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'subscription-tracker',
      audience: 'subscription-tracker-users'
    });
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};
```

## 3. Auth Middleware

```javascript
// src/middleware/auth.js
import User from '../models/User.js';
import { verifyAccessToken } from '../utils/jwt.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }
    
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: error.message
    });
  }
};

// Optional: Middleware for optional authentication
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.userId);
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Continue without user for optional auth
    next();
  }
};
```

## 4. Auth Service

```javascript
// src/services/authService.js
import User from '../models/User.js';
import { generateTokens } from '../utils/jwt.js';

export class AuthService {
  static async register({ email, password, name }) {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists with this email');
    }
    
    // Create new user
    const user = new User({ email, password, name });
    await user.save();
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);
    
    return {
      user,
      accessToken,
      refreshToken
    };
  }
  
  static async login({ email, password }) {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);
    
    return {
      user,
      accessToken,
      refreshToken
    };
  }
  
  static async refreshToken(refreshToken) {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);
      
      return {
        accessToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
}
```

## 5. Auth Routes

```javascript
// src/routes/auth.js
import express from 'express';
import Joi from 'joi';
import { AuthService } from '../services/authService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().min(1).max(100).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    
    const result = await AuthService.register(value);
    
    res.status(201).json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    
    const result = await AuthService.login(value);
    
    res.json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token required'
      });
    }
    
    const result = await AuthService.refreshToken(refreshToken);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/auth/me (protected route example)
router.get('/me', authenticateToken, async (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user
    }
  });
});

// POST /api/auth/logout (optional - for token blacklisting)
router.post('/logout', authenticateToken, async (req, res) => {
  // In a production app, you might blacklist the token here
  // For now, just return success (client removes token)
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

export default router;
```

## 6. Environment Variables

```bash
# .env
JWT_SECRET=your-256-bit-secret-key-change-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-different-256-bit-refresh-secret
JWT_REFRESH_EXPIRES_IN=30d
```

## 7. Usage in Main App

```javascript
// src/app.js
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import { authenticateToken } from './middleware/auth.js';

const app = express();

app.use(cors());
app.use(express.json());

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/subscriptions', authenticateToken, subscriptionRoutes);
app.use('/api/analytics', authenticateToken, analyticsRoutes);

export default app;
```

## 8. Frontend Integration Example

```javascript
// Frontend login function
const login = async (email, password) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    return data.data.user;
  } else {
    throw new Error(data.error);
  }
};

// Authenticated API calls
const authenticatedFetch = async (url, options = {}) => {
  const token = localStorage.getItem('accessToken');
  
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};
```

## Time Estimate Breakdown

- **User Model**: 30 minutes
- **JWT Utils**: 45 minutes  
- **Auth Middleware**: 30 minutes
- **Auth Service**: 45 minutes
- **Auth Routes**: 45 minutes
- **Testing & Integration**: 45 minutes

**Total: ~3 hours**

This gives you a production-ready auth system with proper password hashing, JWT tokens, refresh tokens, and clean error handling.
