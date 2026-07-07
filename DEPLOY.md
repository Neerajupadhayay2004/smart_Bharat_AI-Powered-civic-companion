# Deployment Guide

## Backend Deployment on Render

1. Push your code to GitHub/GitLab repository
2. Go to [Render.com](https://render.com) and sign up/log in
3. Click "New +" → "Blueprint"
4. Connect your GitHub/GitLab repo
5. Select the `backend/render.yaml file
6. Deploy!
7. After deployment, copy your Render backend URL (e.g., https://smart-bharat-backend.onrender.com)
8. Go to your Render service settings and set GEMINI_API_KEY in Environment → Environment Variables
9. Also set CORS_ORIGINS to include your Netlify URL (after deploying frontend

## Frontend Deployment on Netlify

1. Push your code to GitHub/GitLab repository
2. Go to [Netlify.com](https://netlify.com) and sign up/log in
3. Click "New site from Git"
4. Connect your repo
5. Set build command to `npm run build`
6. Set publish directory to `dist`
7. Deploy!
8. Copy your Netlify URL
9. Go to Site settings → Environment variables and add VITE_GEMINI_API_KEY
10. Also update src/lib/api-config.ts to use your Render backend URL

## Post Deployment

Update these values:
- Update backend CORS_ORIGINS (add your Netlify URL)
- Update frontend API_BASE_URL (replace with Render URL)
