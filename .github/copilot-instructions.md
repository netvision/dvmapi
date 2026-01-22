# Institute ERP System - AI Agent Instructions

## System Architecture

This is a **monorepo** with a unified REST API serving multiple applications:

- **`src/`** - Node.js/Express REST API backend (PostgreSQL) - Serves all projects
- **`erp/`** - Vue 3 + TypeScript comprehensive school ERP dashboard (Pinia, Tailwind CSS)
- **`website/`** - Public-facing Vue 3 website (UnoCSS)
- **Future projects** - Any frontend can consume this API

### ERP Dashboard Scope

The ERP dashboard is a **full-fledged school management system** including:
- 📚 **Library Management** - Book catalog, circulation, inventory
- 🤖 **AI Learning Platform** - Personalized learning with OpenAI integration
- 📰 **Content Management** - News, events, announcements, achievers
- 👨‍🎓 **Student Management** - Admissions, profiles, academic records, grades
- 👨‍🏫 **Staff Management** - Teacher/staff profiles, qualifications, assignments
- 📅 **Attendance System** - Student and staff attendance tracking
- 🏖️ **Leave Management** - Leave requests, approvals, balance tracking
- 💰 **Payroll System** - Salary processing, payslips, tax calculations
- 💳 **Fee Management** - Fee structure, collection, receipts, dues
- 📊 **Accounting** - Ledger, income/expense, financial reports
- 🏫 **Academic Management** - Classes, subjects, timetables, exam schedules
- 📈 **Reports & Analytics** - Comprehensive reports for all modules

All applications authenticate against the **Node.js backend** using JWT tokens with access/refresh token flow.

## Critical Workflows

### Development Startup (Backend)
```bash
# From root directory
npm run migrate    # Run PostgreSQL migrations (required first time)
npm run seed       # Create demo users: admin@institute.com/admin123
npm run dev        # Start API on port 5000
```

### Development Startup (Frontends)
```bash
# ERP Dashboard
cd erp && npm run dev

# Public Website  
cd website && npm run dev
```

### Production Deployment
- Backend: PM2 cluster mode via `ecosystem.config.cjs` (max instances, 1GB memory limit)
- Frontend: Build with `npm run build`, serve static files via Nginx
- Docker: Use `docker-compose.yml` for full stack deployment

## Module System (Backend API)

The backend follows a **modular monolith** pattern. Each module lives in `src/modules/{module-name}/`:
- `controllers/` - Business logic (export object with methods, e.g., `authController.login`)
- `routes/` - Express routers with Swagger JSDoc annotations
- `validators/` - Joi validation schemas

**Current modules:**
- `core/` - ✅ **Complete** - Auth (JWT), user management, RBAC
- `cms/` - 📝 **In Progress** - News, events, achievers management
- `library/` - 📝 **Planned** - Book management, circulation
- `learning/` - 📝 **Planned** - AI learning platform, syllabus

**Planned ERP modules:**
- `students/` - Student admissions, profiles, academic records, grades
- `staff/` - Staff management, qualifications, assignments
- `attendance/` - Student and staff attendance tracking
- `leave/` - Leave management system
- `payroll/` - Salary processing, payslips
- `fees/` - Fee structure, collection, receipts
- `accounting/` - Financial management, ledger, reports
- `academics/` - Classes, subjects, timetables, exams
- `transport/` - Vehicle management, routes, tracking (optional)
- `hostel/` - Hostel management, room allocation (optional)

### Adding a New Module Endpoint
1. Create controller method in `modules/{module}/controllers/{name}Controller.js`
2. Add Joi validation schema in `validators/`
3. Register route in `routes/index.js` with middleware: `authenticate`, `authorize('admin')`
4. Update Swagger docs with `@swagger` JSDoc comments

## Authentication Patterns

### Backend (Express Middleware)
```javascript
import { authenticate, authorize } from './middleware/auth.js';

// Protected route, any authenticated user
router.get('/resource', authenticate, controller.get);

// Admin-only route
router.post('/admin', authenticate, authorize('admin'), controller.create);

// Optional auth (user object added if token present)
router.get('/public', optionalAuth, controller.get);
```

### ERP Frontend (Pinia Store)
```typescript
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
await auth.login({ email, password }) // Stores accessToken + refreshToken
auth.logout() // Clears localStorage
```

Tokens stored in `localStorage`: `accessToken`, `refreshToken`, `user` (JSON)

### Website Frontend (Reactive Store Pattern)
```typescript
import { authStore } from '@/stores/auth'

await authStore.login(email, password) // Stores websiteAccessToken
authStore.initializeFromStorage() // Call on app mount
```

Tokens stored in `localStorage`: `websiteAccessToken`, `websiteUser`

## Database

**PostgreSQL schema:** See `src/database/schema.sql` for complete structure

**Existing tables:**
- `users` - Roles: admin, teacher, student, librarian, user
- `books`, `book_circulation` - Library module (schema ready)
- `subjects`, `syllabus`, `learning_content` - AI learning module (schema ready)
- `news`, `events`, `achievers` - CMS module (schema ready)

**Planned ERP tables:**
- `students` - Student profiles, admission details, parent info
- `academic_records` - Grades, marks, report cards
- `staff` - Staff profiles, qualifications, employment details
- `attendance` - Daily attendance records (students & staff)
- `leave_requests` - Leave applications and approvals
- `payroll` - Salary records, payslips, deductions
- `fee_structure` - Fee categories, amounts by class
- `fee_transactions` - Fee payments, receipts
- `ledger` - Financial transactions, accounts
- `classes` - Class structure, sections
- `timetables` - Period schedules, teacher assignments
- `exams` - Exam schedules, marks entry

**Migrations:** Add SQL to `src/database/migrations/{timestamp}-description.sql`, run `npm run migrate`

## Styling Conventions

### ERP (`erp/`)
- **Tailwind CSS** with custom primary color palette (blue shades)
- Component pattern: `<script setup>` + utility classes
- Layout: `DashboardLayout.vue` wraps authenticated routes

### Website (`website/`)
- **UnoCSS** (Tailwind-compatible preset via `presetWind()`)
- Icons: `lucide-vue-next`
- Carousel: Swiper.js

Both use Vue 3 Composition API with TypeScript.

## Project-Specific Quirks

1. **Token Storage Naming:** Different apps use different localStorage keys to avoid conflicts:
   - ERP: `accessToken`, `refreshToken`, `user`
   - Website: `websiteAccessToken`, `websiteUser`

2. **ES Modules:** Backend uses `"type": "module"` in package.json. All imports need `.js` extensions.

3. **File Uploads:** Handled by `multer` middleware, stored in `uploads/{module}/` directories

4. **Logging:** Use `logger.info()`, `logger.error()` from `src/shared/utils/logger.js` (Winston), not `console.log`

5. **Error Handling:** Throw `AppError(message, statusCode)` in controllers, caught by `errorHandler` middleware

## Key Files for Reference

- [ARCHITECTURE.md](ARCHITECTURE.md) - Detailed system design, security patterns
- [src/index.js](src/index.js) - Express app setup, module registration
- [src/modules/core/routes/index.js](src/modules/core/routes/index.js) - Example of complete route implementation
- [src/middleware/auth.js](src/middleware/auth.js) - JWT authentication logic
- [erp/src/router/index.ts](erp/src/router/index.ts) - Route guards (`requiresAuth`, `requiresAdmin`)
- [ecosystem.config.cjs](ecosystem.config.cjs) - PM2 production config

## Common Tasks

**Add a protected API endpoint:**
```javascript
// In module's routes/index.js
router.post('/resource', 
  authenticate, 
  authorize('admin', 'teacher'),
  validate(schemas.create),
  controller.create
);
```

**Add ERP dashboard route:**
```typescript
// In erp/src/router/index.ts
{
  path: 'feature',
  name: 'Feature',
  component: () => import('../views/Feature.vue'),
  meta: { requiresAuth: true, requiresAdmin: true }
}
```

**Database query pattern:**
```javascript
import { pool } from '../../../database/connection.js';

const result = await pool.query(
  'SELECT * FROM table WHERE id = $1',
  [id]
);
```
