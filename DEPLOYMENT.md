# Deployment Guide - Ubuntu Server

This guide covers deploying the Institute API to an Ubuntu server via SSH.

## Prerequisites

- Ubuntu Server (20.04 or later)
- Root or sudo access
- Domain name (optional, but recommended)

## 1. Server Setup

### Connect to your server
```bash
ssh user@your-server-ip
```

### Update system packages
```bash
sudo apt update
sudo apt upgrade -y
```

### Install Node.js (v18 or later)
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Verify installation
```

### Install PostgreSQL
```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

### Install Nginx (Optional, for reverse proxy)
```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

## 2. Database Setup

### Create database and user
```bash
sudo -u postgres psql

# Inside PostgreSQL prompt:
CREATE DATABASE institute_db;
CREATE USER institute_user WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE institute_db TO institute_user;
\q
```

## 3. Application Deployment

### Create application directory
```bash
sudo mkdir -p /var/www/institute-api
sudo chown -R $USER:$USER /var/www/institute-api
cd /var/www/institute-api
```

### Clone or upload your code
**Option A: Git clone**
```bash
git clone https://github.com/yourusername/institute-api.git .
```

**Option B: SCP from local machine**
```bash
# Run this from your local machine (not on server)
scp -r ./institute-api user@your-server-ip:/var/www/
```

**Option C: Use rsync**
```bash
# Run this from your local machine
rsync -avz --exclude 'node_modules' ./institute-api/ user@your-server-ip:/var/www/institute-api/
```

### Install dependencies
```bash
cd /var/www/institute-api
npm install --production
```

### Create environment file
```bash
cp .env.example .env
nano .env
```

Update the following values in `.env`:
```env
NODE_ENV=production
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=institute_db
DB_USER=institute_user
DB_PASSWORD=your-secure-password
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
OPENAI_API_KEY=your-openai-api-key
CORS_ORIGIN=https://yourdomain.com
```

### Run database migrations
```bash
npm run migrate
npm run seed  # Optional: adds default admin user
```

### Create logs and uploads directories
```bash
mkdir -p logs uploads
chmod 755 logs uploads
```

## 4. Start Application with PM2

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

Copy and run the command that PM2 outputs to enable auto-start on reboot.

### Useful PM2 commands
```bash
pm2 status              # Check status
pm2 logs institute-api  # View logs
pm2 restart institute-api
pm2 stop institute-api
pm2 delete institute-api
```

## 5. Configure Nginx (Reverse Proxy)

### Create Nginx configuration
```bash
sudo nano /etc/nginx/sites-available/institute-api
```

Add the following configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Increase timeout for long-running requests (AI chat)
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Increase max upload size
    client_max_body_size 20M;
}
```

### Enable the site
```bash
sudo ln -s /etc/nginx/sites-available/institute-api /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl reload nginx
```

## 6. SSL Certificate (HTTPS) - Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts. Certbot will automatically configure Nginx for HTTPS.

## 7. Firewall Configuration

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

## 8. Testing

### Test the API
```bash
curl http://localhost:5000/health
curl https://yourdomain.com/health
```

### Test authentication
```bash
curl -X POST https://yourdomain.com/api/v1/core/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@institute.com","password":"admin123"}'
```

## 9. Monitoring & Maintenance

### View application logs
```bash
pm2 logs institute-api
tail -f /var/www/institute-api/logs/combined.log
tail -f /var/www/institute-api/logs/error.log
```

### Monitor system resources
```bash
pm2 monit
htop
```

### Database backup
```bash
# Create backup directory
mkdir -p /var/backups/postgres

# Backup database
sudo -u postgres pg_dump institute_db > /var/backups/postgres/institute_db_$(date +%Y%m%d).sql

# Create automated backup script
sudo nano /usr/local/bin/backup-db.sh
```

Add to `backup-db.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
sudo -u postgres pg_dump institute_db | gzip > $BACKUP_DIR/institute_db_$DATE.sql.gz
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
```

Make executable and schedule:
```bash
sudo chmod +x /usr/local/bin/backup-db.sh
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-db.sh
```

## 10. Updates & Deployment

### Update application
```bash
cd /var/www/institute-api
git pull  # or upload new files
npm install --production
npm run migrate  # if there are schema changes
pm2 restart institute-api
```

### Zero-downtime deployment
```bash
pm2 reload institute-api
```

## Troubleshooting

### Check if app is running
```bash
pm2 status
sudo netstat -tlnp | grep 5000
```

### Check Nginx errors
```bash
sudo tail -f /var/log/nginx/error.log
```

### Check database connection
```bash
sudo -u postgres psql -d institute_db -c "SELECT version();"
```

### Permission issues
```bash
sudo chown -R $USER:$USER /var/www/institute-api
chmod -R 755 /var/www/institute-api
```

## Security Recommendations

1. **Change default passwords** in `.env`
2. **Use strong JWT secrets** (generate with: `openssl rand -base64 32`)
3. **Enable firewall** (ufw)
4. **Keep system updated**: `sudo apt update && sudo apt upgrade`
5. **Monitor logs regularly**
6. **Use SSL/HTTPS** in production
7. **Limit database access** to localhost only
8. **Regular backups**
9. **Set up monitoring** (PM2 monitoring, New Relic, etc.)
10. **Rate limiting** is already configured in the app

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| NODE_ENV | Environment | production |
| PORT | Server port | 5000 |
| DB_HOST | Database host | localhost |
| DB_PORT | Database port | 5432 |
| DB_NAME | Database name | institute_db |
| DB_USER | Database user | institute_user |
| DB_PASSWORD | Database password | secure_password |
| JWT_SECRET | JWT secret key | random_secret_key |
| JWT_EXPIRES_IN | JWT expiration | 7d |
| OPENAI_API_KEY | OpenAI API key | sk-... |
| CORS_ORIGIN | Allowed origins | https://yourdomain.com |

## Support

For issues or questions, check the application logs and Nginx error logs first.
