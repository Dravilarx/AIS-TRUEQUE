# Railway Deployment Guide for AIS:TRUEQUE Backend

## Quick Deploy

1. Connect your GitHub repository to Railway
2. Railway will auto-detect Node.js and use the `railway.toml` config
3. Set the following environment variables in Railway dashboard:

## Required Environment Variables

```
NODE_ENV=production
PORT=3001

# Firebase Admin SDK
FIREBASE_PROJECT_ID=ais-trueque
FIREBASE_STORAGE_BUCKET=ais-trueque.firebasestorage.app
FIREBASE_SERVICE_ACCOUNT=<paste entire service account JSON>
```

## Getting the Service Account JSON

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project "ais-trueque"
3. Go to **Project Settings** > **Service Accounts**
4. Click **Generate new private key**
5. Copy the entire JSON content
6. Paste as the value for `FIREBASE_SERVICE_ACCOUNT` in Railway

## CORS Configuration

After deploying to Railway, update the CORS config in `src/config/cors.ts`:

```typescript
const allowedOrigins = [
  'http://localhost:5173',
  'https://ais-trueque.vercel.app',
  'https://<your-railway-domain>.railway.app',
];
```

## Health Check

Your API will be available at:
- Health: `https://<your-domain>.railway.app/health`
- API: `https://<your-domain>.railway.app/api`
