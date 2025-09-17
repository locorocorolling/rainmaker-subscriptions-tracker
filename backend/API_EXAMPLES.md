# Quick API Integration

## Base URL
`http://localhost:3001/api`

## 1. Auth Flow
```bash
# Register
POST /auth/register {email, password, firstName, lastName}

# Login → get token
POST /auth/login {email, password}
```

## 2. Use Token (Resource Endpoints Only)
```javascript
// All subscription endpoints need:
headers: { 'Authorization: Bearer YOUR_TOKEN' }
```

## 3. Key Endpoints
```bash
# Auth (no token needed)
POST /auth/register
POST /auth/login
GET  /auth/me

# Subscriptions (token required)
GET  /subscriptions           # List all
POST /subscriptions           # Create
PUT  /subscriptions/:id       # Update
DEL  /subscriptions/:id       # Delete
GET  /subscriptions/stats    # Dashboard data
GET  /subscriptions/upcoming # Renewals

# Health (no token needed)
GET  /health                 # Service status
```

## 4. TypeScript Hook
```typescript
const useAPI = () => {
  const token = localStorage.getItem('token');
  return async (endpoint, options = {}) => {
    const res = await fetch(`/api${endpoint}`, {
      ...options,
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    return res.json();
  };
};
```

## 5. Testing
Visit `/api-docs` for interactive testing.

---

**That's it** - Just the essentials to start integrating.