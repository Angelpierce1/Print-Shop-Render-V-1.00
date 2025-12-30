# Deploy to Render - Step by Step Guide

## ✅ Your Render Configuration is Ready!

Your `render.yaml` is already configured correctly:
- Python environment
- Dependencies from `requirements.txt`
- Flask app startup
- Port configuration

## Deployment Steps

### Option 1: Deploy via Render Dashboard (Recommended)

1. **Push to GitHub** (if not already done)
   ```bash
   git add .
   git commit -m "Ready for Render deployment"
   git push origin main
   ```

2. **Go to Render Dashboard**
   - Visit [dashboard.render.com](https://dashboard.render.com)
   - Sign up or log in (free tier available)

3. **Create New Web Service**
   - Click "New +" button
   - Select "Web Service"

4. **Connect GitHub Repository**
   - Click "Connect GitHub"
   - Authorize Render to access your repositories
   - Select: `Angelpierce1/Print-Shop-Render-V-1.00`

5. **Configure Service**
   - Render will auto-detect `render.yaml`
   - Service name: `print-shop` (or your choice)
   - Region: Choose closest to you
   - Branch: `main`
   - Root Directory: `.` (root)

6. **Deploy!**
   - Click "Create Web Service"
   - Render will:
     - Clone your repository
     - Install dependencies from `requirements.txt`
     - Start your Flask app
     - Provide a public URL

### Option 2: Deploy via Render CLI

```bash
# Install Render CLI
npm install -g render-cli

# Login
render login

# Deploy
render deploy
```

## What Happens During Deployment

1. **Build Phase:**
   - Render installs Python dependencies from `requirements.txt`
   - Sets up Python environment

2. **Start Phase:**
   - Runs: `python app.py`
   - Flask app starts on port 5000 (or PORT env var)
   - App listens on `0.0.0.0` (all interfaces)

3. **Health Check:**
   - Render checks if app is responding
   - Service goes live when healthy

## Important Notes

### System Dependencies

**pdf2image requires poppler-utils:**
- Render's build environment should handle this automatically
- If you get errors, you may need to add a build script

### Environment Variables

Your app uses:
- `PORT` - Set automatically by Render (default: 5000)
- `FLASK_ENV` - Set to `production` in render.yaml

### File Storage

- Uploaded files go to `static/uploads/`
- This is ephemeral storage (resets on redeploy)
- For production, consider using:
  - AWS S3
  - Cloudinary
  - Render Disk (persistent storage)

## After Deployment

1. **Get Your URL:**
   - Render provides: `https://print-shop.onrender.com` (or similar)
   - Your app will be live at this URL

2. **Test Endpoints:**
   - `GET /` - Main page
   - `POST /upload` - File upload
   - `POST /submit-order` - Order submission
   - `POST /validate-order` - Order validation

3. **Monitor Logs:**
   - Render Dashboard → Your Service → Logs
   - View real-time application logs

## Troubleshooting

### Build Fails

**Issue:** Dependencies not installing
**Solution:** Check `requirements.txt` for compatibility

**Issue:** Poppler not found
**Solution:** Add to build command:
```yaml
buildCommand: apt-get update && apt-get install -y poppler-utils && pip install -r requirements.txt
```

### App Crashes

**Check Logs:**
- Render Dashboard → Logs tab
- Look for Python errors

**Common Issues:**
- Missing environment variables
- Port configuration
- Import errors

### Slow First Request

**Normal:** Render free tier spins down after inactivity
- First request after idle: ~30 seconds
- Subsequent requests: Fast

**Solution:** Upgrade to paid plan for always-on

## Free Tier Limitations

- ✅ 750 hours/month free
- ✅ Auto-deploy from Git
- ✅ HTTPS included
- ⚠️ Spins down after 15 min inactivity
- ⚠️ Limited build time

## Next Steps

Once deployed:
1. Test all endpoints
2. Set up custom domain (optional)
3. Configure environment variables if needed
4. Set up monitoring/alerts

## Support

- Render Docs: [render.com/docs](https://render.com/docs)
- Render Community: [community.render.com](https://community.render.com)

