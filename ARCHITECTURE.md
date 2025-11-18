# Institute Integrated API - Architecture

## System Overview

This is a modular, scalable REST API designed to serve multiple institute management needs with a unified authentication and data layer.

## Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL 12+
- **Authentication**: JWT (JSON Web Tokens)
- **Documentation**: Swagger/OpenAPI
- **Process Manager**: PM2
- **Reverse Proxy**: Nginx
- **AI Integration**: OpenAI API

## Architecture Principles

### 1. Modular Design
Each feature area is organized as a self-contained module with its own:
- Controllers (business logic)
- Routes (API endpoints)
- Validators (input validation)
- Services (optional, for complex operations)

### 2. Shared Infrastructure
Common functionality is centralized:
- Database connection pooling
- JWT authentication middleware
- Request validation
- Error handling
- Logging
- File uploads

### 3. Database Schema Separation
All modules share a single PostgreSQL database but use:
- Clear table naming conventions
- Foreign key relationships where appropriate
- Separate migration files for each module (future enhancement)

### 4. Security First
- JWT-based authentication
- Role-based access control (RBAC)
- Request rate limiting
- Input validation with Joi
- Helmet.js for HTTP security headers
- Password hashing with bcrypt

## Module Breakdown

### Core Module
**Purpose**: Foundation for all other modules
**Features**:
- User registration and authentication
- JWT token management (access & refresh tokens)
- User profile management
- User CRUD operations (admin)
- Role-based authorization

**Roles**:
- `admin` - Full system access
- `teacher` - Educational content management
- `student` - Learning and library access
- `librarian` - Library management
- `user` - Basic authenticated access

### Library Module
**Purpose**: School library management system
**Features** (to be implemented):
- Book catalog management
- ISBN lookup and metadata
- Book checkout/return (circulation)
- Overdue tracking
- Inventory management
- Library reports

**Tables**:
- `books` - Book catalog
- `book_circulation` - Checkout/return records

### Learning Module
**Purpose**: AI-powered educational platform
**Features** (to be implemented):
- AI chat assistant (OpenAI integration)
- Syllabus management
- Learning content delivery
- Bloom's Taxonomy integration
- Subject/course management
- Chat history tracking

**Tables**:
- `subjects` - Courses/subjects
- `syllabus` - Course syllabi
- `learning_content` - Educational materials
- `chat_history` - AI conversation logs

### CMS Module
**Purpose**: Content management for public-facing content
**Features** (to be implemented):
- News article management
- Event management
- Content publishing workflow
- SEO-friendly URLs (slugs)
- View tracking
- Public/authenticated content

**Tables**:
- `news` - News articles
- `events` - Event listings

## API Structure

```
/api/v1
├── /core
│   ├── /auth
│   │   ├── POST   /register
│   │   ├── POST   /login
│   │   ├── POST   /refresh
│   │   ├── GET    /profile
│   │   ├── PUT    /profile
│   │   └── POST   /change-password
│   └── /users
│       ├── GET    /
│       ├── GET    /:id
│       ├── PUT    /:id
│       └── DELETE /:id
│
├── /library
│   ├── /books
│   ├── /circulation
│   └── /catalog
│
├── /learning
│   ├── /chat
│   ├── /syllabus
│   ├── /content
│   └── /subjects
│
└── /cms
    ├── /news
    └── /events
```

## Request/Response Flow

```
1. Client Request
   ↓
2. Nginx (Reverse Proxy) [Production]
   ↓
3. Express Middleware Chain
   - Helmet (security headers)
   - CORS
   - Rate limiting
   - Body parsing
   - Request logging
   ↓
4. Route Handler
   - Authentication middleware (if required)
   - Authorization middleware (role check)
   - Validation middleware (request validation)
   ↓
5. Controller
   - Business logic
   - Database operations
   - Response formatting
   ↓
6. Error Handler (if error occurs)
   ↓
7. JSON Response to Client
```

## Authentication Flow

```
Registration/Login
    ↓
Generate JWT Tokens
    - Access Token (short-lived, 7 days)
    - Refresh Token (long-lived, 30 days)
    ↓
Client stores tokens
    ↓
Authenticated Requests
    - Send: Authorization: Bearer {access_token}
    ↓
Server validates token
    - Verify signature
    - Check expiration
    - Extract user info
    ↓
If expired: Use refresh token to get new access token
```

## Database Design

### Key Relationships

```
users (1) ----< (M) books (created_by)
users (1) ----< (M) book_circulation
books (1) ----< (M) book_circulation

users (1) ----< (M) subjects (created_by)
subjects (1) ----< (M) syllabus
subjects (1) ----< (M) learning_content

users (1) ----< (M) chat_history
subjects (1) ----< (M) chat_history

users (1) ----< (M) news (author_id)
users (1) ----< (M) events (organizer_id)
```

### Indexes
Strategic indexes on:
- Email (users)
- ISBN (books)
- Status fields (circulation, events, news)
- Foreign keys
- Timestamp fields (for date-based queries)

## Deployment Architecture

### Development
```
Developer Machine
    ↓
Node.js (npm run dev)
    ↓
PostgreSQL (localhost)
```

### Production (Ubuntu Server)
```
Internet
    ↓
Domain (yourdomain.com)
    ↓
SSL/TLS (Let's Encrypt)
    ↓
Nginx (Reverse Proxy)
    ↓
PM2 (Process Manager)
    - Multiple Node.js instances (cluster mode)
    ↓
PostgreSQL Database
    - Regular backups
    - Connection pooling
```

### Alternative: Docker Deployment
```
docker-compose up
    ↓
- PostgreSQL Container
- API Container (Node.js)
    ↓
Nginx (host or container)
```

## Scalability Considerations

### Current Setup
- Single server deployment
- PM2 cluster mode (multi-process)
- PostgreSQL connection pooling
- Stateless API (JWT tokens)

### Future Enhancements
1. **Horizontal Scaling**
   - Load balancer (Nginx/HAProxy)
   - Multiple API servers
   - Shared PostgreSQL instance

2. **Caching Layer**
   - Redis for session storage
   - Cache frequently accessed data
   - Rate limiting with Redis

3. **Database Optimization**
   - Read replicas for scaling reads
   - Database indexing optimization
   - Query optimization

4. **Microservices** (if needed)
   - Separate services for heavy modules
   - Message queue (RabbitMQ/Redis)
   - Service mesh

## Monitoring & Logging

### Application Logs
- **Winston** logger with levels:
  - error: Error events
  - warn: Warning events
  - info: General information
  - debug: Detailed debugging

- **Log Files**:
  - `logs/combined.log` - All logs
  - `logs/error.log` - Error logs only
  - `logs/pm2-*.log` - PM2 process logs

### Monitoring
- PM2 built-in monitoring
- Database query performance logging
- Request/response logging
- Health check endpoint

## Security Measures

1. **Authentication & Authorization**
   - JWT with expiration
   - Refresh token rotation
   - Role-based access control

2. **Input Validation**
   - Joi schema validation
   - SQL injection prevention (parameterized queries)
   - XSS prevention (input sanitization)

3. **HTTP Security**
   - Helmet.js security headers
   - CORS configuration
   - Rate limiting

4. **Data Protection**
   - Password hashing (bcrypt)
   - Environment variable secrets
   - HTTPS in production

5. **Database Security**
   - Least privilege user access
   - Connection pooling limits
   - Regular backups

## Future Module Ideas

Based on the existing projects, potential future modules:

1. **Finance Module** (from dvm-erp)
   - Fee management
   - Expense tracking
   - Financial reports

2. **Attendance Module**
   - Student attendance
   - Teacher attendance
   - Reports and analytics

3. **Examination Module**
   - Exam scheduling
   - Grade management
   - Result publishing

4. **Communication Module**
   - Announcements
   - Notifications
   - Email/SMS integration

5. **Admission Module**
   - Application management
   - Document verification
   - Enrollment workflow

## Development Roadmap

### Phase 1: Foundation ✅
- [x] Project structure
- [x] Core authentication
- [x] Database schema
- [x] Deployment configuration

### Phase 2: Core Implementation
- [ ] Complete library module
- [ ] Complete learning module with OpenAI
- [ ] Complete CMS module
- [ ] File upload service

### Phase 3: Enhancement
- [ ] Email notifications
- [ ] Search functionality
- [ ] Advanced filtering
- [ ] Audit logging

### Phase 4: Testing & Quality
- [ ] Unit tests
- [ ] Integration tests
- [ ] Load testing
- [ ] Security audit

### Phase 5: Production
- [ ] Production deployment
- [ ] Monitoring setup
- [ ] Backup automation
- [ ] Documentation finalization
