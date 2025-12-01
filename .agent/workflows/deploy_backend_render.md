---
description: How to deploy the Node.js backend to Render.com with PostgreSQL
---

# Deploying Backend to Render

This workflow guides you through deploying your Node.js/Express backend to Render, connecting it to a managed PostgreSQL database.

## Prerequisites
- A [Render.com](https://render.com) account.
- Your code pushed to a GitHub repository.

## Step 1: Push Latest Changes
Ensure you have committed and pushed the latest changes, specifically the installation of `pg` and the update to `server/config/db.js`.

```bash
git add .
git commit -m "Setup production database config"
git push origin main
```

## Step 2: Create a PostgreSQL Database
1. Log in to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** and select **PostgreSQL**.
3. **Name**: `visittour-db` (or any name you prefer).
4. **Region**: Choose the one closest to you (e.g., Frankfurt or Ohio).
5. **Plan**: Select **Free** (for hobby projects) or a paid plan.
6. Click **Create Database**.
7. Once created, look for the **Internal Database URL** in the connections section. **Copy this URL**.

## Step 3: Create the Web Service
1. On the Render Dashboard, click **New +** and select **Web Service**.
2. Connect your GitHub repository (`nep-a/VisitTour`).
3. **Name**: `visittour-backend`.
4. **Region**: Same as your database.
5. **Branch**: `main`.
6. **Root Directory**: `server` (Important: your backend code is in the server folder).
7. **Runtime**: `Node`.
8. **Build Command**: `npm install`
9. **Start Command**: `node index.js`
10. **Plan**: Free or paid.

## Step 4: Configure Environment Variables
Scroll down to the **Environment Variables** section and add the following:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | *(Paste the Internal Database URL you copied earlier)* |
| `JWT_SECRET` | `supersecretkey123` (Or generate a strong random string) |
| `EMAIL_USER` | `ZuruSasa@gmail.com` |
| `EMAIL_PASS` | *(Your App Password)* |
| `CLIENT_URL` | `https://visittour.onrender.com` (Your frontend URL) |
| `NODE_VERSION` | `20.11.0` (Optional, ensures consistent node version) |

*Note: You do NOT need `DB_HOST`, `DB_USER`, `DB_PASS`, or `DB_NAME` if you use `DATABASE_URL`.*

## Step 5: Deploy
1. Click **Create Web Service**.
2. Render will start building your app.
3. Watch the logs. You should see "Database synced" if the connection is successful.

## Troubleshooting
- **Connection Refused**: Ensure `DATABASE_URL` is correct and you are using the **Internal** URL for communication within Render.
- **Build Failed**: Check if `Root Directory` is set to `server`.
