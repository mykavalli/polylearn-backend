# Quick Test Guide - Backend API (Local)

## Prerequisites Checklist

- [x] Node.js 20+ installed
- [x] PostgreSQL installed & running
- [x] Redis installed & running (optional)
- [x] Firebase project created
- [x] Firebase service account key downloaded

---

## Step 1: Setup Environment (5 minutes)

### 1.1 Install Dependencies

```bash
cd backend-template
npm install
```

### 1.2 Configure Environment

```bash
# Copy example env
cp .env.example .env

# Edit .env (Windows: notepad .env, Mac/Linux: nano .env)
```

**Minimum required config:**

```env
NODE_ENV=development
PORT=3000

# Database (adjust if needed)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=polylearn
DB_USER=polylearn_user
DB_PASSWORD=your_password_here

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Firebase
FIREBASE_PROJECT_ID=your-firebase-project-id
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json

# JWT
JWT_SECRET=my_super_secret_key_for_development_only
```

### 1.3 Place Firebase Service Account Key

```bash
# Download from Firebase Console:
# Project Settings → Service Accounts → Generate new private key

# Save as:
backend-template/service-account-key.json
```

---

## Step 2: Setup Database (3 minutes)

### 2.1 Create Database & User

**PostgreSQL command line:**

```bash
# Connect to PostgreSQL
psql -U postgres

# In psql prompt:
CREATE DATABASE polylearn;
CREATE USER polylearn_user WITH PASSWORD 'your_password_here';
GRANT ALL PRIVILEGES ON DATABASE polylearn TO polylearn_user;
\q
```

**Or use pgAdmin:**
1. Right-click Databases → Create → Database
2. Name: `polylearn`
3. Owner: Create new user `polylearn_user`

### 2.2 Run Migrations

```bash
npm run migrate:up
```

**Verify tables created:**

```bash
psql -U polylearn_user -d polylearn -c "\dt"

# Should show:
# users
# pets (if migration exists)
# lessons (if migration exists)
```

---

## Step 3: Start Server (1 minute)

```bash
npm run dev
```

**Expected output:**

```
[INFO] Server running on port 3000
[INFO] API Version: v1
[INFO] Environment: development
```

---

## Step 4: Test API (5 minutes)

### 4.1 Health Check

**Terminal:**

```bash
curl http://localhost:3000/health
```

**Expected response:**

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "services": {
      "database": "connected",
      "redis": "connected"
    }
  }
}
```

**Browser:**

Open: http://localhost:3000/health

### 4.2 Get Firebase ID Token

**Option A - From Flutter App (Recommended):**

```dart
final user = FirebaseAuth.instance.currentUser;
if (user != null) {
  final token = await user.getIdToken();
  print('Token: $token');
}
```

Copy token from console.

**Option B - Firebase Console:**

1. Go to Firebase Console → Authentication
2. Create test user or sign in
3. Open DevTools → Application → IndexedDB
4. Find `firebaseLocalStorageDb` → `stsTokenManager` → `accessToken`
5. Copy the token

**Option C - Quick Test User:**

Use Firebase REST API:

```bash
# Sign up test user
curl -X POST 'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=YOUR_API_KEY' \
-H 'Content-Type: application/json' \
-d '{
  "email": "test@example.com",
  "password": "password123",
  "returnSecureToken": true
}'

# Get idToken from response
```

### 4.3 Test Register Endpoint

**Using curl:**

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"displayName": "Test User"}'
```

**Expected response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "1",
      "firebaseUid": "firebase-uid",
      "email": "test@example.com",
      "displayName": "Test User",
      "streakDays": 0,
      "subscriptionTier": "free",
      "createdAt": "2026-01-21T..."
    }
  }
}
```

### 4.4 Test Login Endpoint

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN_HERE"
```

### 4.5 Test Get Profile

```bash
curl -X GET http://localhost:3000/api/v1/user/profile \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN_HERE"
```

### 4.6 Test Update Profile

```bash
curl -X PUT http://localhost:3000/api/v1/user/profile \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "Updated Name",
    "learningLanguage": "ko"
  }'
```

---

## Step 5: Test with Postman (Recommended)

### 5.1 Import Collection

1. Open Postman
2. Import → Create folder `PolyLearn API`
3. Add requests from [API_TESTING.md](./docs/API_TESTING.md)

### 5.2 Create Environment

Create environment with variables:

```
baseUrl: http://localhost:3000
firebaseToken: <your-firebase-id-token>
```

### 5.3 Run Collection

Test all endpoints in order:
1. Health Check
2. Register
3. Login
4. Get Profile
5. Update Profile

---

## Common Issues & Solutions

### ❌ Cannot connect to database

**Error:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**
```bash
# Check PostgreSQL running
# Windows: Services → PostgreSQL
# Mac: brew services list
# Linux: sudo systemctl status postgresql

# Start if not running
# Mac: brew services start postgresql
# Linux: sudo systemctl start postgresql
```

### ❌ Cannot connect to Redis

**Error:**
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

**Solution:**
```bash
# Start Redis
# Mac: brew services start redis
# Linux: sudo systemctl start redis-server
# Windows: redis-server.exe
```

**Or:** Comment out Redis code in development (optional)

### ❌ Migration failed

**Error:**
```
relation "users" already exists
```

**Solution:**
```bash
# Drop and recreate database
psql -U postgres
DROP DATABASE polylearn;
CREATE DATABASE polylearn;
GRANT ALL PRIVILEGES ON DATABASE polylearn TO polylearn_user;
\q

# Run migrations again
npm run migrate:up
```

### ❌ Firebase token invalid

**Error:**
```
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Invalid or expired authentication token"
  }
}
```

**Solution:**
- Firebase tokens expire after 1 hour
- Get new token from Firebase
- Make sure `service-account-key.json` is correct
- Check `FIREBASE_PROJECT_ID` matches your project

### ❌ Port 3000 already in use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**

```bash
# Find process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -i :3000
kill -9 <PID>

# Or change port in .env
PORT=3001
```

---

## Verification Checklist

After testing, verify:

- [x] Server starts without errors
- [x] Health check returns "healthy"
- [x] Database connection working
- [x] Redis connection working (or disabled)
- [x] Register creates user in database
- [x] Login returns user data
- [x] Get profile returns current user
- [x] Update profile modifies user data
- [x] No error logs in console

---

## Check Database

```bash
# Connect to database
psql -U polylearn_user -d polylearn

# In psql:
\dt                           # List tables
SELECT * FROM users;          # View users
SELECT COUNT(*) FROM users;   # Count users
\q                            # Quit
```

---

## Stop Server

Press `Ctrl+C` in terminal running dev server.

---

## Next Steps

✅ Local testing successful?

→ **Ready for Flutter integration!** (Ngày 7)

❌ Having issues?

→ Check:
1. All services running (PostgreSQL, Redis)
2. `.env` configured correctly
3. `service-account-key.json` exists
4. Migrations ran successfully
5. Logs in terminal for errors

---

## Quick Reference

```bash
# Start everything
npm run dev

# Stop server
Ctrl+C

# Rebuild
npm run build

# Run migrations
npm run migrate:up

# Rollback migrations
npm run migrate:down

# Check logs
# Logs appear in terminal where npm run dev is running
```

---

## Testing Flow

```
1. Start server (npm run dev)
   ↓
2. Test health check (curl or browser)
   ↓
3. Get Firebase token (from Flutter app or console)
   ↓
4. Test register (create user)
   ↓
5. Test login (get user)
   ↓
6. Test profile endpoints
   ↓
7. Verify data in database
   ↓
8. ✅ Success!
```

---

**Total Time:** ~15 minutes
**Difficulty:** Easy
**Prerequisites:** PostgreSQL, Node.js, Firebase account

**Need help?** Check [VPS_DEPLOYMENT.md](./docs/VPS_DEPLOYMENT.md) troubleshooting section.
