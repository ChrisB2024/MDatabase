# 🔧 Database Connection Fix - Supabase Direct URI

## Issue: Session Pooler Crashes on Deployment

The session pooler URI (`aws-0-us-west-2.pooler.supabase.com`) can cause connection issues during deployment because it's designed for temporary connections, not long-running server processes.

## ✅ Solution: Use Direct Database URI

### Your New Connection String:
```
postgresql://postgres:[YOUR_PASSWORD]@db.yvwzaurkkryibinrcktz.supabase.co:5432/postgres
```

Replace `[YOUR_PASSWORD]` with your actual Supabase database password.

---

## 📝 How to Update

### Option 1: Update Local Environment File

1. **Edit your local `.env` file**:
   ```bash
   cd /Users/chrisilias/Desktop/MDatabase/backend
   nano .env
   ```

2. **Replace the DATABASE_URL**:
   ```bash
   # OLD (Session Pooler - causes crashes)
   # DATABASE_URL=postgresql://postgres.yvwzaurkkryibinrcktz:password@aws-0-us-west-2.pooler.supabase.com:5432/postgres
   
   # NEW (Direct Connection - stable for production)
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.yvwzaurkkryibinrcktz.supabase.co:5432/postgres
   ```

3. **Replace `YOUR_PASSWORD`** with your actual password (the same one from the pooler URL)

### Option 2: Get Password from Supabase Dashboard

If you don't have your password:

1. Go to https://supabase.com/dashboard
2. Select your project: `yvwzaurkkryibinrcktz`
3. Go to **Settings** → **Database**
4. Under **Connection string**, select **URI** (not Connection pooler)
5. Copy the full URI
6. The password will be shown or you can reset it

---

## 🚀 Update Deployment Environment Variables

### Railway
1. Go to Railway dashboard → Your project
2. Go to **Variables** tab
3. Update `DATABASE_URL`:
   ```
   postgresql://postgres:YOUR_PASSWORD@db.yvwzaurkkryibinrcktz.supabase.co:5432/postgres
   ```
4. Save → Railway will auto-redeploy

### Render
1. Go to Render dashboard → Your service
2. Go to **Environment** tab
3. Edit `DATABASE_URL`:
   ```
   postgresql://postgres:YOUR_PASSWORD@db.yvwzaurkkryibinrcktz.supabase.co:5432/postgres
   ```
4. Save → Render will auto-redeploy

---

## 🔍 Connection String Comparison

### ❌ Session Pooler (OLD - Don't use for production)
```
postgresql://postgres.yvwzaurkkryibinrcktz:password@aws-0-us-west-2.pooler.supabase.com:5432/postgres
```
- **Purpose**: Short-lived connections (serverless functions)
- **Problem**: Not suitable for long-running servers
- **Result**: Connection drops, crashes

### ✅ Direct Connection (NEW - Use for production)
```
postgresql://postgres:password@db.yvwzaurkkryibinrcktz.supabase.co:5432/postgres
```
- **Purpose**: Persistent connections (web servers)
- **Benefit**: Stable, reliable, designed for FastAPI
- **Result**: Works perfectly with Railway/Render

### ✅ Transaction Pooler (Alternative)
```
postgresql://postgres:password@aws-0-us-west-2.pooler.supabase.com:6543/postgres
```
- **Purpose**: Connection pooling for production
- **Note**: Port is `6543` (not `5432`)
- **Benefit**: Better performance under load

---

## 🧪 Test the Connection Locally

After updating your `.env` file:

```bash
cd /Users/chrisilias/Desktop/MDatabase/backend

# Stop the backend if running
# Then restart it
uvicorn app.main:app --reload --port 8000
```

Test API endpoint:
```bash
curl -H "X-API-Key: a8HHKtdn5tJLE3D9K9l5Tj_Z2OjCuO4TsAxicmhkjBQ" http://localhost:8000/api/v1/employees/
```

If you see employee data, the connection is working! ✅

---

## 📤 Push Updated Configuration

If you've updated any documentation or want to commit the new connection info to examples:

```bash
cd /Users/chrisilias/Desktop/MDatabase

# Add this guide
git add DATABASE_CONNECTION_FIX.md

# Commit
git commit -m "docs: Add database connection fix guide - switch from session pooler to direct URI"

# Push to GitHub
git push origin main
```

---

## 🔐 Security Note

**NEVER commit your actual password to Git!**

The `.env` file is already in `.gitignore`, so your password is safe. When deploying:
- Set environment variables directly in Railway/Render dashboard
- Never hardcode passwords in code files
- Use environment variables for all sensitive data

---

## 📊 Connection Options Summary

| Type | Host | Port | Use Case |
|------|------|------|----------|
| **Direct** ✅ | `db.yvwzaurkkryibinrcktz.supabase.co` | 5432 | Web servers (Railway, Render) |
| **Transaction Pooler** ✅ | `aws-0-us-west-2.pooler.supabase.com` | 6543 | Production with pooling |
| **Session Pooler** ❌ | `aws-0-us-west-2.pooler.supabase.com` | 5432 | Serverless only (not FastAPI) |

---

## ✅ Checklist

- [ ] Get your Supabase database password
- [ ] Update local `backend/.env` with direct connection URI
- [ ] Test locally (restart backend, test API)
- [ ] Update Railway environment variables
- [ ] Wait for auto-redeploy on Railway
- [ ] Test deployed backend
- [ ] Update Vercel if frontend needs backend URL update
- [ ] Verify everything works in production

---

## 🆘 Troubleshooting

### "Connection refused" error
- Check that password is correct
- Verify host is `db.yvwzaurkkryibinrcktz.supabase.co` (not pooler)
- Confirm port is `5432`

### "Authentication failed" error
- Reset password in Supabase dashboard
- Update environment variable with new password
- Redeploy

### "Too many connections" error
- Switch to Transaction Pooler (port 6543)
- Or upgrade Supabase plan

---

## 📞 Need Your Password?

1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select project: `yvwzaurkkryibinrcktz`
3. Settings → Database → Connection string
4. Click "Show password" or reset it

---

**Once updated, your deployment will be stable! 🎉**
