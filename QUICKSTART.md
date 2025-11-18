# Quick Start Guide

## Local Development Setup

### Prerequisites
- Node.js 18 or later
- PostgreSQL 12 or later
- Git

### 1. Clone and Install

```bash
cd d:\dev\erpapp
npm install
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your settings
# At minimum, update:
# - DB_PASSWORD
# - JWT_SECRET
# - JWT_REFRESH_SECRET
```

### 3. Set Up Database

**Create PostgreSQL database:**
```sql
CREATE DATABASE institute_db;
```

**Run migrations:**
```bash
npm run migrate
```

**Seed with sample data:**
```bash
npm run seed
```

This creates default users:
- `admin@institute.com` / `admin123` (Admin)
- `teacher@institute.com` / `teacher123` (Teacher)
- `student@institute.com` / `student123` (Student)

### 4. Start Development Server

```bash
npm run dev
```

The API will be available at:
- **API**: http://localhost:5000
- **Docs**: http://localhost:5000/api-docs
- **Health**: http://localhost:5000/health

### 5. Test the API

**Login:**
```bash
curl -X POST http://localhost:5000/api/v1/core/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@institute.com\",\"password\":\"admin123\"}"
```

**Get Profile (use token from login):**
```bash
curl http://localhost:5000/api/v1/core/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Project Structure

```
institute-api/
├── src/
│   ├── modules/              # Feature modules
│   │   ├── core/            # Auth, Users, Roles
│   │   ├── library/         # Library management
│   │   ├── learning/        # AI Learning
│   │   └── cms/             # Content management
│   ├── database/            # DB connection & migrations
│   ├── middleware/          # Auth, validation, errors
│   ├── shared/              # Utilities, logger
│   └── index.js             # Entry point
├── deployment/              # Deployment configs
├── logs/                    # Application logs
├── uploads/                 # File uploads
├── .env.example             # Environment template
├── package.json
├── ecosystem.config.cjs     # PM2 config
├── Dockerfile
└── docker-compose.yml
```

## Available Modules

### ✅ Core Module (Implemented)
- User authentication (register, login, refresh token)
- User management (CRUD)
- Role-based access control
- JWT token management

### 📚 Library Module (Placeholder)
- Book management
- Circulation/checkout
- Catalog management

### 🤖 Learning Module (Placeholder)
- AI chat assistant
- Syllabus management
- Learning content

### 📰 CMS Module (Placeholder)
- News management
- Events management
- Content publishing

## Development Commands

```bash
npm run dev          # Start development server with nodemon
npm start            # Start production server
npm run migrate      # Run database migrations
npm run seed         # Seed database with sample data
npm test             # Run tests (when implemented)
```

## API Endpoints

### Authentication
- `POST /api/v1/core/auth/register` - Register new user
- `POST /api/v1/core/auth/login` - Login
- `POST /api/v1/core/auth/refresh` - Refresh access token
- `GET /api/v1/core/auth/profile` - Get current user
- `PUT /api/v1/core/auth/profile` - Update profile
- `POST /api/v1/core/auth/change-password` - Change password

### User Management (Admin only)
- `GET /api/v1/core/users` - List all users
- `GET /api/v1/core/users/:id` - Get user by ID
- `PUT /api/v1/core/users/:id` - Update user
- `DELETE /api/v1/core/users/:id` - Delete user

### Other Modules
See API documentation at `/api-docs` for complete endpoint list.

## Database Schema

Main tables:
- **users** - User accounts and authentication
- **books** - Library book catalog
- **book_circulation** - Book checkouts and returns
- **subjects** - Courses/subjects
- **syllabus** - Course syllabi
- **learning_content** - Educational content
- **chat_history** - AI chat conversations
- **news** - News articles
- **events** - Event management
- **file_uploads** - File storage metadata

## User Roles

- **admin** - Full system access
- **teacher** - Manage courses, content, students
- **student** - Access learning materials, borrow books
- **librarian** - Manage library, book circulation
- **user** - Basic authenticated user

## Next Steps

1. **Implement remaining modules** - Library, Learning, CMS controllers
2. **Add file upload service** - For images, documents
3. **Implement email notifications** - Using nodemailer
4. **Add more validation** - Request validation schemas
5. **Write tests** - Unit and integration tests
6. **Add search functionality** - Full-text search
7. **Implement caching** - Redis for performance

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed Ubuntu server deployment instructions.

Quick deploy with Docker:
```bash
docker-compose up -d
```

## Support & Documentation

- API Docs: http://localhost:5000/api-docs
- Health Check: http://localhost:5000/health
- GitHub: [Your Repository]
