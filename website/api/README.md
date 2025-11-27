# DVM School API - Yii2 REST API

A REST API built with Yii2 framework for managing school news, events, and users with an admin panel.

## Prerequisites

Before running this project, ensure you have the following installed:

- **PHP 7.4 or higher**
- **Composer** (PHP dependency manager)
- **MySQL/MariaDB** (or any supported database)
- **Web server** (Apache/Nginx) or use PHP built-in server

## Installation

### 1. Install PHP and Composer

#### Windows:
- Download PHP from [php.net](https://www.php.net/downloads)
- Download Composer from [getcomposer.org](https://getcomposer.org/download/)

#### Via Chocolatey (Windows):
```bash
choco install php composer
```

### 2. Install Yii2 Application

```bash
# Navigate to the project directory
cd d:\dev\dvm-vue\api

# Install Yii2 basic application template
composer create-project --prefer-dist yiisoft/yii2-app-basic .

# Install additional dependencies
composer require --prefer-dist yiisoft/yii2-jui
composer require firebase/php-jwt
composer require yiisoft/yii2-httpclient
```

### 3. Database Configuration

1. Create a MySQL database named `dvm_school_api`
2. Copy `config/db.php.example` to `config/db.php`
3. Update database credentials in `config/db.php`:

```php
return [
    'class' => 'yii\db\Connection',
    'dsn' => 'mysql:host=localhost;dbname=dvm_school_api',
    'username' => 'your_username',
    'password' => 'your_password',
    'charset' => 'utf8',
];
```

### 4. Run Migrations

```bash
# Create database tables
php yii migrate
```

### 5. Start Development Server

```bash
# Start PHP built-in server
php yii serve --port=8080
```

The API will be available at `http://localhost:8080`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/register` - User registration

### News Management
- `GET /api/news` - Get all news
- `GET /api/news/{id}` - Get news by ID
- `POST /api/news` - Create new news (authenticated)
- `PUT /api/news/{id}` - Update news (authenticated)
- `DELETE /api/news/{id}` - Delete news (authenticated)

### Events Management
- `GET /api/events` - Get all events
- `GET /api/events/{id}` - Get event by ID
- `POST /api/events` - Create new event (authenticated)
- `PUT /api/events/{id}` - Update event (authenticated)
- `DELETE /api/events/{id}` - Delete event (authenticated)

### Users Management
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/{id}` - Get user by ID
- `PUT /api/users/{id}` - Update user (authenticated)
- `DELETE /api/users/{id}` - Delete user (admin only)

### Admin Panel
- `/admin` - Admin dashboard
- `/admin/news` - News management
- `/admin/events` - Events management
- `/admin/users` - User management

## Project Structure

```
api/
├── config/          # Configuration files
├── controllers/     # API and web controllers
│   ├── api/        # REST API controllers
│   └── admin/      # Admin panel controllers
├── models/         # ActiveRecord models
├── migrations/     # Database migrations
├── views/          # View templates (admin panel)
├── web/            # Web accessible directory
└── tests/          # Test files
```

## Features

- ✅ REST API with CRUD operations
- ✅ JWT Authentication
- ✅ Admin Panel for content management
- ✅ Database migrations
- ✅ Input validation and error handling
- ✅ CORS configuration for frontend integration
- ✅ Pagination and filtering
- ✅ File upload for news/event images

## Development

### Adding New Models
```bash
# Generate new migration
php yii migrate/create create_table_name

# Generate new ActiveRecord model
php yii gii/model --tableName=table_name
```

### Testing
```bash
# Run tests
vendor/bin/codecept run
```

## Production Deployment

1. Configure web server to point to `web/` directory
2. Set up SSL certificate
3. Configure production database
4. Set `YII_ENV` to `prod` in `web/index.php`
5. Run `composer install --no-dev --optimize-autoloader`

## License

This project is for educational purposes - Dalmia Vidya Mandir School Management System.
