# ⚠️ IMPORTANT: Add PostgreSQL Database

## Your deployment failed because DATABASE_URL is missing!

### Quick Fix - Add Database via Railway Dashboard:

1. **Go to Railway Dashboard**:
   - Visit: https://railway.com/project/1b298eac-8aaf-4863-a2ad-f877268cf770

2. **Add PostgreSQL**:
   - Click the **"+ New"** button (top right)
   - Select **"Database"**
   - Choose **"Add PostgreSQL"**
   - Railway will automatically provision the database

3. **Link to Your Service**:
   - The PostgreSQL plugin will automatically add `DATABASE_URL` to your backend service
   - No manual configuration needed!

4. **Redeploy**:
   ```bash
   railway up
   ```

### Alternative: Using Railway CLI (Not Working Currently)

The `railway add` command seems to have UI limitations. Please use the dashboard method above.

### After Database is Added:

You'll see a new `DATABASE_URL` variable like:
```
postgresql://postgres:password@containers-us-west-xxx.railway.app:port/railway
```

Then redeploy and your app will work! 🎉

## Updated Dockerfile

✅ Updated to use Node 20 (was Node 18)
✅ This fixes the engine version warnings

## Next Steps:

1. Add PostgreSQL via dashboard (link above)
2. Wait for database to provision (~30 seconds)
3. Run `railway up` again to redeploy
4. Your backend will be live! 🚀
