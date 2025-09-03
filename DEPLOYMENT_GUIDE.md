# DropDetect - Complete Deployment Guide

This guide will walk you through deploying DropDetect with automated airdrop data fetching to Vercel and Supabase.

## 🚀 Quick Start

### Prerequisites
- GitHub account
- Vercel account
- Supabase account
- Node.js 18+ installed locally

## 📋 Step-by-Step Deployment

### 1. Database Setup (Supabase)

#### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose a region close to your users
3. Set a strong database password
4. Wait for the project to be ready (2-3 minutes)

#### 1.2 Get Database Connection String
1. Go to **Settings** → **Database**
2. Copy the **Connection string** (URI format)
3. Replace `[YOUR-PASSWORD]` with your database password
4. Save this as `DATABASE_URL` for later use

#### 1.3 Apply Database Schema
1. Install dependencies locally:
   ```bash
   npm install
   ```

2. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

3. Run database migrations:
   ```bash
   npx prisma migrate deploy
   ```

4. Seed the database with initial data:
   ```bash
   npm run db:seed
   ```

### 2. GitHub Repository Setup

#### 2.1 Push Code to GitHub
1. Create a new repository on GitHub
2. Push your DropDetect code:
   ```bash
   git init
   git add .
   git commit -m "Initial DropDetect deployment"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/dropdetect.git
   git push -u origin main
   ```

### 3. Vercel Deployment

#### 3.1 Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **New Project**
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings

#### 3.2 Configure Environment Variables
In Vercel dashboard, go to **Settings** → **Environment Variables** and add:

```bash
# Database
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Admin User (optional)
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your-secure-password

# GitHub API (for airdrop data fetching)
GITHUB_TOKEN=ghp_your_github_token_here

# Twitter API (optional, for Twitter crawling)
TWITTER_BEARER_TOKEN=your_twitter_bearer_token

# Cron Security
CRON_SECRET=your-random-secret-string-here

# Next.js
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

#### 3.3 Deploy
1. Click **Deploy** in Vercel
2. Wait for deployment to complete (2-3 minutes)
3. Your app will be available at `https://your-app.vercel.app`

### 4. Configure Automated Data Fetching

#### 4.1 Set Up Vercel Cron Job
The cron job is already configured in `vercel.json` to run daily at midnight UTC:

```json
{
  "crons": [
    {
      "path": "/api/cron/fetch-drops",
      "schedule": "0 0 * * *"
    }
  ]
}
```

#### 4.2 Test Cron Job
1. Go to your Vercel dashboard
2. Navigate to **Functions** → **Cron Jobs**
3. You should see the `fetch-drops` cron job
4. Click **Test** to run it manually

### 5. API Keys Setup (Optional but Recommended)

#### 5.1 GitHub Token
1. Go to GitHub → **Settings** → **Developer settings** → **Personal access tokens**
2. Generate new token with `repo` and `public_repo` scopes
3. Add to Vercel environment variables as `GITHUB_TOKEN`

#### 5.2 Twitter Bearer Token (Optional)
1. Go to [developer.twitter.com](https://developer.twitter.com)
2. Create a new app
3. Get the Bearer Token
4. Add to Vercel environment variables as `TWITTER_BEARER_TOKEN`

## 🔧 Configuration Files

### Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | Supabase PostgreSQL connection string |
| `CRON_SECRET` | ✅ | Secret for securing cron endpoints |
| `GITHUB_TOKEN` | ⚠️ | GitHub API token for repository access |
| `TWITTER_BEARER_TOKEN` | ⚠️ | Twitter API token for social crawling |
| `ADMIN_EMAIL` | ⚠️ | Admin user email (defaults to admin@example.com) |
| `ADMIN_PASSWORD` | ⚠️ | Admin user password (defaults to change-this-password) |
| `NEXT_PUBLIC_APP_URL` | ⚠️ | Your app's public URL |

### Vercel Configuration (`vercel.json`)
```json
{
  "buildCommand": "npm install && npm run build",
  "installCommand": "npm install",
  "outputDirectory": ".next",
  "crons": [
    {
      "path": "/api/cron/fetch-drops",
      "schedule": "0 0 * * *"
    }
  ]
}
```

## 📊 Data Sources

The system automatically fetches airdrop data from:

1. **GitHub Repositories**
   - `airdrops-fyi/registry`
   - `degen-vc/airdrop-checkers`

2. **Airdrop Aggregators**
   - AirdropAlert API
   - CoinAirdrops API
   - AirdropBob API

3. **Social Media**
   - Twitter accounts (@AirdropAlert, @DeFiPulse, @CoinDesk)

4. **Community Sources**
   - DeFiLlama airdrops page
   - CoinGecko airdrops section

## 🎯 Features

### Automated Data Fetching
- **Daily cron job** runs at midnight UTC
- **Multi-source aggregation** from GitHub, APIs, and web scraping
- **Automatic status updates** based on claim dates
- **Data cleanup** removes old entries after 30 days

### Real-time Features
- **Live feed** of recent airdrop claims
- **Dynamic search** with wallet address checking
- **Responsive design** works on all devices
- **Dark/light mode** support

### Admin Features
- **Admin dashboard** at `/admin`
- **Data source management**
- **Fetch log monitoring**
- **Manual data import**

## 🔍 Monitoring & Maintenance

### Check Data Fetching Status
1. Go to your app's `/admin` page
2. Check **Fetch Logs** for recent activity
3. Verify **Sources** are active and working

### Monitor Cron Jobs
1. Vercel dashboard → **Functions** → **Cron Jobs**
2. Check execution logs for errors
3. Verify daily runs are successful

### Database Maintenance
- **Automatic cleanup** removes old data after 30 days
- **Manual cleanup** can be done via Supabase dashboard
- **Backup** is handled automatically by Supabase

## 🚨 Troubleshooting

### Common Issues

#### 1. Database Connection Failed
- Verify `DATABASE_URL` is correct
- Check Supabase project is active
- Ensure database password is correct

#### 2. Cron Job Not Running
- Check Vercel cron job configuration
- Verify `CRON_SECRET` environment variable
- Check function logs in Vercel dashboard

#### 3. No Airdrop Data
- Verify API keys are set correctly
- Check fetch logs in admin dashboard
- Ensure data sources are accessible

#### 4. Build Failures
- Check all environment variables are set
- Verify Prisma schema is up to date
- Check for TypeScript errors

### Getting Help
1. Check Vercel function logs
2. Review Supabase database logs
3. Check GitHub repository issues
4. Contact support if needed

## 📈 Scaling & Optimization

### Performance Tips
- **Enable Vercel Analytics** for usage insights
- **Use Supabase connection pooling** for high traffic
- **Implement caching** for frequently accessed data
- **Monitor API rate limits** for external services

### Cost Optimization
- **Supabase free tier** includes 500MB database and 2GB bandwidth
- **Vercel free tier** includes 100GB bandwidth and 100 serverless functions
- **Monitor usage** in both platforms' dashboards

## 🔐 Security

### Best Practices
- **Use strong passwords** for admin accounts
- **Rotate API keys** regularly
- **Enable 2FA** on all accounts
- **Monitor access logs** regularly

### Environment Security
- **Never commit** `.env` files to Git
- **Use Vercel environment variables** for secrets
- **Restrict API key permissions** to minimum required

## 🎉 Success!

Your DropDetect application is now fully deployed with:
- ✅ **Automated airdrop data fetching** from multiple sources
- ✅ **Real-time updates** via daily cron jobs
- ✅ **Professional UI** with green branding
- ✅ **Responsive design** for all devices
- ✅ **Admin dashboard** for monitoring
- ✅ **Scalable architecture** on Vercel + Supabase

The system will automatically:
- Fetch new airdrop data daily
- Update drop statuses based on dates
- Clean up old data
- Provide real-time feed updates

Your users can now search for airdrops, check eligibility, and stay updated with the latest opportunities!

---

**Need help?** Check the troubleshooting section or create an issue in the GitHub repository.
