# Vercel Deployment Guide

## 1. Backend Deployment

Your backend is configured as a Serverless Function.

1. Create a new project in Vercel.
2. Select the `AIS-TRUEQUE` repo.
3. Root Directory: `backend`
4. Framework Preset: `Other` (or checks defaults)
5. **Environment Variables**:
   - `FIREBASE_PROJECT_ID`: `ais-trueque`
   - `FIREBASE_STORAGE_BUCKET`: `ais-trueque.firebasestorage.app`
   - `FIREBASE_SERVICE_ACCOUNT`: Copy the full content of your `firebase-service-account.json` (minify it to one line if possible).
   - `NODE_ENV`: `production`

Once deployed, copy the **Deployment URL** (e.g., `https://ais-trueque-backend.vercel.app`).

## 2. Frontend Deployment

1. Create *another* new project in Vercel.
2. Select the *same* `AIS-TRUEQUE` repo.
3. Root Directory: `frontend`
4. Framework Preset: `Vite`
5. **Environment Variables**:
   - `VITE_API_URL`: `https://<YOUR-BACKEND-URL>.vercel.app/api` (Paste the URL from step 1 and add `/api`)
   - All your `VITE_FIREBASE_...` variables.

## 3. Verify

Since the frontend now points to the Vercel Backend URL, and the Backend allows CORS from `.vercel.app`, everything should work without Railway.
