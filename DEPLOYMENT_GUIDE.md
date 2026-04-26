# 🚀 Deployment Guide - APL Cricket Scoreboard

## Backend Deployment (Render)

### Step 1: Prepare Backend
1. Make sure you're in the backend folder
2. Ensure `.env` file has your MongoDB URI

### Step 2: Push to GitHub
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit"

# Create a new repository on GitHub and push
git remote add origin YOUR_GITHUB_REPO_URL
git branch -M main
git push -u origin main
```

### Step 3: Deploy on Render

1. **Go to Render**: https://render.com
2. **Sign up/Login** with GitHub
3. **Click "New +"** → Select **"Web Service"**
4. **Connect your GitHub repository**
5. **Configure the service:**
   - **Name**: `apl-cricket-backend` (or any name)
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

6. **Add Environment Variables:**
   Click "Advanced" → "Add Environment Variable"
   
   Add these variables:
   ```
   MONGO_URI = mongodb+srv://kris:123%40krishna@cluster0.3hiyoih.mongodb.net/cricket_scoreboard?retryWrites=true&w=majority&appName=Cluster0
   
   JWT_SECRET = cricket_tournament_secret_key_2026
   
   PORT = 5000
   
   NODE_ENV = production
   ```

7. **Click "Create Web Service"**
8. **Wait for deployment** (takes 2-3 minutes)
9. **Copy your backend URL** (e.g., `https://apl-cricket-backend.onrender.com`)

### Important Notes:
- ⚠️ Free tier sleeps after 15 minutes of inactivity
- First request after sleep takes 30-50 seconds to wake up
- Keep your MongoDB URI secure

---

## Frontend Deployment (Vercel)

### Step 1: Prepare Frontend
1. Make sure you're in the frontend folder
2. Update `.env.local` with your Render backend URL

### Step 2: Deploy on Vercel

#### Option A: Using Vercel CLI (Recommended)

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Login to Vercel:**
```bash
vercel login
```

3. **Deploy from frontend folder:**
```bash
cd frontend
vercel
```

4. **Follow the prompts:**
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - Project name? `apl-cricket-scoreboard` (or any name)
   - In which directory is your code? `./`
   - Want to override settings? **N**

5. **Set Environment Variable:**
```bash
vercel env add NEXT_PUBLIC_API_URL
```
Enter your Render backend URL: `https://apl-cricket-backend.onrender.com/api`

6. **Deploy to production:**
```bash
vercel --prod
```

#### Option B: Using Vercel Dashboard

1. **Go to Vercel**: https://vercel.com
2. **Sign up/Login** with GitHub
3. **Click "Add New..."** → **"Project"**
4. **Import your GitHub repository**
5. **Configure Project:**
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

6. **Add Environment Variables:**
   Click "Environment Variables"
   
   Add:
   ```
   Name: NEXT_PUBLIC_API_URL
   Value: https://YOUR_RENDER_BACKEND_URL.onrender.com/api
   ```
   (Replace with your actual Render URL)

7. **Click "Deploy"**
8. **Wait for deployment** (takes 1-2 minutes)
9. **Your site is live!** (e.g., `https://apl-cricket-scoreboard.vercel.app`)

---

## Post-Deployment Configuration

### Update Backend CORS

1. **Go to Render Dashboard**
2. **Select your backend service**
3. **Go to "Environment"**
4. **Add new environment variable:**
   ```
   FRONTEND_URL = https://your-vercel-app.vercel.app
   ```
5. **Save Changes** (service will auto-redeploy)

### Test Your Deployment

1. **Open your Vercel URL**
2. **Try admin login:**
   - Email: `sudeepdas2525@zohomail.in`
   - Password: `Sudeep@1234567890`
3. **Create a match and test scoring**

---

## Troubleshooting

### Backend Issues:

**Problem**: "Cannot connect to MongoDB"
- **Solution**: Check if MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- Go to MongoDB Atlas → Network Access → Add IP Address → Allow Access from Anywhere

**Problem**: "CORS error"
- **Solution**: Make sure `FRONTEND_URL` environment variable is set correctly in Render

**Problem**: "Service unavailable"
- **Solution**: Free tier sleeps after inactivity. First request takes time to wake up.

### Frontend Issues:

**Problem**: "Failed to fetch"
- **Solution**: Check if `NEXT_PUBLIC_API_URL` is set correctly in Vercel
- Make sure it ends with `/api` (e.g., `https://backend.onrender.com/api`)

**Problem**: "Build failed"
- **Solution**: Check build logs in Vercel dashboard
- Make sure all dependencies are in `package.json`

**Problem**: "Images not loading"
- **Solution**: Make sure `logo.png` exists in `frontend/public/` folder

---

## Environment Variables Summary

### Backend (Render):
```env
MONGO_URI=mongodb+srv://kris:123%40krishna@cluster0.3hiyoih.mongodb.net/cricket_scoreboard?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=cricket_tournament_secret_key_2026
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-vercel-app.vercel.app
```

### Frontend (Vercel):
```env
NEXT_PUBLIC_API_URL=https://your-render-backend.onrender.com/api
```

---

## Custom Domain (Optional)

### For Vercel (Frontend):
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

### For Render (Backend):
1. Go to Render Dashboard → Your Service → Settings → Custom Domain
2. Add your custom domain
3. Update DNS records as instructed

---

## Monitoring & Logs

### Render Logs:
- Go to your service → "Logs" tab
- View real-time logs
- Check for errors

### Vercel Logs:
- Go to your project → "Deployments"
- Click on a deployment → "View Function Logs"
- Check for errors

---

## Cost Breakdown

### Free Tier Limits:

**Render (Backend):**
- ✅ Free tier available
- ⚠️ Sleeps after 15 min inactivity
- ⚠️ 750 hours/month free
- ⚠️ Slower performance

**Vercel (Frontend):**
- ✅ 100 GB bandwidth/month
- ✅ Unlimited deployments
- ✅ Always fast (no sleep)
- ✅ Automatic HTTPS

**MongoDB Atlas:**
- ✅ 512 MB storage free
- ✅ Shared cluster
- ✅ Enough for small tournaments

---

## Upgrade Options (If Needed)

### Render:
- **Starter Plan**: $7/month
  - No sleep
  - Better performance
  - 24/7 uptime

### Vercel:
- **Pro Plan**: $20/month
  - More bandwidth
  - Advanced analytics
  - Priority support

### MongoDB Atlas:
- **M2 Cluster**: $9/month
  - 2 GB storage
  - Better performance
  - Automated backups

---

## Quick Commands Reference

### Deploy Backend:
```bash
# Push to GitHub
git add .
git commit -m "Update"
git push

# Render auto-deploys from GitHub
```

### Deploy Frontend:
```bash
# Using Vercel CLI
cd frontend
vercel --prod

# Or push to GitHub (if connected)
git add .
git commit -m "Update"
git push
```

### View Logs:
```bash
# Vercel logs
vercel logs

# Render logs
# View in dashboard
```

---

## Success Checklist

- [ ] Backend deployed on Render
- [ ] Backend URL copied
- [ ] Frontend deployed on Vercel
- [ ] Environment variables set correctly
- [ ] CORS configured
- [ ] Admin login works
- [ ] Can create teams/players
- [ ] Can create matches
- [ ] Scoring works
- [ ] Live updates work
- [ ] Mobile responsive

---

## Support

If you face any issues:
1. Check logs in Render/Vercel dashboard
2. Verify environment variables
3. Test backend API directly (use Postman/Thunder Client)
4. Check MongoDB Atlas connection
5. Clear browser cache and try again

---

## 🎉 Congratulations!

Your APL Cricket Scoreboard is now live and accessible worldwide! 🏏✨

**Share your URLs:**
- Frontend: `https://your-app.vercel.app`
- Backend API: `https://your-backend.onrender.com`

Enjoy your tournament! 🏆
