# Deployment Guide for VisitTours

This guide outlines the steps to deploy the VisitTours application. The application consists of a React frontend (Client) and a Node.js/Express backend (Server) with a MySQL database.

## Prerequisites

-   **GitHub Account**: For version control and connecting to deployment services.
-   **Cloud Hosting Accounts**:
    -   **Frontend**: [Vercel](https://vercel.com/) (Recommended) or Netlify.
    -   **Backend**: [Render](https://render.com/), [Railway](https://railway.app/), or [Heroku](https://www.heroku.com/).
    -   **Database**: A MySQL database (can be hosted on Render/Railway or a dedicated provider like PlanetScale or Aiven).

---

## 1. Database Deployment

Before deploying the code, you need a live MySQL database.

1.  **Create a MySQL Database**:
    -   If using **Railway** or **Render**, you can add a MySQL service directly from their dashboard.
    -   Note down the **Connection URL** (e.g., `mysql://user:password@host:port/database_name`).

2.  **Environment Variables**:
    -   You will need the following details for the backend configuration:
        -   `DB_HOST`
        -   `DB_USER`
        -   `DB_PASS`
        -   `DB_NAME`

---

## 2. Backend (Server) Deployment

We will deploy the Node.js server.

### Option A: Deploying to Render (Recommended)

1.  **Push your code to GitHub**.
2.  **Create a new Web Service** on Render.
3.  **Connect your GitHub repository**.
4.  **Settings**:
    -   **Root Directory**: `server`
    -   **Build Command**: `npm install`
    -   **Start Command**: `npm start`
5.  **Environment Variables**:
    -   Add the following variables in the Render dashboard:
        -   `DB_HOST`: Your database host.
        -   `DB_USER`: Your database user.
        -   `DB_PASS`: Your database password.
        -   `DB_NAME`: Your database name.
        -   `JWT_SECRET`: A strong secret key for authentication.
        -   `CLIENT_URL`: The URL of your deployed frontend (you will get this in Step 3, e.g., `https://visittours.vercel.app`). For now, you can set it to `*` or update it later.
        -   `PORT`: `5000` (or let Render assign one).

### Option B: Deploying to Railway

1.  **New Project** -> **Deploy from GitHub Repo**.
2.  **Root Directory**: `server`.
3.  **Variables**: Add the same variables as above.

---

## 3. Frontend (Client) Deployment

We will deploy the React Vite app.

### Deploying to Vercel

1.  **Push your code to GitHub** (if not already done).
2.  **Go to Vercel** and **Add New Project**.
3.  **Import your repository**.
4.  **Project Configuration**:
    -   **Framework Preset**: Vite
    -   **Root Directory**: `client`
5.  **Environment Variables**:
    -   `VITE_API_URL`: The URL of your deployed backend (from Step 2, e.g., `https://visittours-backend.onrender.com`). **Important**: Do not add a trailing slash.
6.  **Deploy**.

### Handling Client-Side Routing

To ensure refreshing pages works (SPA routing), a `vercel.json` file is recommended in the `client` directory.

**Create `client/vercel.json`:**
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

---

## 4. Final Configuration

1.  **Update Backend CORS**:
    -   Once the frontend is live, go back to your Backend settings (Render/Railway).
    -   Update the `CLIENT_URL` environment variable to your actual frontend URL (e.g., `https://your-project.vercel.app`).
    -   Redeploy the backend if necessary.

2.  **Verify**:
    -   Open your frontend URL.
    -   Try logging in, booking a reel, and accessing the admin dashboard.

## Troubleshooting

-   **Database Connection Errors**: Double-check your `DB_` environment variables. Ensure the database allows external connections if hosted separately.
-   **CORS Errors**: Check the `CLIENT_URL` on the backend matches the frontend URL exactly.
-   **404 on Refresh**: Ensure `vercel.json` exists in the `client` folder.
