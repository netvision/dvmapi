# API Testing with cURL

## Authentication Endpoints

### Register New User
```bash
curl -X POST http://localhost:5000/api/v1/core/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "first_name": "Test",
    "last_name": "User",
    "role": "student"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/v1/core/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@institute.com",
    "password": "admin123"
  }'
```

**Save the accessToken from response for subsequent requests**

### Get Profile
```bash
curl http://localhost:5000/api/v1/core/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Update Profile
```bash
curl -X PUT http://localhost:5000/api/v1/core/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "first_name": "Updated",
    "last_name": "Name"
  }'
```

### Change Password
```bash
curl -X POST http://localhost:5000/api/v1/core/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "currentPassword": "admin123",
    "newPassword": "newpassword123"
  }'
```

### Refresh Token
```bash
curl -X POST http://localhost:5000/api/v1/core/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

## User Management (Admin Only)

### Get All Users
```bash
curl http://localhost:5000/api/v1/core/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Get All Users with Pagination
```bash
curl "http://localhost:5000/api/v1/core/users?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Get All Users with Search
```bash
curl "http://localhost:5000/api/v1/core/users?search=john" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Get All Users by Role
```bash
curl "http://localhost:5000/api/v1/core/users?role=teacher" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Get User by ID
```bash
curl http://localhost:5000/api/v1/core/users/USER_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Update User
```bash
curl -X PUT http://localhost:5000/api/v1/core/users/USER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "first_name": "Updated",
    "role": "teacher",
    "is_active": true
  }'
```

### Delete User
```bash
curl -X DELETE http://localhost:5000/api/v1/core/users/USER_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Library Module (Placeholder)

### Get All Books
```bash
curl http://localhost:5000/api/v1/library/books \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Add Book
```bash
curl -X POST http://localhost:5000/api/v1/library/books \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "title": "Sample Book",
    "author": "John Doe"
  }'
```

## Learning Module (Placeholder)

### Chat with AI
```bash
curl -X POST http://localhost:5000/api/v1/learning/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "message": "Explain photosynthesis"
  }'
```

### Get Syllabus
```bash
curl http://localhost:5000/api/v1/learning/syllabus \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Learning Content
```bash
curl http://localhost:5000/api/v1/learning/content \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## CMS Module (Placeholder)

### Get All News
```bash
curl http://localhost:5000/api/v1/cms/news
```

### Create News (Admin)
```bash
curl -X POST http://localhost:5000/api/v1/cms/news \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "title": "Sample News",
    "content": "News content here"
  }'
```

### Get All Events
```bash
curl http://localhost:5000/api/v1/cms/events
```

### Create Event (Admin)
```bash
curl -X POST http://localhost:5000/api/v1/cms/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "title": "Sample Event",
    "start_date": "2025-12-01T10:00:00Z",
    "end_date": "2025-12-01T15:00:00Z"
  }'
```

## Health & Documentation

### Health Check
```bash
curl http://localhost:5000/health
```

### API Info
```bash
curl http://localhost:5000/
```

### API Documentation
Open in browser: http://localhost:5000/api-docs

---

## PowerShell Examples

For Windows PowerShell, use `Invoke-RestMethod`:

### Login (PowerShell)
```powershell
$body = @{
    email = "admin@institute.com"
    password = "admin123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/core/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body

$token = $response.data.accessToken
Write-Host "Token: $token"
```

### Get Profile (PowerShell)
```powershell
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/v1/core/auth/profile" `
    -Headers $headers
```
