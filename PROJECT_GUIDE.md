# Cricket Tournament Scoreboard Panel - Complete Guide

## 🎯 Project Overview
A full-stack cricket tournament management system with separate admin and user interfaces. Built with Next.js 15 (JavaScript) and Express.js + MongoDB.

---

## 🚀 Quick Start

### Backend Setup
```bash
cd backend
npm install
npm run dev
```
Backend runs on: `http://localhost:5000`

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on: `http://localhost:3000`

---

## 🏗️ Project Structure

### Tournament Format
- **8 Teams**: Split into Group A (4 teams) and Group B (4 teams)
- **64 Players**: 8 players per team
- **2 Grounds**: Group A and Group B matches run simultaneously
- **Stages**: Group Stage (round-robin, 3 matches per team) → Semi Finals → Final

---

## 🎨 Design Theme
Colors extracted from `frontend/public/logo.jpeg`:
- **Dark Navy**: #00061C, #000D27, #0A1628
- **Gold**: #F3C570, #F8DB7D, #D4A843
- **Sky Blue**: #A1BDCB
- **Live Pink**: #F9A2B2

---

## 🔐 Authentication Flow

### User Flow
1. Landing Page (`/`) → Sign Up (`/register`)
2. Login (`/login`) → User Dashboard (`/dashboard`)
3. View live scores, standings, match details

### Admin Flow
1. Admin Login (`/admin/login`) - Separate from user login
2. Admin Dashboard (`/admin`)
3. Manage teams, players, schedule, and live scoring

### Default Admin Credentials
```
Email: admin@cricket.com
Password: admin123
```

Create admin using: `node backend/scripts/createAdmin.js`

---

## 📱 User Features

### Landing Page (`/`)
- Professional hero section with live badge
- "Join Tournament" and "Watch Live" CTAs
- Tournament stats: 8 Teams, 64 Players, 2 Grounds
- Feature cards: Live Scores, Standings, Tournament Stages
- Auto-redirects logged-in users to appropriate dashboard

### User Dashboard (`/dashboard`)
- **Live Matches**: Real-time score updates (auto-refresh every 10s)
- **Upcoming Fixtures**: Scheduled matches
- **Results**: Completed matches with winners
- **Standings**: Team rankings with wins/losses/points
- Welcome banner with user name
- Live indicator badge when matches are active

---

## 🛠️ Admin Features

### Admin Dashboard (`/admin`)
Navigation cards for all management sections

### Teams Management (`/admin/teams`)
- Add new teams (max 4 per group)
- Assign to Group A or Group B
- Delete teams
- View all teams by group

### Players Management (`/admin/players`)
- Add players to teams (max 8 per team)
- Specify role (Batsman, Bowler, All-Rounder, Wicket-Keeper)
- Delete players
- View all players by team

### Schedule Generator (`/admin/schedule`)
- Auto-generate complete tournament schedule
- Group Stage: Round-robin (each team plays 3 matches)
- Semi Finals: Top 2 from each group
- Final: Winners of semi-finals
- Assigns Ground 1 (Group A) and Ground 2 (Group B)

### Matches Management (`/admin/matches`)
- View all matches (Scheduled, Live, Completed)
- Start live scoring
- Update scores in real-time
- Complete matches

### Live Scoring (`/admin/matches/[id]/score`)
- Quick-add buttons: 0, 1, 2, 3, 4, 6, W (wicket)
- Track runs, wickets, overs
- Real-time updates visible to all users
- Navigate between innings

### Complete Match (`/admin/matches/[id]/complete`)
- Select winning team
- Automatically updates standings
- Awards 2 points to winner
- Marks match as completed

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User/Admin login

### Teams
- `GET /api/teams` - Get all teams
- `POST /api/teams` - Create team (admin only)
- `DELETE /api/teams/:id` - Delete team (admin only)

### Players
- `GET /api/players` - Get all players
- `GET /api/players/team/:teamId` - Get players by team
- `POST /api/players` - Create player (admin only)
- `DELETE /api/players/:id` - Delete player (admin only)

### Matches
- `GET /api/matches` - Get all matches
- `GET /api/matches/:id` - Get match by ID
- `POST /api/matches` - Create match (admin only)
- `POST /api/matches/generate-schedule` - Auto-generate schedule (admin only)
- `PUT /api/matches/:id/start` - Start live match (admin only)
- `PUT /api/matches/:id/score` - Update score (admin only)
- `PUT /api/matches/:id/complete` - Complete match (admin only)

### Standings
- `GET /api/standings` - Get tournament standings

---

## 🗄️ Database Models

### User
- email, password (hashed), name, role (user/admin)

### Team
- name, group (A/B), wins, losses, points

### Player
- name, teamId, role (Batsman/Bowler/All-Rounder/Wicket-Keeper)

### Match
- teamA, teamB, ground (1/2), stage (Group/Semi/Final)
- status (Scheduled/Live/Completed)
- innings (array): runs, wickets, overs
- winner, date

---

## 🎯 Key Features

### Real-Time Updates
- User dashboard auto-refreshes every 10 seconds
- Live badge shows when matches are active
- Instant score updates from admin panel

### Responsive Design
- Mobile-friendly interface
- Tailwind CSS for styling
- Smooth animations and transitions

### Security
- JWT authentication with HTTP-only cookies
- Password hashing with bcryptjs
- Protected routes with middleware
- Role-based access control

### User Experience
- Clean, professional UI matching logo theme
- Intuitive navigation
- Loading states and error handling
- Smooth page transitions

---

## 📦 Dependencies

### Backend
- express - Web framework
- mongoose - MongoDB ODM
- bcryptjs - Password hashing
- jsonwebtoken - JWT authentication
- cors - Cross-origin requests
- dotenv - Environment variables
- nodemon - Development auto-reload

### Frontend
- next - React framework (v15)
- react - UI library
- tailwindcss - Utility-first CSS
- react-compiler - Performance optimization

---

## 🔧 Configuration

### Backend `.env`
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/cricket_scoreboard
JWT_SECRET=your_super_secret_key_here
```

### Frontend `.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 🚦 Workflow

### Setup Tournament
1. Admin logs in → `/admin/login`
2. Add 8 teams (4 in Group A, 4 in Group B) → `/admin/teams`
3. Add 8 players per team → `/admin/players`
4. Generate schedule → `/admin/schedule`

### During Matches
1. Admin starts match → `/admin/matches` → "Start Live"
2. Update scores in real-time → `/admin/matches/[id]/score`
3. Users see live updates on dashboard → `/dashboard`

### After Matches
1. Admin completes match → `/admin/matches/[id]/complete`
2. Select winner → Standings auto-update
3. Users see results and updated standings

---

## 📝 Notes

- MongoDB must be running locally on port 27017
- Admin and user authentication are completely separate
- Group A and Group B matches happen simultaneously on different grounds
- Each team plays 3 matches in group stage (round-robin)
- Top 2 teams from each group advance to semi-finals
- Semi-final winners play in the final

---

## 🎉 Success!

Your cricket tournament scoreboard panel is ready! Users can sign up to watch live matches, and admins can manage the entire tournament from team creation to live scoring.

**GitHub Repository**: https://github.com/sudeep02525/scoreboard_Panel.git
