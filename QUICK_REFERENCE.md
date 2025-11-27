# 🚀 Quick Reference Card

## Environment Setup (One-Time)

```powershell
# 1. Install dependencies
npm install

# 2. Create PostgreSQL database
# In psql or pgAdmin: CREATE DATABASE institute_db;

# 3. Configure .env file (already created, just verify settings)
# Update DB_PASSWORD if needed

# 4. Run migrations
npm run migrate

# 5. Seed with demo users
npm run seed
```

## Daily Development

```powershell
# Start dev server (auto-reload)
npm run dev

# Server will run at http://localhost:5000
# API Docs at http://localhost:5000/api-docs
```

## Default Users (after seed)

```
admin@institute.com / admin123    (admin role)
teacher@institute.com / teacher123  (teacher role)
student@institute.com / student123  (student role)
```

## Quick API Test

```powershell
# Login
$body = '{"email":"admin@institute.com","password":"admin123"}' 
$r = Invoke-RestMethod http://localhost:5000/api/v1/core/auth/login -Method Post -ContentType "application/json" -Body $body
$token = $r.data.accessToken

# Get profile
$h = @{Authorization = "Bearer $token"}
Invoke-RestMethod http://localhost:5000/api/v1/core/auth/profile -Headers $h
```

## Project Structure Quick Map

```
src/
├── index.js                    # Main app entry
├── database/
│   ├── connection.js          # DB pool
│   ├── schema.sql             # Full schema
│   ├── migrate.js             # Run migrations
│   └── seed.js                # Seed data
├── middleware/
│   ├── auth.js                # JWT verification
│   ├── validator.js           # Request validation
│   ├── errorHandler.js        # Error handling
│   └── logger.js              # Request logging
├── modules/
│   ├── core/                  # ✅ COMPLETE
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   └── userController.js
│   │   ├── routes/index.js
│   │   └── validators/authValidators.js
│   ├── library/               # 📝 TODO
│   ├── learning/              # 📝 TODO
│   └── cms/                   # 📝 TODO
└── shared/utils/
    └── logger.js              # Winston logger
```

## Key Files

| File | Purpose |
|------|---------|
| `.env` | Environment variables (DB, JWT secrets) |
| `package.json` | Dependencies and scripts |
| `ecosystem.config.cjs` | PM2 production config |
| `docker-compose.yml` | Docker deployment |
| `src/index.js` | Express app initialization |
| `src/database/schema.sql` | Complete DB schema |

## Common Tasks

### Add New User (Code)
```javascript
// In seed.js or via API
const hashedPassword = await bcrypt.hash('password', 10);
await query(
  'INSERT INTO users (email, password, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5)',
  ['user@example.com', hashedPassword, 'John', 'Doe', 'student']
);
```

### Add New Endpoint
```javascript
// In module routes/index.js
router.post('/new-endpoint', 
  authenticate,                    // Require auth
  authorize('admin'),              // Require admin role
  validate(schema),                // Validate input
  controller.newFunction           // Handle request
);
```

### Check Logs
```powershell
Get-Content logs/combined.log -Tail 50
Get-Content logs/error.log -Tail 50
```

## Database Quick Commands

```powershell
# Connect to database (if psql installed)
psql -U postgres -d institute_db

# Common queries
SELECT * FROM users;
SELECT * FROM users WHERE role = 'admin';
SELECT COUNT(*) FROM users;
```

## Deployment Quick Commands

```bash
# On Ubuntu server
cd /var/www/institute-api
git pull
npm install --production
npm run migrate
pm2 reload institute-api
pm2 logs institute-api
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 5000 in use | Change PORT in .env |
| Database connection fails | Check DB_HOST, DB_USER, DB_PASSWORD in .env |
| JWT errors | Ensure JWT_SECRET is set in .env |
| Module not found | Run `npm install` |
| Migration fails | Check PostgreSQL is running |

## API Endpoints Quick List

```
POST   /api/v1/core/auth/register
POST   /api/v1/core/auth/login
POST   /api/v1/core/auth/refresh
GET    /api/v1/core/auth/profile                    [Auth]
PUT    /api/v1/core/auth/profile                    [Auth]
POST   /api/v1/core/auth/change-password            [Auth]
GET    /api/v1/core/users                           [Auth, Admin]
GET    /api/v1/core/users/:id                       [Auth, Admin]
PUT    /api/v1/core/users/:id                       [Auth, Admin]
DELETE /api/v1/core/users/:id                       [Auth, Admin]
POST   /api/v1/core/users/:id/reset-password        [Auth, Admin]
PATCH  /api/v1/core/users/:id/toggle-status         [Auth, Admin]
```

### Admin User Management Features
- **Reset Password**: Admins can reset any user's password without knowing the current password
- **Suspend/Activate**: Toggle user status to suspend or activate accounts
- **Full CRUD**: Create, read, update, and delete users with proper safeguards
- **Self-Protection**: Admins cannot delete themselves or change their own status

## Environment Variables Cheat Sheet

```env
# Development
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_NAME=institute_db
DB_USER=postgres
DB_PASSWORD=your_password

# Security
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Optional
OPENAI_API_KEY=sk-...
CORS_ORIGIN=http://localhost:3000
```

## Next Module Implementation Steps

### 1. Library Module
```
✓ Routes exist (placeholder)
✓ Database tables ready
TODO: 
  - Create controllers/bookController.js
  - Create controllers/circulationController.js
  - Add validation schemas
  - Implement CRUD logic
```

### 2. Learning Module
```
✓ Routes exist (placeholder)
✓ Database tables ready
TODO:
  - Create services/openaiService.js
  - Create controllers/chatController.js
  - Create controllers/syllabusController.js
  - Implement AI chat logic
```

### 3. CMS Module
```
✓ Routes exist (placeholder)
✓ Database tables ready
TODO:
  - Create controllers/newsController.js
  - Create controllers/eventsController.js
  - Add slug generation utility
  - Implement CRUD + publishing workflow
```

## Useful Commands Reference

```powershell
# Development
npm run dev              # Start with auto-reload
npm start                # Start production mode
npm run migrate          # Run database migrations
npm run seed             # Seed database

# Database
npm run migrate          # Create all tables
psql -U postgres -d institute_db  # Connect to DB

# Production (Ubuntu)
pm2 start ecosystem.config.cjs
pm2 status
pm2 logs institute-api
pm2 restart institute-api
pm2 reload institute-api  # Zero-downtime
pm2 stop institute-api

# Docker
docker-compose up -d
docker-compose down
docker-compose logs -f
```

## Documentation Files

| File | What's Inside |
|------|---------------|
| `README.md` | Project overview |
| `QUICKSTART.md` | Local development guide |
| `DEPLOYMENT.md` | Ubuntu server deployment (detailed) |
| `ARCHITECTURE.md` | System architecture & design |
| `API_TESTS.md` | cURL examples for all endpoints |
| `PROJECT_SUMMARY.md` | Complete setup summary |
| `QUICK_REFERENCE.md` | This file! |

---

**💡 Pro Tip:** Keep this file open while developing for quick reference to common tasks and commands!
