# Institute ERP System 🏫

A comprehensive, production-ready school management ERP system with a modular REST API backend. This unified platform handles everything from student admissions and academic records to staff management, payroll, accounting, and more.

## 🎯 Purpose

This system provides a complete school management solution with:
- **Unified REST API** serving multiple frontend applications
- **Comprehensive ERP modules** for all school operations
- **Single authentication system** with role-based access control
- **Shared PostgreSQL database** with optimized schema
- **Modular architecture** for easy customization and expansion

## ✨ Features

### ✅ Implemented
- 🔐 **Authentication & Authorization**: JWT-based auth with refresh tokens
- 👥 **User Management**: Complete CRUD operations with role-based access
- 🛡️ **Security**: Rate limiting, input validation, password hashing
- 📊 **API Documentation**: Auto-generated Swagger/OpenAPI docs
- 🔧 **Production Ready**: PM2, Docker, Nginx configurations
- 📰 **CMS Module**: News, events, achievers management

### 📝 Planned ERP Modules

**Academic Management:**
- 👨‍🎓 **Student Management**: Admissions, profiles, academic records, grading
- 👨‍🏫 **Staff Management**: Teacher/staff profiles, qualifications, assignments
- 🏫 **Class & Subject Management**: Class structure, sections, subject allocation
- 📚 **Library Management**: Book catalog, circulation, inventory
- 🤖 **AI Learning Platform**: Personalized learning with OpenAI integration
- 📅 **Timetable Management**: Period schedules, teacher assignments
- 📝 **Exam Management**: Exam schedules, marks entry, report cards

**Operations Management:**
- 📅 **Attendance System**: Student and staff attendance tracking
- 🏖️ **Leave Management**: Leave requests, approvals, balance tracking
- 💰 **Payroll System**: Salary processing, payslips, tax calculations
- 💳 **Fee Management**: Fee structure, collection, receipts, dues tracking
- 📊 **Accounting**: Ledger, income/expense, financial reports
- 🚌 **Transport Management**: Vehicle tracking, routes (optional)
- 🏠 **Hostel Management**: Room allocation, mess management (optional)

**Analytics & Reporting:**
- 📈 **Comprehensive Reports**: Academic, financial, operational reports
- 📊 **Analytics Dashboard**: Real-time insights and metrics

## 🚀 Tech Stack

- **Runtime**: Node.js 18+ with ES Modules
- **Framework**: Express.js
- **Database**: PostgreSQL 12+ with connection pooling
- **Authentication**: JWT (access + refresh tokens)
- **Validation**: Joi schemas
- **Logging**: Winston
- **Documentation**: Swagger/OpenAPI 3.0
- **Process Manager**: PM2 (cluster mode)
- **Deployment**: Docker, Nginx, Ubuntu Server

## 🏁 Quick Start

### Prerequisites
- Node.js 18 or later
- PostgreSQL 12 or later

### Local Development

```bash
# 1. Install dependencies
npm install

# 2. Create PostgreSQL database
createdb institute_db
# OR in psql: CREATE DATABASE institute_db;

# 3. Configure environment (already created as .env)
# Edit .env and update DB_PASSWORD if needed

# 4. Run database migrations
npm run migrate

# 5. Seed with demo users (optional but recommended)
npm run seed
# Creates: admin@institute.com/admin123, teacher@institute.com/teacher123

# 6. Start development server
npm run dev
```

**Access Points:**
- API: http://localhost:5000
- Health Check: http://localhost:5000/health
- API Docs: http://localhost:5000/api-docs

### Ubuntu Server Deployment

```bash
# Quick deploy via SSH
scp -r ./institute-api user@server:/var/www/
ssh user@server
cd /var/www/institute-api
npm install --production
npm run migrate
pm2 start ecosystem.config.cjs
```

**See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment guide with Nginx, SSL, and automated backups.**

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [QUICKSTART.md](./QUICKSTART.md) | Complete local development setup |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Ubuntu server deployment guide |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design & architecture |
| [API_TESTS.md](./API_TESTS.md) | cURL examples for testing |
| [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) | Command cheat sheet |
| [Swagger Docs](http://localhost:5000/api-docs) | Interactive API documentation |

## 📡 API Endpoints

### Core Authentication
- `POST /api/v1/core/auth/register` - Register new user
- `POST /api/v1/core/auth/login` - Login (returns JWT)
- `POST /api/v1/core/auth/refresh` - Refresh access token
- `GET /api/v1/core/auth/profile` - Get current user [Auth]
- `PUT /api/v1/core/auth/profile` - Update profile [Auth]
- `POST /api/v1/core/auth/change-password` - Change password [Auth]

### User Management (Admin)
- `GET /api/v1/core/users` - List users with pagination [Auth, Admin]
- `GET /api/v1/core/users/:id` - Get user details [Auth, Admin]
- `PUT /api/v1/core/users/:id` - Update user [Auth, Admin]
- `DELETE /api/v1/core/users/:id` - Delete user [Auth, Admin]

### Other Modules
- `/api/v1/library/*` - Library management (ready to implement)
- `/api/v1/learning/*` - AI learning features (ready to implement)
- `/api/v1/cms/*` - Content management (ready to implement)

**Complete API reference:** http://localhost:5000/api-docs

## 🗂️ Project Structure

```
institute-api/
├── src/
│   ├── modules/              # Feature modules (modular architecture)
│   │   ├── core/            # ✅ Auth, Users, Roles (COMPLETE)
│   │   ├── library/         # 📝 Library management (ready to implement)
│   │   ├── learning/        # 📝 AI Learning features (ready to implement)
│   │   └── cms/             # 📝 Content management (ready to implement)
│   ├── database/            # Database connection, migrations, seeding
│   ├── middleware/          # Auth, validation, error handling
│   ├── shared/              # Shared utilities, logger
│   └── index.js             # Application entry point
├── deployment/              # Nginx config, deploy scripts
├── logs/                    # Application logs (Winston)
├── uploads/                 # File uploads directory
├── .env                     # Environment configuration
├── package.json
├── ecosystem.config.cjs     # PM2 process manager config
├── Dockerfile               # Docker image
└── docker-compose.yml       # Docker orchestration
```

## 🗄️ Database Schema

**Core Tables:**
- `users` - User accounts with role-based access
- `books` - Library catalog with ISBN, metadata
- `book_circulation` - Checkout/return tracking
- `subjects` - Courses/subjects for learning
- `syllabus` - Course syllabi with JSONB content
- `learning_content` - Educational materials
- `chat_history` - AI conversation logs
- `news` - News articles with publishing workflow
- `events` - Event management with capacity tracking
- `file_uploads` - File metadata and references

**All tables include:**
- UUID primary keys
- Timestamps (created_at, updated_at with auto-update triggers)
- Proper indexes for performance
- Foreign key constraints

## 👥 User Roles

- **admin** - Full system access, user management
- **teacher** - Manage courses, content, students
- **student** - Access learning materials, borrow books
- **librarian** - Manage library, book circulation
- **user** - Basic authenticated access

## 🔐 Security Features

- ✅ JWT authentication with access & refresh tokens
- ✅ Bcrypt password hashing (10 rounds)
- ✅ Role-based authorization middleware
- ✅ Request validation (Joi schemas)
- ✅ Rate limiting (100 requests per 15 minutes)
- ✅ Helmet.js security headers
- ✅ CORS configuration
- ✅ SQL injection protection (parameterized queries)
- ✅ Environment-based secrets

## 🧪 Testing

### Quick API Test (PowerShell)

```powershell
# Login and get token
$body = @{
    email = "admin@institute.com"
    password = "admin123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/core/auth/login" `
    -Method Post -ContentType "application/json" -Body $body

$token = $response.data.accessToken

# Get profile
$headers = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/core/auth/profile" -Headers $headers
```

See [API_TESTS.md](./API_TESTS.md) for comprehensive testing examples.

## 📦 NPM Scripts

```bash
npm run dev          # Start development server (nodemon)
npm start            # Start production server
npm run migrate      # Run database migrations
npm run seed         # Seed database with demo users
npm test             # Run tests (when implemented)
```

## 🌐 Integration with Existing Projects

## \ud83c\udfe2 System Architecture

This monorepo contains:

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **`src/`** | Node.js + Express + PostgreSQL | Unified REST API backend serving all applications |
| **`erp/`** | Vue 3 + TypeScript + Pinia + Tailwind | Comprehensive school management dashboard |
| **`website/`** | Vue 3 + TypeScript + UnoCSS | Public-facing institutional website |
| **Future apps** | Any framework | Can consume the unified REST API |

**Benefits:**
- Single authentication across all frontends
- Unified user management
- Shared database with optimized schema
- Consistent API design patterns
- Easier maintenance and scaling

## 🚧 Implementation Roadmap

### ✅ Phase 1: Foundation (COMPLETE)
- [x] Project structure and configuration
- [x] Core authentication module
- [x] Database schema for all modules
- [x] Security middleware
- [x] Deployment configuration
- [x] Comprehensive documentation

### 📝 Phase 2: Module Implementation
- [ ] Library module controllers and services
- [ ] AI Learning module with OpenAI integration
- [ ] CMS module with publishing workflow
- [ ] File upload service
- [ ] Email notification service

### 🧪 Phase 3: Testing & Quality
- [ ] Unit tests (Jest)
- [ ] Integration tests
- [ ] API testing suite
- [ ] Load testing

### 🚀 Phase 4: Production
- [ ] Performance optimization
- [ ] Monitoring & alerting
- [ ] Backup automation
- [ ] Documentation completion

## 🤝 Contributing

When implementing modules:
1. Follow the existing structure in `src/modules/core/`
2. Create controllers, routes, and validators
3. Add Swagger/JSDoc comments for API documentation
4. Use existing middleware for auth and validation
5. Test endpoints thoroughly

## 📄 License

MIT

## 💬 Support

For issues or questions:
1. Check the documentation files
2. Review API docs at `/api-docs`
3. Check application logs in `logs/` directory
4. Verify environment variables in `.env`

---

**Built with ❤️ for scalable institute management**
