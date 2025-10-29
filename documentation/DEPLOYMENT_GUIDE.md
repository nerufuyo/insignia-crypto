# Deployment Guide - Insignia Crypto Backend

## Deploy to Railway (Free Tier)

### Prerequisites
- GitHub account
- Railway account (sign up at https://railway.app)

### Step 1: Prepare Repository
1. Push your code to GitHub:
   ```bash
   git push origin main
   ```

### Step 2: Deploy on Railway

#### Option A: Using Railway CLI
1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Initialize project:
   ```bash
   railway init
   ```

4. Add PostgreSQL database:
   ```bash
   railway add --database postgresql
   ```

5. Set environment variables:
   ```bash
   railway variables set PORT=3001
   railway variables set NODE_ENV=production
   ```

6. Deploy:
   ```bash
   railway up
   ```

#### Option B: Using Railway Dashboard
1. Go to https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Select `insignia-crypto-backend` repository
4. Railway will auto-detect NestJS and configure build

5. Add PostgreSQL database:
   - Click "+ New" → "Database" → "PostgreSQL"
   - Railway will automatically set `DATABASE_URL` environment variable

6. Add environment variables in Railway dashboard:
   - `PORT` = `3001`
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = (automatically set by Railway)

7. Click "Deploy"

### Step 3: Get Your Backend URL
After deployment, Railway will provide a URL like:
```
https://your-app.up.railway.app
```

### Important Notes
- Railway free tier includes:
  - 500 hours/month execution time
  - 512MB RAM
  - 1GB storage
  - Shared PostgreSQL database

- The backend will automatically run migrations on deployment using the nixpacks.toml configuration

### Monitoring
- View logs: `railway logs`
- Check status: `railway status`
- Open app: `railway open`

### Environment Variables Required
```
DATABASE_URL=postgresql://user:password@host:port/database
PORT=3001
NODE_ENV=production
```

## Alternative: Deploy to Render.com

### Steps:
1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect GitHub repository
4. Configure:
   - **Name**: insignia-crypto-backend
   - **Environment**: Node
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npx prisma migrate deploy && npm run start:prod`
   - **Instance Type**: Free

5. Add PostgreSQL database:
   - Click "New +" → "PostgreSQL"
   - Copy the Internal Database URL

6. Add environment variables:
   - `DATABASE_URL` = (from PostgreSQL instance)
   - `PORT` = `3001`
   - `NODE_ENV` = `production`

7. Click "Create Web Service"

## Alternative: Deploy to Fly.io

1. Install Fly CLI:
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. Login:
   ```bash
   fly auth login
   ```

3. Launch app:
   ```bash
   fly launch
   ```

4. Create PostgreSQL:
   ```bash
   fly postgres create
   ```

5. Attach database:
   ```bash
   fly postgres attach <postgres-app-name>
   ```

6. Deploy:
   ```bash
   fly deploy
   ```

## Testing Deployment
Once deployed, test your API:
```bash
curl https://your-backend-url.railway.app
curl https://your-backend-url.railway.app/api
```

## Troubleshooting

### Build Failures
- Check Railway logs
- Ensure all dependencies are in `package.json`
- Verify Prisma schema is valid

### Database Connection Issues
- Verify `DATABASE_URL` is set correctly
- Check PostgreSQL service is running
- Ensure migrations are applied

### Port Issues
- Railway automatically sets PORT environment variable
- Make sure your app uses `process.env.PORT`

### Memory Issues
- Free tier has limited RAM (512MB)
- Optimize your application if needed
- Consider upgrading to paid tier if necessary
