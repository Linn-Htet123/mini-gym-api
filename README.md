# 📦 Deliverables

Backend GitHub Repository: https://github.com/Linn-Htet123/mini-gym-api.git
Frontend GitHub Repository: https://github.com/Linn-Htet123/mini-gym-ui.git
Loom Demo Video: https://drive.google.com/file/d/1kfYwcRMERTjLhpah9gqVTJ3Uss2Nf9KJ/view?usp=sharing

## Overview

The Gym Check-in System is built using a modular monolithic architecture
with NestJS and follows Domain-Driven Design (DDD) principles.

# 🚀 Setup Instructions

### Prerequisites

- Node.js 18+\
- Docker\
- npm

### Steps

    git clone https://github.com/Linn-Htet123/mini-gym-api
    npm install
    cp .env.example .env
    docker-compose up -d
    npm run migration:run
    npm run seed
    npm run start:dev

### Access

- API: http://localhost:3000\
- Docs: /api\
- pgAdmin: http://localhost:1234\
- Default admin: admin@gym.com / Admin@123

## Architecture Layers

### 1. Presentation Layer

- **Controllers**: Handle HTTP requests/responses\
- **DTOs**: Validation\
- **Guards & Interceptors**: Auth, authorization, formatting\
- **WebSocket Gateway**: Real-time notifications

### 2. Application Layer

- **Services**: Business logic\
- **Use Cases**: Registration, check-in, subscription\
- **Event Handlers**: Subscription expiry

### 3. Domain Layer

- **Entities**\
- **Value Objects**\
- **Domain Logic**

### 4. Infrastructure Layer

- **TypeORM**\
- **PostgreSQL**\
- **File Uploads**\
- **JWT Authentication**

# 🗂️ Module Structure

    src/
    ├── auth/
    ├── users/
    ├── members/
    ├── membership-packages/
    ├── registrations/
    ├── subscriptions/
    ├── check-ins/
    ├── notifications/
    ├── gateways/
    ├── trainers/
    ├── trainer-subscriptions/
    └── common/

    db/
    ├── datasource.ts
    ├── migrations/
    └── seeds/

# 🛠️ Technology Stack

### Backend

- NestJS\
- TypeORM\
- PostgreSQL\
- Passport + JWT\
- Socket.IO\
- Multer\
- Node-cron

### DevOps

- Docker\
- TypeScript strict\
- ESLint + Prettier

# 🗄️ Database Schema

### Core Tables

- users\
- members\
- membership_packages\
- member_registrations\
- subscriptions\
- check_ins\
- notifications\
- trainers\
- trainer_subscriptions

# ✅ Features Implemented

- Registration with screenshot upload\
- Package CRUD\
- Approval workflow\
- Real-time notifications\
- Check-in validation\
- Subscription monitoring\
- Trainer management\
- JWT auth\
- Migrations & seeds\
- Docker support

# 🎯 Design Decisions

- Migrations ensure DB consistency\
- Modular architecture\
- WebSocket real-time updates\
- JWT for scalability\
- Cron for subscription automation\
- Local upload (extendable to S3)

# 📝 Notes

- Timestamps use UTC\
- Uploads stored in `/uploads`\
- Notifications persist\
- Cron auto-updates subscription status
