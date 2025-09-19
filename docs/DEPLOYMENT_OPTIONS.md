# Deployment Options

> **Objective:** Quick deployment guides for getting the application live with minimal setup time.

## Railway (Recommended for Demos)

### Setup Time: ~10 minutes
**Benefits:** Zero configuration, automatic SSL, built-in database hosting.

**Steps:**
```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login and connect repository
railway login
railway link

# 3. Deploy using production Docker setup
# Railway will use docker-compose.prod.yml automatically
git push origin main

# 4. Configure environment variables in Railway dashboard
# MONGODB_URI (Railway provides managed MongoDB)
# JWT_SECRET (generate secure secret)
# RESEND_API_KEY (your Resend API key)
```

**Environment Setup:**
- MongoDB: Automatically provisioned
- Redis: Add from Railway marketplace
- SSL: Automatic with custom domain
- Logs: Built-in dashboard

**Free Tier:** 500 hours/month, perfect for demos and MVPs.

---

## Coolify (Self-Hosted)

### Setup Time: ~30 minutes
**Benefits:** Self-hosted, one-click deployments, cost-effective for multiple projects.

**Prerequisites:**
- VPS with Docker installed (Ubuntu 22.04 recommended)
- Domain pointing to your server

**Coolify Installation:**
```bash
# 1. Install Coolify on your server
curl -fsSL https://get.coolify.io | bash

# 2. Access Coolify dashboard
# https://your-domain.com

# 3. Connect your Git repository
# - Add GitHub/GitLab integration in dashboard
# - Import subscription-tracker repository
```

**Application Setup in Coolify:**
```bash
# Deploy using docker-compose.prod.yml
# Coolify will automatically use the production containers

# Environment variables (set in Coolify dashboard)
MONGODB_URI=mongodb://mongodb:27017/subscription_tracker
REDIS_URL=redis://redis:6379
JWT_SECRET=<generate-strong-secret>
RESEND_API_KEY=<your-resend-key>
NODE_ENV=production
```

**Database Setup:**
- Add MongoDB service in Coolify
- Redis service included (infrastructure ready, jobs currently use node-cron)
- Services auto-connect via Docker network

**Benefits:**
- Multiple projects on one server
- Built-in SSL with Let's Encrypt
- Docker-based deployments
- Cost-effective scaling

---

## Environment Configuration

### Required Variables
```bash
# Database
MONGODB_URI=mongodb://...
REDIS_URL=redis://...

# Authentication
JWT_SECRET=<min-32-characters>
JWT_EXPIRES_IN=7d

# Email Service
RESEND_API_KEY=re_...

# Application
NODE_ENV=production
FRONTEND_URL=https://your-domain.com
BACKEND_URL=https://api.your-domain.com
```

### Generate JWT Secret
```bash
# Strong secret generation
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Quick Comparison

| Platform | Setup Time | Cost | Best For |
|----------|------------|------|----------|
| Railway | 10 min | $0-20/month | Demos, MVPs |
| Coolify | 30 min | VPS cost only | Multiple projects, cost control |

### Railway Use Cases:
- Interview demos
- Quick prototypes
- When you need it live immediately

### Coolify Use Cases:
- Multiple projects
- Long-term cost optimization
- When you have VPS management experience

---

## Production Checklist

- [ ] Environment variables configured
- [ ] HTTPS/SSL enabled
- [ ] Database backup configured
- [ ] Domain pointing to deployment
- [ ] Email service API key active
- [ ] Application health check passing

**Test Deployment:**
1. Register new user
2. Create subscription
3. Verify email notifications work
4. Check dashboard data persistence

---

**Bottom Line:** Railway for immediate deployment, Coolify for cost-effective self-hosting. Both provide production-ready environments with minimal configuration.