# PolyLearn Backend - Scripts

Các script hỗ trợ development và deployment.

## Development Scripts (Local)

### Setup (Lần đầu)

**Linux/Mac:**
```bash
chmod +x scripts/*.sh
./scripts/setup.sh
```

**Windows:**
```cmd
scripts\setup.bat
```

Script này sẽ:
- ✅ Kiểm tra Node.js
- ✅ Install dependencies
- ✅ Copy .env.example → .env
- ✅ Build TypeScript

### Start Development Server

**Linux/Mac:**
```bash
./scripts/start-dev.sh
```

**Windows:**
```cmd
scripts\start-dev.bat
```

Script này sẽ:
- ✅ Kiểm tra PostgreSQL connection
- ✅ Kiểm tra Redis connection
- ✅ Auto-run migrations (nếu chưa có tables)
- ✅ Start dev server

### Manual Commands

```bash
# Install dependencies
npm install

# Run migrations
npm run migrate:up

# Start dev
npm run dev

# Build
npm run build

# Run production
npm start
```

## Production Deployment

Xem [VPS_DEPLOYMENT.md](../docs/VPS_DEPLOYMENT.md) để triển khai lên VPS.

### Quick Deploy (Summary)

```bash
# On VPS
cd /var/www/polylearn-api

# Pull code (if using Git)
git pull origin main

# Or upload via SCP
scp backend.tar.gz user@vps:/var/www/polylearn-api/

# Install & build
npm install
npm run build

# Run migrations
npm run migrate:up

# Restart PM2
pm2 restart polylearn-api

# Check logs
pm2 logs polylearn-api
```

## Database Scripts

### Create Migration

```bash
npm run migrate:create add_new_table

# Edit file in migrations/
# Then run:
npm run migrate:up
```

### Rollback Migration

```bash
npm run migrate:down
```

### Check Migration Status

```bash
# List migrations
ls -la migrations/

# Check database tables
psql -U polylearn_user -d polylearn -c "\dt"
```

## Testing Scripts

### Health Check

```bash
curl http://localhost:3000/health
# Or production
curl https://api.polylearn.com/health
```

### Test Database Connection

```bash
# PostgreSQL
psql -U polylearn_user -d polylearn -c "SELECT version()"

# Redis
redis-cli ping
```

## Troubleshooting

### Permission Denied (Linux/Mac)

```bash
chmod +x scripts/*.sh
```

### Port 3000 Already in Use

```bash
# Find process
lsof -i :3000
# Or on Windows
netstat -ano | findstr :3000

# Kill process
kill -9 <PID>
# Or on Windows
taskkill /PID <PID> /F
```

### Cannot Connect to Database

```bash
# Check PostgreSQL running
# Linux/Mac
sudo systemctl status postgresql

# Windows - check Services or pgAdmin
```

### TypeScript Compile Errors

```bash
# Clean build
rm -rf dist
npm run build

# Check errors
tsc --noEmit
```

## Helper Scripts (Future)

Các script sẽ được thêm:

- [ ] `backup-db.sh` - Backup database
- [ ] `restore-db.sh` - Restore from backup
- [ ] `deploy.sh` - Auto deploy to VPS
- [ ] `test-api.sh` - Run API tests
- [ ] `seed-data.sh` - Seed sample data

## Notes

- Scripts được test trên Ubuntu 22.04 và Windows 11
- Yêu cầu bash shell cho Linux/Mac
- PowerShell scripts có thể được thêm sau
