# Migration Guide - Existing Projects to Unified API

This guide helps migrate your existing projects (`dvm-vue`, `dvm-erp`, `ai-learning-app`) to use this unified Institute API.

## Overview

### Current State
- **dvm-vue**: Vue 3 frontend + Yii2 PHP API (Events, News, User)
- **dvm-erp**: Node.js/Express backend + Frontend (Library management)
- **ai-learning-app**: Node.js/Express backend + Frontend (AI learning)

### Target State
- **One unified API** (this project) serving all features
- **Three separate frontends** (or one unified frontend) consuming the API
- **Single database** with all data
- **Shared authentication** across all systems

## Migration Strategy

### Phase 1: Parallel Operation (Recommended)
Run the new API alongside existing systems, migrating features incrementally.

### Phase 2: Complete Migration
Switch all frontends to use the new API exclusively.

## Step-by-Step Migration

### 1. Data Migration

#### From dvm-vue (Yii2 PHP)

**Export existing data:**
```sql
-- Connect to dvm-vue database
-- Export users
SELECT * FROM user;

-- Export news
SELECT * FROM news;

-- Export events
SELECT * FROM events;
```

**Import to new database:**
```sql
-- Users (map to new schema)
INSERT INTO users (email, password, first_name, last_name, role, created_at)
SELECT 
    email,
    password, -- Yii2 uses different hashing, may need to reset passwords
    first_name,
    last_name,
    CASE 
        WHEN role = 10 THEN 'admin'
        ELSE 'user'
    END,
    created_at
FROM old_users;

-- News
INSERT INTO news (title, slug, content, author_id, status, published_at, created_at)
SELECT 
    title,
    slug,
    content,
    (SELECT id FROM users WHERE email = old_news.author_email),
    CASE 
        WHEN status = 1 THEN 'published'
        ELSE 'draft'
    END,
    published_at,
    created_at
FROM old_news;

-- Events
INSERT INTO events (title, slug, description, location, start_date, end_date, organizer_id, created_at)
SELECT 
    title,
    slug,
    description,
    location,
    start_date,
    end_date,
    (SELECT id FROM users WHERE email = old_events.organizer_email),
    created_at
FROM old_events;
```

#### From dvm-erp (Library)

**Export library data:**
```sql
-- Connect to dvm-erp database
-- Export books
SELECT * FROM books;

-- Export circulation
SELECT * FROM circulation;
```

**Import to new database:**
```sql
-- Books
INSERT INTO books (id, isbn, title, author, publisher, publication_year, total_copies, available_copies, category, created_at)
SELECT 
    id,
    isbn,
    title,
    author,
    publisher,
    publication_year,
    total_copies,
    available_copies,
    category,
    created_at
FROM old_books;

-- Circulation
INSERT INTO book_circulation (book_id, user_id, checkout_date, due_date, return_date, status, created_at)
SELECT 
    book_id,
    user_id,
    checkout_date,
    due_date,
    return_date,
    CASE 
        WHEN returned = true THEN 'returned'
        WHEN due_date < NOW() AND returned = false THEN 'overdue'
        ELSE 'checked_out'
    END,
    created_at
FROM old_circulation;
```

#### From ai-learning-app

**Export learning data:**
```sql
-- Connect to ai-learning-app database
-- Export subjects
SELECT * FROM subjects;

-- Export chat history
SELECT * FROM conversations;
```

**Import to new database:**
```sql
-- Subjects
INSERT INTO subjects (name, code, description, grade_level, created_at)
SELECT 
    name,
    code,
    description,
    grade_level,
    created_at
FROM old_subjects;

-- Chat History
INSERT INTO chat_history (user_id, subject_id, message, response, metadata, created_at)
SELECT 
    user_id,
    subject_id,
    user_message,
    ai_response,
    jsonb_build_object('model', model, 'tokens', tokens),
    created_at
FROM old_conversations;
```

### 2. Frontend Migration

#### dvm-vue (Vue 3)

**Update API base URL:**
```javascript
// src/config/api.js
const API_BASE_URL = process.env.VUE_APP_API_URL || 'http://localhost:5000/api/v1';

export default {
  baseURL: API_BASE_URL,
  timeout: 10000,
};
```

**Update authentication:**
```javascript
// src/services/auth.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1/core/auth';

export const authService = {
  async login(email, password) {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    const { accessToken, refreshToken, user } = response.data.data;
    
    // Store tokens
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    
    return user;
  },

  async register(userData) {
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data;
  },

  async logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  getToken() {
    return localStorage.getItem('accessToken');
  },

  isAuthenticated() {
    return !!this.getToken();
  }
};
```

**Add axios interceptor:**
```javascript
// src/plugins/axios.js
import axios from 'axios';
import { authService } from '@/services/auth';

axios.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, try refresh or redirect to login
      authService.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

**Update News API calls:**
```javascript
// src/services/news.js (OLD - Yii2 API)
// const response = await axios.get('/news');

// NEW - Unified API
const response = await axios.get('http://localhost:5000/api/v1/cms/news');
```

**Update Events API calls:**
```javascript
// src/services/events.js (OLD)
// const response = await axios.get('/events');

// NEW
const response = await axios.get('http://localhost:5000/api/v1/cms/events');
```

#### dvm-erp (Library Frontend)

**Update library API calls:**
```javascript
// src/services/library.js (OLD)
// const response = await fetch('/api/books');

// NEW
const token = localStorage.getItem('accessToken');
const response = await fetch('http://localhost:5000/api/v1/library/books', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

**Update circulation API:**
```javascript
// Checkout book
async checkoutBook(bookId, userId) {
  const token = localStorage.getItem('accessToken');
  const response = await fetch('http://localhost:5000/api/v1/library/circulation/checkout', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ bookId, userId })
  });
  return response.json();
}
```

#### ai-learning-app (React Frontend)

**Update chat API:**
```javascript
// src/services/chat.js (OLD)
// const response = await axios.post('/api/chat', { message });

// NEW
const response = await axios.post('http://localhost:5000/api/v1/learning/chat', 
  { message },
  {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  }
);
```

**Update syllabus API:**
```javascript
// src/services/syllabus.js
const API_URL = 'http://localhost:5000/api/v1/learning';

export const syllabusService = {
  async getSyllabus(subjectId) {
    const response = await axios.get(`${API_URL}/syllabus`, {
      params: { subjectId },
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });
    return response.data;
  }
};
```

### 3. Password Migration

Since the new API uses bcrypt and old systems might use different hashing:

**Option 1: Force password reset**
```javascript
// Send password reset emails to all users
// Users must create new passwords on first login
```

**Option 2: Dual verification (transition period)**
```javascript
// In authController.js login method
// Try new hash first, if fails, try old hash and rehash
const isValidNew = await bcrypt.compare(password, user.password);

if (!isValidNew && user.legacy_password) {
  // Try old Yii2 verification
  const isValidOld = verifyYii2Password(password, user.legacy_password);
  if (isValidOld) {
    // Rehash with bcrypt
    const newHash = await bcrypt.hash(password, 10);
    await query('UPDATE users SET password = $1, legacy_password = NULL WHERE id = $2', 
      [newHash, user.id]);
  }
}
```

### 4. Environment Configuration

**Update .env files in each frontend:**

```env
# dvm-vue/.env
VUE_APP_API_URL=http://localhost:5000/api/v1

# dvm-erp/frontend/.env
REACT_APP_API_URL=http://localhost:5000/api/v1

# ai-learning-app/frontend/.env
VITE_API_URL=http://localhost:5000/api/v1
```

### 5. Testing Migration

**Create a migration testing checklist:**

```markdown
## Migration Test Checklist

### Authentication
- [ ] Users can login with existing credentials
- [ ] New user registration works
- [ ] Token refresh works
- [ ] Logout clears tokens

### dvm-vue Features
- [ ] News list displays correctly
- [ ] News detail page works
- [ ] Events list displays
- [ ] Events detail page works
- [ ] User profile loads

### dvm-erp Features
- [ ] Book catalog displays
- [ ] Book search works
- [ ] Book checkout works
- [ ] Circulation history shows
- [ ] Return book works

### ai-learning-app Features
- [ ] AI chat responds
- [ ] Chat history persists
- [ ] Syllabus loads
- [ ] Content displays
- [ ] Subject selection works

### Cross-cutting
- [ ] All authenticated endpoints require token
- [ ] Admin-only endpoints reject non-admin users
- [ ] CORS allows frontend origins
- [ ] Rate limiting works
```

### 6. Deployment Migration

**Old setup (3 separate servers):**
```
server1: dvm-vue (Yii2 API + Vue frontend)
server2: dvm-erp (Node.js API + frontend)
server3: ai-learning-app (Node.js API + frontend)
```

**New setup (unified):**
```
server: Institute API (single Node.js backend)
cdn/hosting: Static frontends (Netlify, Vercel, etc.)
```

**Deployment steps:**
1. Deploy unified API to server (see DEPLOYMENT.md)
2. Update frontend environment variables to point to new API
3. Deploy frontends
4. Test thoroughly
5. Update DNS/routing if needed
6. Decommission old APIs

### 7. Rollback Plan

**In case of issues:**

1. **Keep old systems running** during migration
2. **Use feature flags** to toggle between old/new API
3. **Monitor errors** closely after migration
4. **Have database backups** before migration

```javascript
// Feature flag example
const USE_NEW_API = process.env.VUE_APP_USE_NEW_API === 'true';

const apiUrl = USE_NEW_API 
  ? 'http://localhost:5000/api/v1'
  : 'http://old-api.example.com/api';
```

## Migration Timeline Suggestion

### Week 1: Preparation
- Set up new API server
- Run migrations
- Import test data
- Configure environments

### Week 2: Parallel Operation
- Point dev/staging frontends to new API
- Test all features
- Fix issues
- Monitor performance

### Week 3: Gradual Production Migration
- Migrate 10% of users to new API
- Monitor for issues
- Gradually increase to 100%

### Week 4: Cleanup
- Decommission old APIs
- Remove feature flags
- Update documentation
- Celebrate! 🎉

## Common Issues & Solutions

### Issue: Different user IDs between systems
**Solution:** Create ID mapping table during migration

### Issue: Different date formats
**Solution:** Normalize to ISO 8601 in migration scripts

### Issue: Missing fields in old data
**Solution:** Use default values or NULL where appropriate

### Issue: Authentication conflicts
**Solution:** Clear all tokens during migration, force re-login

### Issue: File paths changed
**Solution:** Update file_uploads table with new paths, migrate files to new upload directory

## Post-Migration Optimization

1. **Database indexing:** Analyze query patterns and add indexes
2. **Caching:** Add Redis for frequently accessed data
3. **CDN:** Serve static assets via CDN
4. **Monitoring:** Set up error tracking (Sentry, etc.)
5. **Performance:** Load test and optimize bottlenecks

## Support During Migration

- Review logs: `logs/error.log` and `logs/combined.log`
- Check API health: `http://localhost:5000/health`
- Test endpoints: Use API_TESTS.md examples
- Database queries: Check `src/database/connection.js` for query logging

---

**Remember:** Migrate incrementally, test thoroughly, and always have a rollback plan!
