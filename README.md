# ZuruSasa - Tourism Reels Marketplace

A full-stack tourism marketplace based on short video reels.

## Features
- **TikTok-style Feed**: Vertical scrolling video feed of tourism offerings.
- **Booking System**: Book stays, tours, and activities directly from reels.
- **Host Dashboard**: Manage reels and view bookings.
- **Identity Verification**: Automated host identity verification with OCR and fraud detection.
- **Content Moderation**: Automated AI moderation for reel quality and relevance.
- **Expiration System**: Reels automatically expire after 90 days.
- **Search & Filter**: Filter by location, category, and price.

## Tech Stack
- **Frontend**: React, Vite, Vanilla CSS (Premium Design)
- **Backend**: Node.js, Express, Sequelize
- **Database**: MySQL

## Setup Instructions

### 1. Database Setup
Ensure you have MySQL installed and running.
Create the database using the provided schema or let the server auto-create it.
Update `server/.env` with your MySQL credentials if they differ from default (root/empty).

### 2. Server Setup
```bash
cd server
npm install
npm start
```
The server will run on `http://localhost:5000`.
It will automatically sync the database tables on first run.

### 3. Client Setup
```bash
cd client
npm install
npm run dev
```
The client will run on `http://localhost:5173`.

## Usage
1. Register a new account.
2. If you want to upload reels, select "Host" as your role during registration.
3. Hosts can upload video reels (mp4, etc.) via the "Upload" page.
4. Travelers can browse the feed, search, and book offerings.
5. Hosts can view bookings in the Dashboard.

## Cron Job
The server includes a daily cron job that checks for expired reels (older than 90 days) and deactivates them.
