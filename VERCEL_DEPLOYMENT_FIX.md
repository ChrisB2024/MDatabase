# Vercel Deployment Configuration Guide

## 🎯 Overview
This guide helps you configure your deployed application correctly so the frontend can communicate with the backend.

---

## ✅ Step 1: Configure Railway Backend Environment Variables

Go to your Railway project settings and update the `ALLOWED_ORIGINS` variable:

```bash
# Current (localhost only)
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# Updated (add your Vercel domain)
ALLOWED_ORIGINS=http://localhost:3000,https://your-app-name.vercel.app,https://your-custom-domain.com
```

### How to Update:
1. Go to [railway.app](https://railway.app)
2. Select your MDatabase project
3. Click on your backend service
4. Go to **Variables** tab
5. Edit `ALLOWED_ORIGINS`
6. Add your Vercel URL (e.g., `https://mdatabase.vercel.app`)
7. Click **Save** (Railway will auto-redeploy)

### Complete Railway Environment Variables:
```bash
DATABASE_URL=postgresql://postgres:@conQuest7503$@db.yvwzaurkkryibinrcktz.supabase.co:5432/postgres
API_KEY=a8HHKtdn5tJLE3D9K9l5Tj_Z2OjCuO4TsAxicmhkjBQ
ALLOWED_ORIGINS=http://localhost:3000,https://your-vercel-app.vercel.app
DEBUG=False
API_HOST=0.0.0.0
API_PORT=8000
```

---

## ✅ Step 2: Configure Vercel Frontend Environment Variables

Your Vercel frontend needs these environment variables:

### Required Variables:
```bash
NEXT_PUBLIC_API_URL=https://mdatabase-production.up.railway.app/api/v1
NEXT_PUBLIC_API_KEY=a8HHKtdn5tJLE3D9K9l5Tj_Z2OjCuO4TsAxicmhkjBQ
```

### How to Add in Vercel:
1. Go to [vercel.com](https://vercel.com)
2. Select your MDatabase project
3. Go to **Settings** → **Environment Variables**
4. Add both variables:
   - **Name:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://mdatabase-production.up.railway.app/api/v1`
   - Click **Add**
   
   - **Name:** `NEXT_PUBLIC_API_KEY`
   - **Value:** `a8HHKtdn5tJLE3D9K9l5Tj_Z2OjCuO4TsAxicmhkjBQ`
   - Click **Add**

5. Go to **Deployments** tab
6. Click **...** on latest deployment → **Redeploy**
7. Select **Use existing build cache** → **Redeploy**

---

## ✅ Step 3: Verify Backend is Working

Open your Railway backend URL in browser:

```
https://mdatabase-production.up.railway.app/docs
```

You should see the FastAPI Swagger documentation. If this loads, your backend is healthy ✅

### Test API Health:
```bash
curl https://mdatabase-production.up.railway.app/health
```

Expected response:
```json
{"status": "healthy"}
```

### Test API with Authentication:
```bash
curl -H "X-API-Key: a8HHKtdn5tJLE3D9K9l5Tj_Z2OjCuO4TsAxicmhkjBQ" \
  https://mdatabase-production.up.railway.app/api/v1/employees/
```

---

## ✅ Step 4: Test Frontend Connection

After redeploying Vercel with environment variables:

1. Open your Vercel app: `https://your-app.vercel.app`
2. Open browser DevTools (F12)
3. Go to **Console** tab
4. Look for errors like:
   - ❌ `CORS policy: No 'Access-Control-Allow-Origin'` → Update Railway ALLOWED_ORIGINS
   - ❌ `401 Unauthorized` → Check API key is set in Vercel
   - ❌ `Network Error` → Check backend URL is correct

5. Go to **Network** tab
6. Refresh the page
7. Look for API calls to `/api/v1/employees/` or `/api/v1/pay-runs/`
8. Click on the request → Check:
   - **Request URL:** Should point to Railway backend
   - **Request Headers:** Should include `X-API-Key`
   - **Response Status:** Should be `200 OK`

---

## 🔍 Troubleshooting Common Issues

### Issue 1: Empty Table / No Data Loading
**Symptom:** Frontend loads but shows "No employees found"

**Causes:**
- Missing `NEXT_PUBLIC_API_URL` in Vercel
- Missing `NEXT_PUBLIC_API_KEY` in Vercel
- CORS blocking requests

**Fix:**
1. Verify environment variables in Vercel (Step 2)
2. Redeploy Vercel
3. Check browser console for errors

---

### Issue 2: CORS Error
**Symptom:** Console shows "blocked by CORS policy"

**Fix:**
1. Update Railway `ALLOWED_ORIGINS` to include your Vercel URL
2. Railway will auto-redeploy
3. Wait 2-3 minutes for deployment
4. Refresh your Vercel app

---

### Issue 3: 401 Unauthorized
**Symptom:** API returns 401 errors

**Fix:**
1. Verify `NEXT_PUBLIC_API_KEY` matches Railway's `API_KEY`
2. Both should be: `a8HHKtdn5tJLE3D9K9l5Tj_Z2OjCuO4TsAxicmhkjBQ`
3. Redeploy Vercel after updating

---

### Issue 4: Backend Not Responding
**Symptom:** 502 Bad Gateway or timeout errors

**Check:**
1. Railway backend is running (check Railway dashboard)
2. Database connection is working
3. Railway logs for errors

**Fix:**
1. Go to Railway dashboard
2. Check deployment logs
3. Look for errors like:
   - Database connection failed
   - Missing dependencies
   - Port binding issues

---

## 📋 Quick Verification Checklist

- [ ] Railway backend is deployed and running
- [ ] Backend `/docs` endpoint loads in browser
- [ ] Railway has correct `DATABASE_URL` (direct connection, not session pooler)
- [ ] Railway has correct `API_KEY`
- [ ] Railway has `ALLOWED_ORIGINS` including Vercel URL
- [ ] Vercel has `NEXT_PUBLIC_API_URL` set
- [ ] Vercel has `NEXT_PUBLIC_API_KEY` set
- [ ] Vercel has been redeployed after adding env vars
- [ ] Browser console shows no CORS errors
- [ ] Browser network tab shows successful API calls
- [ ] Data appears in the frontend tables

---

## 🎯 Expected URLs

Replace these with your actual URLs:

| Service | URL |
|---------|-----|
| Railway Backend | `https://mdatabase-production.up.railway.app` |
| Railway API Docs | `https://mdatabase-production.up.railway.app/docs` |
| Railway Health Check | `https://mdatabase-production.up.railway.app/health` |
| Vercel Frontend | `https://your-app.vercel.app` |
| GitHub Repo | `https://github.com/ChrisB2024/MDatabase` |

---

## 🔐 Security Notes

1. **API Key** is currently in code for simplicity
2. For production, consider:
   - Rotating the API key regularly
   - Using environment-specific keys
   - Implementing OAuth2 or JWT tokens
   - Rate limiting API requests

3. **Database Password** should only be in Railway environment variables, never in code

---

## 📞 Need Help?

If you're still having issues:

1. Check Railway logs:
   - Railway Dashboard → Your Service → Logs

2. Check Vercel logs:
   - Vercel Dashboard → Your Project → Deployments → View Function Logs

3. Check browser console:
   - F12 → Console tab → Look for red errors

4. Check browser network:
   - F12 → Network tab → Filter by XHR → Look for failed requests

---

## ✅ Success Criteria

Your deployment is successful when:

1. ✅ Backend `/docs` loads without errors
2. ✅ Frontend loads without console errors
3. ✅ Employee table shows data (or "No employees" if database is empty)
4. ✅ API calls in Network tab show 200 status
5. ✅ No CORS errors in console
6. ✅ You can navigate between pages
7. ✅ Create/Edit/Delete operations work

---

**Last Updated:** December 1, 2025  
**Version:** 1.0.0  
**Repository:** https://github.com/ChrisB2024/MDatabase
