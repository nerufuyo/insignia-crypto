# Deployment Guide - Insignia Crypto

This guide covers multiple deployment options for the Insignia Crypto API.

## Table of Contents

- [Docker Deployment](#docker-deployment)
- [Manual Deployment](#manual-deployment)
- [Cloud Platform Deployment](#cloud-platform-deployment)
  - [Railway](#railway)
  - [Render](#render)
  - [Heroku](#heroku)
  - [AWS](#aws)
- [Environment Variables](#environment-variables)
- [Database Migration](#database-migration)
- [Health Checks](#health-checks)
- [Troubleshooting](#troubleshooting)

---

## Docker Deployment

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+

### Quick Start

1. **Clone the repository**

```bash
git clone https://github.com/nerufuyo/insignia-crypto.git
cd insignia-crypto
```

2. **Configure environment**

```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Deploy with Docker Compose**

```bash
./deploy-docker.sh
```

Or manually:

```bash
docker-compose up -d
```

4. **Access the application**

- API: http://localhost:3000
- Swagger Docs: http://localhost:3000/api

### Docker Commands

```bash
# View logs
docker-compose logs -f app

# Stop containers
docker-compose down

# Restart containers
docker-compose restart

# Rebuild and restart
docker-compose up -d --build

# Access database
docker-compose exec postgres psql -U postgres -d insignia_crypto
```

---

## Manual Deployment

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm 9+

### Steps

1. **Install dependencies**

```bash
npm install
```

2. **Configure environment**

```bash
cp .env.production.example .env
# Update DATABASE_URL and other variables
```

3. **Run database migrations**

```bash
npx prisma migrate deploy
```

4. **Build the application**

```bash
npm run build
```

5. **Start the application**

```bash
npm run start:prod
```

### Using PM2 (Recommended for Production)

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start dist/main.js --name insignia-crypto

# View logs
pm2 logs insignia-crypto

# Monitor
pm2 monit

# Auto-restart on reboot
pm2 startup
pm2 save
```

---

## Cloud Platform Deployment

### Railway

1. **Create a new project on [Railway](https://railway.app)**

2. **Add PostgreSQL database**
   - Click "New" → "Database" → "PostgreSQL"

3. **Deploy from GitHub**
   - Click "New" → "GitHub Repo"
   - Select `nerufuyo/insignia-crypto`

4. **Configure environment variables**
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   NODE_ENV=production
   PORT=3000
   ```

5. **Add build command**
   ```
   npm install && npx prisma generate && npm run build
   ```

6. **Add start command**
   ```
   npx prisma migrate deploy && npm run start:prod
   ```

### Render

1. **Create a new Web Service on [Render](https://render.com)**

2. **Connect your GitHub repository**
   - Repository: `nerufuyo/insignia-crypto`

3. **Configure service**
   - Environment: `Node`
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npx prisma migrate deploy && npm run start:prod`

4. **Add PostgreSQL database**
   - Create new PostgreSQL database
   - Copy Internal Database URL

5. **Set environment variables**
   ```
   DATABASE_URL=<your-postgres-url>
   NODE_ENV=production
   PORT=3000
   ```

### Heroku

1. **Install Heroku CLI**

```bash
npm install -g heroku
heroku login
```

2. **Create Heroku app**

```bash
heroku create insignia-crypto-api
```

3. **Add PostgreSQL addon**

```bash
heroku addons:create heroku-postgresql:mini
```

4. **Configure buildpacks**

```bash
heroku buildpacks:set heroku/nodejs
```

5. **Set environment variables**

```bash
heroku config:set NODE_ENV=production
```

6. **Add Procfile**

Create `Procfile`:
```
web: npx prisma migrate deploy && npm run start:prod
```

7. **Deploy**

```bash
git push heroku main
```

### AWS (EC2)

1. **Launch EC2 instance**
   - Ubuntu 22.04 LTS
   - t2.micro or higher
   - Open port 3000 in Security Group

2. **Connect to instance**

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

3. **Install dependencies**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install PM2
sudo npm install -g pm2
```

4. **Configure PostgreSQL**

```bash
sudo -u postgres psql
CREATE DATABASE insignia_crypto;
CREATE USER cryptouser WITH PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE insignia_crypto TO cryptouser;
\q
```

5. **Clone and deploy application**

```bash
git clone https://github.com/nerufuyo/insignia-crypto.git
cd insignia-crypto
npm install
cp .env.production.example .env
# Edit .env with your configuration
npx prisma migrate deploy
npm run build
pm2 start dist/main.js --name insignia-crypto
pm2 startup
pm2 save
```

6. **Configure Nginx (Optional)**

```bash
sudo apt install -y nginx
```

Create `/etc/nginx/sites-available/insignia-crypto`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/insignia-crypto /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NODE_ENV` | Environment (development/production) | `production` |
| `PORT` | Application port | `3000` |

### Optional Variables (Production)

| Variable | Description | Default |
|----------|-------------|---------|
| `CORS_ORIGIN` | Allowed CORS origins | `*` |
| `LOG_LEVEL` | Logging level | `info` |
| `RATE_LIMIT_TTL` | Rate limit window (seconds) | `60` |
| `RATE_LIMIT_MAX` | Max requests per window | `100` |

---

## Database Migration

### Production Migration

**Always backup your database before running migrations!**

```bash
# Create backup
pg_dump -U username database_name > backup.sql

# Run migrations
npx prisma migrate deploy

# If migration fails, restore backup
psql -U username database_name < backup.sql
```

### Prisma Studio (Database UI)

```bash
npx prisma studio
```

Access at: http://localhost:5555

---

## Health Checks

### Application Health Check

```bash
curl http://localhost:3000
```

### Database Health Check

```bash
curl http://localhost:3000/api
```

### Docker Health Check

```bash
docker-compose ps
```

All services should show "healthy" status.

---

## Troubleshooting

### Docker Issues

**Container won't start:**
```bash
docker-compose logs app
```

**Database connection failed:**
```bash
docker-compose exec postgres pg_isready -U postgres
```

**Reset everything:**
```bash
docker-compose down -v
docker-compose up -d
```

### Production Issues

**Port already in use:**
```bash
lsof -ti:3000 | xargs kill -9
```

**Prisma Client not generated:**
```bash
npx prisma generate
```

**Migration issues:**
```bash
npx prisma migrate resolve --rolled-back "migration_name"
npx prisma migrate deploy
```

### Performance Issues

**Check logs:**
```bash
pm2 logs insignia-crypto
```

**Monitor resources:**
```bash
pm2 monit
```

**Database performance:**
```sql
-- Check slow queries
SELECT * FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;

-- Check database size
SELECT pg_size_pretty(pg_database_size('insignia_crypto'));
```

---

## Security Checklist

- [ ] Use strong DATABASE_URL credentials
- [ ] Set NODE_ENV=production
- [ ] Configure CORS_ORIGIN for your domain
- [ ] Enable HTTPS/SSL
- [ ] Set up rate limiting
- [ ] Regular database backups
- [ ] Monitor application logs
- [ ] Keep dependencies updated
- [ ] Use environment variables for secrets
- [ ] Disable Swagger in production (optional)

---

## Monitoring

### Recommended Tools

- **Application**: PM2, New Relic, Datadog
- **Database**: pgAdmin, CloudWatch (AWS)
- **Logs**: Logtail, Papertrail
- **Uptime**: UptimeRobot, Pingdom

---

## Support

For deployment issues:
- GitHub Issues: https://github.com/nerufuyo/insignia-crypto/issues
- Documentation: See README.md

---

**Last Updated**: October 2025
