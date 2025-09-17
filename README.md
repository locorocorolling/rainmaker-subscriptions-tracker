# Subscription Tracker

> **Interview Project for Rainmaker** | Professional subscription management platform built in 16-20 hours

A modern subscription tracking application that helps users manage recurring subscriptions, monitor spending patterns, and receive intelligent renewal notifications.

**🚀 [Live Demo](https://placeholder-demo-url.railway.app)** | **📊 [API Documentation](./docs/api)** | **🏗️ [System Architecture](./docs/TECHNICAL_DECISIONS.md)**

## Tech Stack

**Frontend:** React + Vite + TypeScript + TanStack Query + shadcn/ui
**Backend:** Node.js + Express + TypeScript + MongoDB + Redis
**Infrastructure:** Docker Compose + Background Jobs + Redis
**Auth & Security:** JWT authentication + protected routes
**Deployment:** Railway (demo) / Docker (production)

## ⚡ Quick Start

**Prerequisites:** Node.js 18+, Docker, pnpm

```bash
# 1. Clone and setup environment
git clone <repository-url>
cd subscription-tracker

# Copy environment files
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 2. Install dependencies (in each folder)
cd frontend && pnpm install
cd ../backend && pnpm install && cd ..

# 3. Start infrastructure
docker-compose -f docker-compose.dev.yml up -d

# 4. Start development servers (separate terminals)
cd frontend && pnpm run dev    # Terminal 1
cd backend && pnpm run dev     # Terminal 2

# 5. Visit the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:3001
# API Docs: http://localhost:3001/api-docs
```

**Success indicators:** You should see the subscription dashboard with authentication modal and sample data.

## 🎯 Key Features & Technical Highlights

### **Smart Currency Detection**
- **Timezone-based detection** with locale fallback system
- **43+ supported currencies** with proper formatting
- **Auto-detection flow:** User timezone → Country mapping → Currency selection

### **Intelligent Service Autocomplete**
- **30+ popular services** with logos, categories, and pricing data
- **Auto-category setting** when selecting suggested services
- **Free-form input** with smart suggestions for custom services

### **Real-time Data Synchronization**
- **TanStack Query** for smart caching and background sync
- **Optimistic updates** with automatic rollback on failure
- **Background refetching** for always-current subscription data

### **Background Job System**
- **node-cron scheduler** for daily renewal reminders (9:00 AM UTC)
- **Email notifications** with HTML templates via Resend
- **Configurable reminder periods** and notification preferences

### **Secure Authentication**
- **JWT-based authentication** with localStorage persistence
- **Protected routes** and API endpoint security
- **Session management** with automatic token refresh

## 🚀 Development Commands

```bash
# Local Development (recommended)
docker-compose -f docker-compose.dev.yml up -d  # Infrastructure + admin tools
cd frontend && pnpm run dev    # Terminal 1
cd backend && pnpm run dev     # Terminal 2

# Useful commands
docker-compose -f docker-compose.dev.yml logs mongodb   # View MongoDB logs
docker-compose -f docker-compose.dev.yml exec mongodb mongosh  # MongoDB shell

# Admin interfaces (development only)
# http://localhost:8081 - Mongo Express
# http://localhost:8082 - Redis Commander

# Production deployment (Railway/Coolify)
docker-compose -f docker-compose.prod.yml up -d
# Frontend: http://localhost:3000 (SSR production build)
# Backend: http://localhost:3001
```

## 📚 Documentation

### **System Design & Architecture**
- **[Technical Decisions](./docs/TECHNICAL_DECISIONS.md)** - Key design choices, challenges, and scaling considerations *(to be added)*
- **[Library Choices](./docs/LIBRARY_CHOICES.md)** - Rationale for chosen libraries and time-saving decisions *(to be added)*
- **[Best Practices](./docs/BEST_PRACTICES.md)** - Form validation, TypeScript patterns, and development standards *(to be added)*
- **[Deployment Guide](./docs/DEPLOYMENT_OPTIONS.md)** - Railway, Docker, and production setup *(to be added)*

### **API & Development**
- **[API Documentation](./docs/api)** - Interactive Swagger/OpenAPI docs
- **[Database Schema](./docs/DATABASE_SCHEMA.md)** - MongoDB collections and indexes *(to be added)*
- **[Development Workflow](./AGENTS.md)** - Setup, commands, and best practices

## 🔧 Environment Configuration

**Three .env files are required:**

### Root `.env` (Docker infrastructure)
```bash
# Copy .env.example to .env
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=secure_mongo_root_pass_change_me
MONGO_EXPRESS_USERNAME=admin
MONGO_EXPRESS_PASSWORD=admin_secure_pass_change_me
REDIS_COMMANDER_USERNAME=admin
REDIS_COMMANDER_PASSWORD=redis_admin_pass_change_me
```

### Backend `.env` (Application config)
```bash
# Already configured in backend/.env.example
MONGODB_URI=mongodb://localhost:27017/subscription_tracker
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
RESEND_API_KEY=your-resend-api-key
# ... other backend settings
```

### Frontend `.env` (Client config)
```bash
# Simple frontend configuration
VITE_API_URL=http://localhost:3001/api
```

## 🤖 AI Tool Disclosure

This project was developed with assistance from **Claude Code** for:

*(Detailed disclosure section to be completed)*

- Form component implementation and validation
- TypeScript error resolution and type safety
- Currency formatting integration
- UI component development and styling
- API endpoint testing and debugging

**What I built/modified myself:** *(to be detailed)*

## 📋 Project Deliverables

- ✅ **GitHub Repository** with comprehensive README
- ✅ **Working Application** with Docker setup
- ✅ **API Documentation** via Swagger/OpenAPI
- 🔄 **Demo Video** (5-10 minutes) *(in progress)*
- 🔄 **Technical Document** (1-2 pages) *(in progress)*

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │───▶│  Express API    │───▶│   MongoDB       │
│   (Port 5173)   │    │  (Port 3001)    │    │   (Port 27017)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Redis Queue   │
                       │   (Port 6379)   │
                       └─────────────────┘
```

**Key Components:**
- **Frontend:** React SPA with TanStack Query for state management
- **Backend:** RESTful API with JWT authentication and background jobs
- **Database:** MongoDB with optimized indexes and aggregation pipelines
- **Queue:** Redis-backed job queue for email notifications and renewals

---

**📧 Contact:** For questions about implementation details or technical decisions, please see the documentation links above or review the commit history for development context.