# Git Commands for Project Restructuring

Use these commands to commit the changes made to restructure the project:

```bash
# Add all new files in the root directory
git add .

# Remove the frontend directory from git
git rm -r frontend/

# Commit the changes
git commit -m "Restructure project: Move files from frontend/ to root for Vercel deployment"

# Push to your repository
git push
```

> Note: Make sure to run these commands from the root directory of your project.