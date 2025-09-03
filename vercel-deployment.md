# Vercel Deployment Instructions

## Overview
This document provides instructions for deploying the restructured DropDetect project to Vercel. The project has been restructured to have all files at the root level instead of in a frontend/ subdirectory.

## Prerequisites
- A Vercel account
- Git repository with the restructured project

## Deployment Steps

1. **Push your changes to your Git repository**
   - Follow the instructions in `git-commands.md` to commit and push your changes

2. **Connect your repository to Vercel**
   - Log in to your Vercel account
   - Click "Add New" > "Project"
   - Select your Git repository

3. **Configure project settings**
   - Vercel should automatically detect the Next.js project
   - The `vercel.json` file has been updated to work with the new structure
   - No need to specify a root directory as all files are now at the root level

4. **Environment Variables**
   - Add all environment variables from your `.env` file to the Vercel project settings
   - Make sure to include:
     - `DATABASE_URL`
     - Supabase credentials
     - Admin credentials
     - Cron secrets
     - `NEXT_PUBLIC_APP_URL`

5. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your application

6. **Verify Deployment**
   - Once deployment is complete, visit your Vercel URL to verify the application is working correctly
   - Check that the cron job for `/api/cron/fetch-drops` is properly configured

## Troubleshooting

- If you encounter build errors, check the Vercel build logs
- Ensure all environment variables are correctly set
- Verify that the database connection is working properly