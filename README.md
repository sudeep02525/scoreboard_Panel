<div align="center">
  <h1>🏏 Cricket Tournament Scoreboard Panel</h1>
  <p>A full-stack, real-time cricket tournament management system with live scoring, team management, and automated scheduling.</p>

  <!-- Badges -->
  <p>
    <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/Express.js-Backend-black?style=for-the-badge&logo=express" alt="Express.js" />
    <img src="https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  </p>

  <!-- Live Deployment Links -->
  <h3>🌐 Live Deployment</h3>
  <p>
    <a href="https://cricketscoreboard-panel.vercel.app" target="_blank">
      <img src="https://img.shields.io/badge/Frontend-Vercel-black?style=for-the-badge&logo=vercel" alt="Frontend on Vercel" />
    </a>
    <a href="https://scoreboard-panel.onrender.com" target="_blank">
      <img src="https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render" alt="Backend on Render" />
    </a>
  </p>
</div>

---

## ✨ Features

### 👨‍💻 For Users
* **Live Scores:** Real-time match updates with auto-refresh (every 10s).
* **Standings:** Dynamic point tables and team rankings based on match outcomes.
* **Responsive UI:** A beautiful, dark-themed dashboard accessible on any device.

### 🛡️ For Admins
* **Tournament Setup:** Add up to 8 teams (Group A & B) and up to 64 players.
* **Auto-Scheduling:** Generate a complete round-robin group stage and knockout schedule with a single click.
* **Live Scoring Panel:** A dedicated interface to instantly add runs (1, 2, 3, 4, 6), wickets, and track overs in real-time.
* **Match Completion:** Finalize matches to automatically award points and update standings.

---

## 🛠️ Tech Stack

* **Frontend:** Next.js 15, React, Tailwind CSS
* **Backend:** Node.js, Express.js
* **Database:** MongoDB, Mongoose
* **Authentication:** JWT (JSON Web Tokens), bcryptjs

---

## 🚀 Getting Started Locally

### 1. Clone the Repository
```bash
git clone https://github.com/sudeep02525/scoreboard_Panel.git
cd scoreboard_Panel
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` folder:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/cricket_scoreboard
JWT_SECRET=your_super_secret_key_here
```
Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```
Create a `.env.local` file in the `frontend` folder:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```
Start the frontend server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

---

## ☁️ Deployment Guide

This project is structured as a **Monorepo**. You can easily deploy the frontend and backend separately from this single repository.

### Deploying the Backend (Render)
1. Go to [Render](https://render.com/) and create a new **Web Service**.
2. Connect this GitHub repository.
3. Set the **Root Directory** to `backend`.
4. Set the build command to `npm install` and start command to `node index.js`.
5. Add your `MONGO_URI` and `JWT_SECRET` environment variables.
6. Deploy and copy the resulting API URL.

### Deploying the Frontend (Vercel)
1. Go to [Vercel](https://vercel.com/) and create a new **Project**.
2. Connect this GitHub repository.
3. Edit the **Root Directory** to be `frontend`.
4. Add an environment variable named `NEXT_PUBLIC_API_URL` and set its value to your new Render API URL (e.g., `https://your-app.onrender.com/api`).
5. Deploy!

---

<!-- ## 🔐 Default Admin Credentials

If you create an admin using the provided script (`node backend/scripts/createAdmin.js`), you can log in at `/admin/login` using:
* **Email:** `admin@cricket.com`
* **Password:** `admin123`

--- -->

<div align="center">
  <i>Designed for modern cricket tournaments.</i>
</div>
