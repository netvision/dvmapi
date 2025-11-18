# 📖 Documentation Index

Welcome to the Institute Integrated API documentation. This index helps you quickly find the information you need.

## 🚀 Getting Started

**New to the project?** Start here:

1. **[README.md](./README.md)** - Project overview, features, tech stack
2. **[QUICKSTART.md](./QUICKSTART.md)** - Get up and running in 5 minutes
3. **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Command cheat sheet

## 📚 Main Documentation

### For Developers

| Document | Purpose | When to Use |
|----------|---------|-------------|
| [QUICKSTART.md](./QUICKSTART.md) | Local development setup | Setting up for the first time |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design & architecture | Understanding how everything works |
| [API_TESTS.md](./API_TESTS.md) | API testing with cURL examples | Testing endpoints manually |
| [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) | Quick command reference | Daily development tasks |

### For DevOps/Deployment

| Document | Purpose | When to Use |
|----------|---------|-------------|
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Ubuntu server deployment guide | Deploying to production |
| [Nginx Config](./deployment/nginx.conf) | Nginx reverse proxy setup | Configuring web server |
| [PM2 Config](./ecosystem.config.cjs) | Process manager configuration | Managing Node.js processes |
| [Docker Compose](./docker-compose.yml) | Container orchestration | Docker deployment |

### For Migration

| Document | Purpose | When to Use |
|----------|---------|-------------|
| [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) | Migrate from existing projects | Consolidating dvm-vue, dvm-erp, ai-learning-app |

### Summary Documents

| Document | Purpose | When to Use |
|----------|---------|-------------|
| [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) | Complete project overview | Understanding what's been built |
| [DOCS_INDEX.md](./DOCS_INDEX.md) | This file - navigation guide | Finding the right documentation |

## 🎯 Documentation by Task

### "I want to..."

#### Set up the project locally
1. Read [QUICKSTART.md](./QUICKSTART.md)
2. Run setup commands
3. Test using [API_TESTS.md](./API_TESTS.md)

#### Deploy to production
1. Read [DEPLOYMENT.md](./DEPLOYMENT.md)
2. Follow Ubuntu server setup
3. Configure Nginx using [deployment/nginx.conf](./deployment/nginx.conf)
4. Set up PM2 with [ecosystem.config.cjs](./ecosystem.config.cjs)

#### Understand the architecture
1. Read [ARCHITECTURE.md](./ARCHITECTURE.md)
2. Review [Database Schema](./src/database/schema.sql)
3. Check [Module Structure](#module-structure)

#### Test the API
1. Use [API_TESTS.md](./API_TESTS.md) for examples
2. Visit http://localhost:5000/api-docs for interactive docs
3. Check [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) for quick tests

#### Migrate existing projects
1. Read [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
2. Follow step-by-step migration process
3. Test thoroughly before switching

#### Add a new feature/module
1. Study [Core Module](./src/modules/core/) as reference
2. Read [ARCHITECTURE.md](./ARCHITECTURE.md) for patterns
3. Follow modular structure

#### Troubleshoot issues
1. Check logs in `logs/` directory
2. Review [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) troubleshooting section
3. Verify environment variables in `.env`

## 📂 Code Documentation

### Key Source Files

#### Application Entry
- **[src/index.js](./src/index.js)** - Main Express application

#### Database
- **[src/database/schema.sql](./src/database/schema.sql)** - Complete database schema
- **[src/database/connection.js](./src/database/connection.js)** - PostgreSQL connection pool
- **[src/database/migrate.js](./src/database/migrate.js)** - Migration runner
- **[src/database/seed.js](./src/database/seed.js)** - Database seeding

#### Middleware
- **[src/middleware/auth.js](./src/middleware/auth.js)** - JWT authentication
- **[src/middleware/validator.js](./src/middleware/validator.js)** - Request validation
- **[src/middleware/errorHandler.js](./src/middleware/errorHandler.js)** - Global error handling
- **[src/middleware/logger.js](./src/middleware/logger.js)** - Request logging

#### Modules

##### Core Module (✅ Complete)
- **[src/modules/core/controllers/authController.js](./src/modules/core/controllers/authController.js)** - Authentication logic
- **[src/modules/core/controllers/userController.js](./src/modules/core/controllers/userController.js)** - User management
- **[src/modules/core/routes/index.js](./src/modules/core/routes/index.js)** - Core API routes
- **[src/modules/core/validators/authValidators.js](./src/modules/core/validators/authValidators.js)** - Validation schemas

##### Library Module (📝 Ready to implement)
- **[src/modules/library/routes/index.js](./src/modules/library/routes/index.js)** - Library routes (placeholder)

##### Learning Module (📝 Ready to implement)
- **[src/modules/learning/routes/index.js](./src/modules/learning/routes/index.js)** - Learning routes (placeholder)

##### CMS Module (📝 Ready to implement)
- **[src/modules/cms/routes/index.js](./src/modules/cms/routes/index.js)** - CMS routes (placeholder)

#### Utilities
- **[src/shared/utils/logger.js](./src/shared/utils/logger.js)** - Winston logger configuration

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| [package.json](./package.json) | Dependencies and scripts |
| [.env.example](./.env.example) | Environment variables template |
| [.env](./.env) | Your local environment config |
| [.gitignore](./.gitignore) | Git ignore rules |
| [Dockerfile](./Dockerfile) | Docker image definition |
| [docker-compose.yml](./docker-compose.yml) | Docker services orchestration |
| [ecosystem.config.cjs](./ecosystem.config.cjs) | PM2 process manager config |

## 📊 Database Documentation

### Schema Overview
See [src/database/schema.sql](./src/database/schema.sql) for complete schema.

**Core Tables:**
- `users` - User accounts
- `books` - Library catalog
- `book_circulation` - Checkout/returns
- `subjects` - Courses
- `syllabus` - Course syllabi
- `learning_content` - Educational content
- `chat_history` - AI conversations
- `news` - News articles
- `events` - Events
- `file_uploads` - File metadata

## 🌐 API Documentation

### Interactive Documentation
Once the server is running:
- **Swagger UI**: http://localhost:5000/api-docs
- **Health Check**: http://localhost:5000/health

### Static Documentation
- **[API_TESTS.md](./API_TESTS.md)** - cURL examples for all endpoints

### API Endpoints Summary

**Core Module:**
- `/api/v1/core/auth/*` - Authentication endpoints
- `/api/v1/core/users/*` - User management (admin)

**Library Module:**
- `/api/v1/library/*` - Library features (to be implemented)

**Learning Module:**
- `/api/v1/learning/*` - AI learning features (to be implemented)

**CMS Module:**
- `/api/v1/cms/*` - Content management (to be implemented)

## 📈 Implementation Status

### ✅ Completed (Ready to Use)

- [x] Project structure
- [x] Core authentication (login, register, JWT)
- [x] User management (CRUD with RBAC)
- [x] Database schema (all modules)
- [x] Security middleware
- [x] API documentation (Swagger)
- [x] Deployment configuration
- [x] Complete documentation

### 📝 Ready for Implementation (Structure Ready)

- [ ] Library module controllers
- [ ] AI Learning module with OpenAI
- [ ] CMS module controllers
- [ ] File upload service
- [ ] Email notifications
- [ ] Search functionality
- [ ] Unit tests

## 🎓 Learning Resources

### Understanding the Codebase

**Start with these files in order:**
1. [src/index.js](./src/index.js) - See how the app initializes
2. [src/database/connection.js](./src/database/connection.js) - Database setup
3. [src/middleware/auth.js](./src/middleware/auth.js) - Authentication flow
4. [src/modules/core/routes/index.js](./src/modules/core/routes/index.js) - Route definitions
5. [src/modules/core/controllers/authController.js](./src/modules/core/controllers/authController.js) - Business logic

### Architecture Patterns

- **Modular design** - Each feature is self-contained
- **Middleware chain** - Request → Auth → Validation → Controller
- **Database pooling** - Efficient connection management
- **JWT tokens** - Stateless authentication
- **Role-based access** - Flexible authorization

## 🔍 Quick Search

### Find information about...

| Topic | Document | Section |
|-------|----------|---------|
| Installation | QUICKSTART.md | Quick Start |
| Authentication | ARCHITECTURE.md | Authentication Flow |
| Database | schema.sql | Full schema |
| Deployment | DEPLOYMENT.md | Complete guide |
| Testing | API_TESTS.md | All examples |
| Migration | MIGRATION_GUIDE.md | Step-by-step |
| Commands | QUICK_REFERENCE.md | All commands |
| Roles | ARCHITECTURE.md | User Roles |
| Security | ARCHITECTURE.md | Security Features |
| Modules | ARCHITECTURE.md | Module Breakdown |

## 📞 Support

### Where to look for help:

1. **Documentation** - Check this index for relevant docs
2. **API Docs** - http://localhost:5000/api-docs (interactive)
3. **Logs** - `logs/error.log` and `logs/combined.log`
4. **Health Check** - http://localhost:5000/health
5. **Code Comments** - JSDoc comments in source files

### Troubleshooting Guide

**Quick checks:**
- Server won't start? → Check [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) troubleshooting
- Database errors? → Verify `.env` settings
- Auth failing? → Check JWT_SECRET in `.env`
- API not responding? → Check logs and health endpoint

## 🗺️ Documentation Roadmap

### Current Documentation (Complete)
- ✅ Setup and quickstart
- ✅ Architecture overview
- ✅ API testing guide
- ✅ Deployment guide
- ✅ Migration guide
- ✅ Quick reference

### Future Documentation (When modules are implemented)
- [ ] Library module API documentation
- [ ] AI Learning module guide
- [ ] CMS module documentation
- [ ] File upload guide
- [ ] Email service documentation
- [ ] Testing guide with examples
- [ ] Performance optimization guide
- [ ] Security best practices

---

**📝 Note:** This documentation is maintained as the project evolves. Last updated: November 2025

**🎯 Pro Tip:** Bookmark this page for quick access to all documentation!
