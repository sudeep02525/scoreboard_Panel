# ⚡ Quick Deployment Steps

## 🎯 Backend (Render) - 5 Minutes

1. **Push to GitHub:**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_URL
git push -u origin main
```

2. **Deploy on Render:**
   - Go to https://render.com
   - New + → Web Service
   - Connect GitHub repo
   - Root Directory: `backend`
   - Build: `npm install`
   - Start: `npm start`

3. **Add Environment Variables:**
```
MONGO_URI = mongodb+srv://kris:123%40krishna@cluster0.3hiyoih.mongodb.net/cricket_scoreboard?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET = cricket_tournament_secret_key_2026
PORT = 5000
```

4. **Copy Backend URL** (e.g., `https://xxx.onrender.com`)

---

## 🎯 Frontend (Vercel) - 3 Minutes

### Option 1: Vercel CLI (Fastest)
```bash
npm install -g vercel
cd frontend
vercel login
vercel
```

Add environment variable:
```bash
vercel env add NEXT_PUBLIC_API_URL
# Enter: https://YOUR_RENDER_URL.onrender.com/api
vercel --prod
```

### Option 2: Vercel Dashboard
1. Go to https://vercel.com
2. Import GitHub repo
3. Root Directory: `frontend`
4. Add env var:
   - `NEXT_PUBLIC_API_URL` = `https://YOUR_RENDER_URL.onrender.com/api`
5. Deploy

---

## ✅ Final Step

Update Backend CORS:
- Render Dashboard → Environment
- Add: `FRONTEND_URL = https://YOUR_VERCEL_URL.vercel.app`
- Save (auto-redeploys)

---

## 🎉 Done!

Test your app:
- Frontend: `https://your-app.vercel.app`
- Admin Login:
  - Email: `sudeepdas2525@zohomail.in`
  - Password: `Sudeep@1234567890`

---

## 📝 Important URLs

**Render Dashboard:** https://dashboard.render.com
**Vercel Dashboard:** https://vercel.com/dashboard
**MongoDB Atlas:** https://cloud.mongodb.com

---

## ⚠️ Common Issues

**Backend sleeping?**
- Free tier sleeps after 15 min
- First request takes 30-50 sec

**CORS error?**
- Check `FRONTEND_URL` in Render
- Check `NEXT_PUBLIC_API_URL` in Vercel

**Can't connect to MongoDB?**
- MongoDB Atlas → Network Access
- Add IP: `0.0.0.0/0` (Allow from anywhere)

---

## 🚀 Quick Update Commands

**Update Backend:**
```bash
git add .
git commit -m "Update backend"
git push
# Render auto-deploys
```

**Update Frontend:**
```bash
cd frontend
vercel --prod
# Or push to GitHub if connected
```

That's it! 🎊
