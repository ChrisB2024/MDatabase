# 🚀 Deployment Guide - Nigerian Payroll Management System

## Overview

This guide covers deploying your payroll system to production using:
- **Frontend**: Vercel (recommended for Next.js)
- **Backend**: Railway or Render (FastAPI hosting)
- **Database**: Supabase (already configured)

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure:
- [x] All code compiles without errors ✅
- [x] Backend and frontend tested locally ✅
- [x] Database connection working ✅
- [x] API authentication implemented ✅
- [x] Environment variables documented ✅

---

## 🎯 OPTION 1: Deploy to Vercel + Railway (Recommended)

This is the easiest and most cost-effective option.

### Step 1: Deploy Frontend to Vercel

#### A. Install Vercel CLI (Optional)
```bash
npm install -g vercel
```

#### B. Deploy via Vercel Dashboard (Easiest)

1. **Go to [vercel.com](https://vercel.com)** and sign in with GitHub
2. **Click "Add New Project"**
3. **Import your repository**:
   - If not on GitHub yet, push your code:
     ```bash
     cd /Users/chrisilias/Desktop/MDatabase
     git init
     git add .
     git commit -m "Initial commit - Nigerian Payroll System"
     # Create repo on GitHub first, then:
     git remote add origin https://github.com/YOUR_USERNAME/MDatabase.git
     git push -u origin main
     ```
4. **Configure Project**:
   - Framework Preset: **Next.js**
   - Root Directory: `frontend`
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)

5. **Add Environment Variables** (Important!):
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
   NEXT_PUBLIC_API_KEY=a8HHKtdn5tJLE3D9K9l5Tj_Z2OjCuO4TsAxicmhkjBQ
   ```
   
   > **Note**: Leave `NEXT_PUBLIC_API_URL` empty for now. You'll update it after deploying the backend.

6. **Click "Deploy"**
   - Vercel will build and deploy automatically
   - You'll get a URL like: `https://your-app.vercel.app`

#### C. Deploy via CLI (Alternative)
```bash
cd /Users/chrisilias/Desktop/MDatabase/frontend
vercel
# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? mdatabase-frontend
# - Directory? ./
# - Override settings? No
```

---

### Step 2: Deploy Backend to Railway

#### A. Sign Up for Railway
1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project"

#### B. Deploy Backend

1. **Select "Deploy from GitHub repo"**
2. **Choose your repository** (or create one)
3. **Configure deployment**:
   - Root Directory: `backend`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

4. **Add Environment Variables** in Railway Dashboard:
   ```
   DATABASE_URL=postgresql://postgres.yvwzaurkkryibinrcktz:@conQuest7503$@aws-0-us-west-2.pooler.supabase.com:5432/postgres
   API_KEY=a8HHKtdn5tJLE3D9K9l5Tj_Z2OjCuO4TsAxicmhkjBQ
   CORS_ORIGINS=https://your-app.vercel.app
   ```

5. **Create Railway Start Script**:
   Create `backend/railway.json`:
   ```json
   {
     "$schema": "https://railway.app/railway.schema.json",
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "uvicorn app.main:app --host 0.0.0.0 --port $PORT",
       "restartPolicyType": "ON_FAILURE",
       "restartPolicyMaxRetries": 10
     }
   }
   ```

6. **Update requirements.txt** (if needed):
   ```bash
   cd /Users/chrisilias/Desktop/MDatabase/backend
   pip freeze > requirements.txt
   ```

7. **Deploy**:
   - Railway will auto-deploy
   - You'll get a URL like: `https://mdatabase-backend.railway.app`

#### C. Update CORS in Backend

After deployment, update `backend/app/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://your-app.vercel.app",  # Add your Vercel URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

### Step 3: Connect Frontend to Backend

1. **Get your Railway backend URL** (e.g., `https://mdatabase-backend.railway.app`)
2. **Update Vercel Environment Variables**:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Update `NEXT_PUBLIC_API_URL` to your Railway URL
   - Click "Save"
3. **Redeploy Frontend**:
   - Go to Deployments tab
   - Click "Redeploy" on latest deployment

---

## 🎯 OPTION 2: Deploy to Vercel + Render

Similar to Railway, but using Render for the backend.

### Step 1: Deploy Backend to Render

1. **Go to [render.com](https://render.com)** and sign in
2. **Click "New +" → "Web Service"**
3. **Connect your repository**
4. **Configure**:
   - Name: `mdatabase-backend`
   - Environment: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Instance Type: Free (or paid for production)

5. **Add Environment Variables**:
   ```
   DATABASE_URL=postgresql://postgres.yvwzaurkkryibinrcktz:@conQuest7503$@aws-0-us-west-2.pooler.supabase.com:5432/postgres
   API_KEY=a8HHKtdn5tJLE3D9K9l5Tj_Z2OjCuO4TsAxicmhkjBQ
   PYTHON_VERSION=3.11
   ```

6. **Deploy** - Render will build and deploy automatically

Then follow Step 1 and Step 3 from Option 1 for the frontend.

---

## 🎯 OPTION 3: All-in-One Deployment (DigitalOcean App Platform)

Deploy both frontend and backend together.

1. **Go to [digitalocean.com](https://digitalocean.com)**
2. **Create an App**
3. **Add both components**:
   - Component 1: Next.js (frontend)
   - Component 2: Python (backend)
4. **Configure environment variables for both**
5. **Deploy**

---

## 📝 Required Files for Deployment

### 1. Backend Requirements File

Create/verify `backend/requirements.txt`:
```bash
cd /Users/chrisilias/Desktop/MDatabase/backend
pip freeze > requirements.txt
```

Should include:
```
fastapi==0.115.0
uvicorn[standard]==0.30.6
sqlalchemy==2.0.23
psycopg[binary]==3.2.3
python-dotenv==1.0.0
pydantic==2.5.2
pydantic-settings==2.1.0
```

### 2. Backend Runtime File (for some platforms)

Create `backend/runtime.txt`:
```
python-3.11.0
```

### 3. Backend Procfile (for some platforms)

Create `backend/Procfile`:
```
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### 4. Frontend Package.json Verification

Ensure `frontend/package.json` has:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

---

## 🔐 Security Considerations

### 1. Generate New Production API Key

For production, generate a new API key:
```bash
python3 -c "import secrets; print('Production API Key:', secrets.token_urlsafe(32))"
```

Update in:
- Backend environment variables
- Frontend environment variables

### 2. Environment Variables - NEVER Commit

Ensure `.gitignore` includes:
```
# Backend
backend/.env
backend/__pycache__
backend/**/__pycache__

# Frontend
frontend/.env.local
frontend/.env.production
frontend/node_modules
frontend/.next
```

### 3. Database Security

Your current Supabase connection is already secure with:
- ✅ Connection pooler
- ✅ SSL enabled
- ✅ Password authentication

For production, consider:
- Enabling Row Level Security (RLS) in Supabase
- Creating separate read-only database users
- Regular backups (Supabase has automatic backups)

---

## 🔧 Post-Deployment Configuration

### 1. Update CORS

After frontend deployment, update backend CORS:

Edit `backend/app/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Keep for local development
        "https://your-app.vercel.app",  # Add production URL
        "https://www.yourdomain.com",  # If using custom domain
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 2. Custom Domain (Optional)

#### Vercel Custom Domain:
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain (e.g., `payroll.yourdomain.com`)
3. Follow DNS configuration instructions

#### Railway Custom Domain:
1. Go to Railway Dashboard → Your Service → Settings
2. Add custom domain
3. Configure CNAME record

---

## 🧪 Testing Production Deployment

After deployment, test these endpoints:

### Backend Health Check:
```bash
curl https://your-backend.railway.app/api/v1/health
```

### Frontend Access:
```bash
curl https://your-app.vercel.app
```

### API with Authentication:
```bash
curl -H "X-API-Key: your-api-key" https://your-backend.railway.app/api/v1/employees/
```

---

## 📊 Monitoring & Logs

### Vercel:
- Dashboard → Deployments → Click deployment → View Function Logs
- Real-time logs during build and runtime

### Railway:
- Dashboard → Your Service → Deployments → View Logs
- Observability tab for metrics

### Render:
- Dashboard → Your Service → Logs tab
- Metrics tab for performance

---

## 💰 Cost Breakdown

### Free Tier Hosting (Perfect for MVP):

| Service | Free Tier | Limits |
|---------|-----------|--------|
| **Vercel** | Free | Unlimited projects, 100GB bandwidth/month |
| **Railway** | $5 credit/month | ~500 hours execution time |
| **Render** | Free | 750 hours/month per service |
| **Supabase** | Free | 500MB database, 1GB file storage |

**Total Monthly Cost: $0-5** for low traffic

### Production Hosting (Recommended):

| Service | Paid Plan | Cost |
|---------|-----------|------|
| **Vercel Pro** | Unlimited bandwidth | $20/month |
| **Railway** | Usage-based | ~$5-20/month |
| **Render** | Standard | $7/month per service |
| **Supabase Pro** | More resources | $25/month |

**Total Monthly Cost: ~$32-65** for production workload

---

## 🚨 Common Deployment Issues & Fixes

### Issue 1: Build Fails on Vercel
```
Error: Cannot find module '@/components/...'
```
**Fix**: Ensure `tsconfig.json` has correct paths:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Issue 2: API Connection Refused
```
Failed to fetch: NetworkError
```
**Fix**: 
1. Check CORS is configured with frontend URL
2. Verify `NEXT_PUBLIC_API_URL` is set correctly
3. Ensure backend is deployed and running

### Issue 3: Database Connection Error
```
psycopg.OperationalError: connection failed
```
**Fix**:
1. Check `DATABASE_URL` format is correct
2. Ensure Supabase database is not paused
3. Verify connection pooler URL (should end with `.pooler.supabase.com`)

### Issue 4: Environment Variables Not Loading
**Fix**:
1. Vercel: Redeploy after adding env vars
2. Railway: Restart deployment
3. Check variable names match exactly (case-sensitive)

---

## 📱 Quick Deployment Commands Reference

### Deploy Frontend (Vercel CLI):
```bash
cd frontend
vercel --prod
```

### Deploy Backend (Railway CLI):
```bash
cd backend
railway up
```

### Check Backend Logs:
```bash
railway logs
```

### View Vercel Logs:
```bash
vercel logs
```

---

## ✅ Deployment Checklist

Before going live, verify:

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Railway/Render
- [ ] Environment variables configured on both
- [ ] Backend URL updated in frontend env vars
- [ ] CORS configured with frontend URL
- [ ] Production API key generated and set
- [ ] Database connection working
- [ ] API authentication tested
- [ ] All pages load correctly
- [ ] CRUD operations work
- [ ] Nigerian currency (₦) displays correctly
- [ ] CSV exports work
- [ ] SSL certificate active (https://)
- [ ] Custom domain configured (optional)
- [ ] Monitoring set up
- [ ] Backup strategy in place

---

## 🎉 You're Ready to Deploy!

### Fastest Path to Production:

1. **Push code to GitHub** (if not already):
   ```bash
   cd /Users/chrisilias/Desktop/MDatabase
   git init
   git add .
   git commit -m "Ready for deployment"
   # Create GitHub repo, then:
   git remote add origin https://github.com/YOUR_USERNAME/mdatabase.git
   git push -u origin main
   ```

2. **Deploy Backend to Railway**:
   - Sign in to Railway → New Project → Deploy from GitHub
   - Set environment variables
   - Deploy

3. **Deploy Frontend to Vercel**:
   - Sign in to Vercel → New Project → Import from GitHub
   - Set `NEXT_PUBLIC_API_URL` to Railway URL
   - Set `NEXT_PUBLIC_API_KEY`
   - Deploy

4. **Test everything** works!

---

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **Render Docs**: https://render.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **FastAPI Deployment**: https://fastapi.tiangolo.com/deployment/

---

**Your system is ready for production deployment! 🚀**

Choose Option 1 (Vercel + Railway) for the easiest deployment experience.
