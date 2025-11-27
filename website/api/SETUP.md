# DVM School API - Setup Instructions

## Ubuntu Linode Server Setup Guide

This Yii2 REST API project is designed for deployment on Ubuntu server with PHP, MySQL, and phpMyAdmin already installed.

### 1. Install Composer (if not already installed)

```bash
# Download and install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
sudo chmod +x /usr/local/bin/composer

# Verify installation
composer --version
```

### 2. Upload Project Files

```bash
# Upload your project files to the server (via SCP, SFTP, or Git)
# For example, using Git:
cd /var/www/html
sudo git clone <your-repo-url> dvm-api
cd dvm-api

# Set proper permissions
sudo chown -R www-data:www-data /var/www/html/dvm-api
sudo chmod -R 755 /var/www/html/dvm-api
sudo chmod -R 777 /var/www/html/dvm-api/web/assets
sudo chmod -R 777 /var/www/html/dvm-api/runtime
```

### 3. Install Dependencies
```bash
composer install --no-dev --optimize-autoloader
```

### 4. Database Setup

#### Option A: Using phpMyAdmin (Web Interface)
1. Access phpMyAdmin at `http://your-server-ip/phpmyadmin`
2. Login with your MySQL credentials
3. Create a new database named `dvm_school_api`
4. Set collation to `utf8_general_ci`

#### Option B: Using MySQL Command Line
```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE dvm_school_api CHARACTER SET utf8 COLLATE utf8_general_ci;

# Create a dedicated user (optional but recommended)
CREATE USER 'dvm_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON dvm_school_api.* TO 'dvm_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 5. Configure Database Connection

Update `config/db.php` with your database credentials:
```bash
nano config/db.php
```

```php
<?php
return [
    'class' => 'yii\db\Connection',
    'dsn' => 'mysql:host=localhost;dbname=dvm_school_api',
    'username' => 'dvm_user', // or 'root'
    'password' => 'your_secure_password',
    'charset' => 'utf8',
    'enableSchemaCache' => true,
    'schemaCacheDuration' => 60,
    'schemaCache' => 'cache',
];
```

### 6. Run Database Migrations
```bash
php yii migrate
```

### 7. Configure Apache/Nginx

#### For Apache (if using Apache)
Create virtual host configuration:
```bash
sudo nano /etc/apache2/sites-available/dvm-api.conf
```

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /var/www/html/dvm-api/web
    
    <Directory /var/www/html/dvm-api/web>
        AllowOverride All
        Require all granted
        DirectoryIndex index.php
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/dvm-api_error.log
    CustomLog ${APACHE_LOG_DIR}/dvm-api_access.log combined
</VirtualHost>
```

Enable the site:
```bash
sudo a2ensite dvm-api.conf
sudo a2enmod rewrite
sudo systemctl reload apache2
```

#### For Nginx (if using Nginx)
```bash
sudo nano /etc/nginx/sites-available/dvm-api
```

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/html/dvm-api/web;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/dvm-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 8. Set Production Environment

Update `web/index.php` for production:
```bash
nano web/index.php
```

```php
<?php
// Comment out these lines for production
// defined('YII_DEBUG') or define('YII_DEBUG', true);
// defined('YII_ENV') or define('YII_ENV', 'dev');

defined('YII_DEBUG') or define('YII_DEBUG', false);
defined('YII_ENV') or define('YII_ENV', 'prod');
```

### 9. Test Installation
Visit your API in browser:
- API Base URL: `http://your-domain.com/api/`
- Admin Panel: `http://your-domain.com/admin/`
- Default Admin Login: admin / admin123

### 10. Security Hardening (Recommended)

```bash
# Update JWT secret in config/params.php
nano config/params.php

# Generate a secure random key
openssl rand -base64 32

# Update the jwtSecret parameter with the generated key
```

```bash
# Set up SSL certificate (recommended for production)
sudo apt install certbot python3-certbot-apache
sudo certbot --apache -d your-domain.com

# Or for Nginx:
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Troubleshooting

### Common Issues

1. **Permission Issues:**
```bash
sudo chown -R www-data:www-data /var/www/html/dvm-api
sudo chmod -R 755 /var/www/html/dvm-api
sudo chmod -R 777 /var/www/html/dvm-api/web/assets
sudo chmod -R 777 /var/www/html/dvm-api/runtime
```

2. **PHP Extensions Check:**
```bash
php -m | grep -E "(mbstring|openssl|pdo_mysql|json|curl)"
```

3. **Log Files:**
```bash
# Check Apache error logs
sudo tail -f /var/log/apache2/error.log

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Check application logs
tail -f runtime/logs/app.log
```

### Required PHP Extensions
Make sure these extensions are installed:
```bash
sudo apt install php-mbstring php-xml php-mysql php-curl php-zip php-gd php-intl
sudo systemctl restart apache2  # or nginx
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login (username/password)
- `POST /api/auth/register` - Register new user
- `GET /api/auth/me` - Get current user info

### News
- `GET /api/news` - List all news
- `GET /api/news/{id}` - Get specific news
- `POST /api/news` - Create news (requires auth)
- `PUT /api/news/{id}` - Update news (requires auth)
- `DELETE /api/news/{id}` - Delete news (requires auth)

### Events
- `GET /api/events` - List all events
- `GET /api/events/{id}` - Get specific event
- `GET /api/events/upcoming` - Get upcoming events
- `GET /api/events/past` - Get past events
- `POST /api/events` - Create event (requires auth)
- `PUT /api/events/{id}` - Update event (requires auth)
- `DELETE /api/events/{id}` - Delete event (requires auth)

### Query Parameters
- `?per-page=20` - Pagination
- `?search=keyword` - Search in title/content
- `?status=1` - Filter by status

## Authentication
Use Bearer token in Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Project Features
✅ RESTful API with CRUD operations
✅ JWT Authentication
✅ Database migrations with sample data
✅ CORS enabled for frontend integration
✅ Input validation and error handling
✅ Pagination and search functionality
✅ Admin panel ready structure

## Next Steps for Ubuntu Server
1. Upload project files to `/var/www/html/dvm-api`
2. Install Composer dependencies
3. Create database via phpMyAdmin or MySQL CLI
4. Configure database connection in `config/db.php`
5. Run migrations to create tables and sample data
6. Configure Apache/Nginx virtual host
7. Set production environment settings
8. Test API endpoints
9. Connect with Vue.js frontend
10. Set up SSL certificate for production
