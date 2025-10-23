# Sales God - Deployment Guide

This guide covers deploying Sales God to production environments.

## Architecture Overview

```
┌─────────────────┐
│ Chrome Extension│
│  (Users' PCs)   │
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────┐     ┌──────────────┐
│  Load Balancer  │────▶│  PostgreSQL  │
│   (Optional)    │     │   Database   │
└────────┬────────┘     └──────────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────┐
│  Backend API    │────▶│ File Storage │
│   (Node.js)     │     │  (S3/local)  │
└─────────────────┘     └──────────────┘
         ▲
         │
┌────────┴────────┐
│  Admin Dashboard│
│     (React)     │
└─────────────────┘
```

## Backend Deployment

### Option 1: Deploy to Heroku

1. **Prepare Application**

```bash
cd backend

# Add Procfile
echo "web: node src/server.js" > Procfile

# Ensure package.json has start script
# "start": "node src/server.js"
```

2. **Create Heroku App**

```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Create app
heroku create sales-god-api

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini
```

3. **Configure Environment**

```bash
# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
heroku config:set CORS_ORIGIN=chrome-extension://*,https://yourdashboard.com

# Database URL is automatically set by Heroku
```

4. **Deploy**

```bash
# Deploy to Heroku
git add .
git commit -m "Prepare for deployment"
git push heroku main

# Run migrations
heroku run npm run migrate

# Check logs
heroku logs --tail
```

### Option 2: Deploy to AWS EC2

1. **Launch EC2 Instance**
   - AMI: Ubuntu 22.04 LTS
   - Instance Type: t3.small (or larger)
   - Security Group: Allow ports 80, 443, 22, 5432

2. **Setup Server**

```bash
# SSH into instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

3. **Configure PostgreSQL**

```bash
sudo -u postgres psql

CREATE DATABASE sales_god;
CREATE USER salesgod WITH ENCRYPTED PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE sales_god TO salesgod;
\q
```

4. **Deploy Application**

```bash
# Clone repository
git clone https://github.com/yourusername/sales-god.git
cd sales-god/backend

# Install dependencies
npm install --production

# Create .env file
nano .env
# Add all production environment variables

# Run migrations
npm run migrate

# Start with PM2
pm2 start src/server.js --name sales-god-api
pm2 startup
pm2 save
```

5. **Configure Nginx**

```bash
sudo nano /etc/nginx/sites-available/sales-god
```

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/sales-god /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Setup SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d api.yourdomain.com
```

### Option 3: Deploy to Docker

1. **Create Dockerfile**

```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .

EXPOSE 3000

CMD ["node", "src/server.js"]
```

2. **Create docker-compose.yml**

```yaml
version: '3.8'

services:
  db:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: sales_god
      POSTGRES_USER: salesgod
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  api:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DB_HOST: db
      DB_PORT: 5432
      DB_NAME: sales_god
      DB_USER: salesgod
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - db
    restart: unless-stopped

volumes:
  postgres_data:
```

3. **Deploy**

```bash
# Build and run
docker-compose up -d

# Run migrations
docker-compose exec api npm run migrate

# View logs
docker-compose logs -f api
```

## Dashboard Deployment

### Option 1: Deploy to Vercel

1. **Prepare Application**

```bash
cd dashboard

# Build the app
npm run build
```

2. **Deploy**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables in Vercel dashboard
# VITE_API_URL=https://api.yourdomain.com/api
```

### Option 2: Deploy to Netlify

1. **Build Application**

```bash
cd dashboard
npm run build
```

2. **Deploy**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=dist

# Or connect GitHub repo in Netlify dashboard
```

### Option 3: Serve with Nginx

```bash
# Build application
cd dashboard
npm run build

# Copy to web root
sudo cp -r dist/* /var/www/html/dashboard/

# Configure Nginx
sudo nano /etc/nginx/sites-available/dashboard
```

```nginx
server {
    listen 80;
    server_name dashboard.yourdomain.com;
    root /var/www/html/dashboard;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## Chrome Extension Deployment

### Package Extension

1. **Update manifest.json**

```json
{
  "host_permissions": [
    "https://meet.google.com/*",
    "https://api.yourdomain.com/*"
  ]
}
```

2. **Update API URL**

Update the default API URL in `extension/options.html` to your production URL.

3. **Create Package**

```bash
cd extension
zip -r sales-god-extension.zip .
```

### Publish to Chrome Web Store

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Pay the one-time $5 developer fee (if first time)
3. Click **New Item**
4. Upload `sales-god-extension.zip`
5. Fill in:
   - Description
   - Screenshots
   - Category: Productivity
   - Privacy policy
6. Submit for review (takes 1-3 days)

### Private Distribution

For internal use only:

1. **Chrome Web Store (Unlisted)**
   - Upload extension
   - Set visibility to "Unlisted"
   - Share the private link with your team

2. **G Suite/Google Workspace**
   - Upload to Google Admin Console
   - Deploy to specific organizational units
   - Automatic updates

## Database Backup

### Automated Backups

```bash
# Create backup script
cat > /home/ubuntu/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/ubuntu/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

pg_dump -U salesgod -h localhost sales_god | gzip > $BACKUP_DIR/backup_$TIMESTAMP.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
EOF

chmod +x /home/ubuntu/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /home/ubuntu/backup-db.sh
```

### Restore from Backup

```bash
gunzip -c backup_20240101_020000.sql.gz | psql -U salesgod -h localhost sales_god
```

## Monitoring

### Setup PM2 Monitoring

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Application Monitoring

Consider integrating:
- **Sentry**: Error tracking
- **New Relic**: Performance monitoring
- **DataDog**: Infrastructure monitoring
- **LogRocket**: Frontend monitoring

## Security Checklist

- [ ] Enable HTTPS for all services
- [ ] Set strong JWT_SECRET
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Setup firewall rules
- [ ] Regular security updates
- [ ] Database encryption at rest
- [ ] Secure environment variables
- [ ] Regular backups
- [ ] Monitor error logs
- [ ] Setup intrusion detection
- [ ] Implement audit logging

## Scaling Considerations

### Horizontal Scaling

```bash
# Use PM2 cluster mode
pm2 start src/server.js -i max --name sales-god-api

# Or use load balancer with multiple instances
```

### Database Optimization

```sql
-- Add indexes for common queries
CREATE INDEX idx_recordings_user_created ON recordings(user_id, created_at DESC);
CREATE INDEX idx_call_analysis_recording ON call_analysis(recording_id);
CREATE INDEX idx_transcription_recording ON transcription_segments(recording_id);

-- Enable query performance insights
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
```

### Caching

Consider adding Redis for:
- Session management
- API response caching
- Rate limiting
- Real-time features

## Cost Estimation

### AWS (Medium Scale)
- EC2 t3.small: $15/month
- RDS PostgreSQL: $30/month
- S3 Storage: $5/month
- CloudFront: $10/month
- **Total: ~$60/month**

### Heroku (Small Scale)
- Hobby Dyno: $7/month
- Postgres Mini: $5/month
- **Total: ~$12/month**

### Self-Hosted (VPS)
- DigitalOcean Droplet: $12/month
- Block Storage: $5/month
- **Total: ~$17/month**

## Support & Maintenance

### Regular Tasks
- Weekly: Review error logs
- Monthly: Update dependencies
- Quarterly: Security audit
- Yearly: Architecture review

### Monitoring Alerts
- API response time > 2s
- Error rate > 1%
- Database connections > 80%
- Disk usage > 85%
- SSL certificate expiring < 30 days

## Rollback Procedure

```bash
# Backend rollback
pm2 stop sales-god-api
git checkout previous-version
npm install
pm2 start sales-god-api

# Dashboard rollback
vercel --prod --rollback

# Database rollback (if needed)
psql -U salesgod sales_god < backup_file.sql
```

## Contact

For deployment support or questions, refer to the main README.md or create an issue.

