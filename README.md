# PolyLearn Backend

Backend API cho PolyLearn Language Learning App.

## 🛠️ Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js + TypeScript
- **Database**: PostgreSQL 16
- **Cache**: Redis
- **Authentication**: Firebase Admin SDK
- **Cloud**: Google Cloud (TTS, STT, Vertex AI)

## 📁 Project Structure

```
backend-template/
├── src/
│   ├── config/
│   │   ├── database.ts      # PostgreSQL connection
│   │   ├── redis.ts         # Redis connection
│   │   ├── firebase.ts      # Firebase Admin
│   │   └── logger.ts        # Winston logger
│   ├── middleware/
│   │   ├── auth.ts          # Firebase token verification
│   │   └── errorHandler.ts # Global error handling
│   ├── routes/
│   │   ├── auth.ts          # Auth endpoints
│   │   ├── user.ts          # User endpoints
│   │   ├── pet.ts           # Pet endpoints
│   │   └── lessons.ts       # Lesson endpoints
│   ├── controllers/         # Business logic (TODO)
│   ├── models/              # Database models (TODO)
│   ├── services/            # External services (TODO)
│   └── app.ts               # Main application
├── migrations/              # Database migrations
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Edit `.env` với thông tin của bạn:
- Database credentials
- Firebase service account path
- Google Cloud project ID

### 3. Database Setup

```bash
# Create PostgreSQL database
createdb polylearn

# Run migrations
npm run migrate:up
```

### 4. Start Development Server

```bash
npm run dev
```

Server sẽ chạy trên `http://localhost:3000`

## 📚 API Documentation

Xem [API.md](../docs/API.md) cho chi tiết endpoints.

### Base URL
- **Development**: `http://localhost:3000/v1`
- **Production**: `https://api.polylearn.com/v1`

### Authentication

Tất cả endpoints (trừ public) yêu cầu Firebase ID Token:

```http
Authorization: Bearer <FIREBASE_ID_TOKEN>
```

## 🧪 Testing

```bash
# Health check
curl http://localhost:3000/health

# Test with Postman
# Import collection từ docs/API.md
```

## 🚀 Deployment

Xem [VPS_SETUP.md](../docs/VPS_SETUP.md) cho hướng dẫn deploy chi tiết.

### Quick Deploy với PM2

```bash
# Build TypeScript
npm run build

# Start with PM2
pm2 start dist/app.js --name polylearn-api

# Save PM2 config
pm2 save
pm2 startup
```

## 📊 Database Migrations

```bash
# Create new migration
npm run migrate:create <migration-name>

# Run migrations
npm run migrate:up

# Rollback
npm run migrate:down
```

## 🔒 Security

- Firebase Admin SDK cho authentication
- Helmet.js cho security headers
- CORS configured
- Rate limiting (TODO)
- Input validation (TODO)

## 📝 To-Do

- [ ] Implement pet routes
- [ ] Implement lesson routes
- [ ] Implement pronunciation routes (STT)
- [ ] Implement leaderboard routes
- [ ] Add input validation (express-validator)
- [ ] Add rate limiting
- [ ] Add unit tests (Jest)
- [ ] Add API documentation (Swagger)
- [ ] Add request logging (Morgan)

## 📞 Support

For issues, contact: [@mykavalli](https://github.com/mykavalli)

---

**Created**: January 19, 2026
