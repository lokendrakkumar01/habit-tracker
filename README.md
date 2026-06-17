# 🎯 HabitFlow – Enterprise MERN Habit Tracker

A production-ready, full-stack Habit Tracker SaaS application built with React.js, Node.js, Express.js, and MongoDB Atlas.

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js + Vite, Tailwind CSS, Redux Toolkit, Framer Motion, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose ODM) |
| Auth | JWT + Google OAuth + bcrypt |
| Email | Nodemailer |
| Payments | Stripe |

## 📁 Project Structure

```
habit-tracker/
├── backend/          # Node.js + Express API (port 5000)
└── frontend/         # React.js App (port 5173)
```

## ⚡ Quick Start

### 1. Backend Setup
```bash
cd backend
npm install
# Edit .env with your credentials
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Environment Variables

**Backend `.env`** (already configured with your MongoDB):
```
MONGODB_URI=mongodb+srv://lokendrakuma9568_db_user:LKkDBoCNk1sx1o38@cluster0.jaox61c.mongodb.net/habit_tracker
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
STRIPE_SECRET_KEY=sk_test_...
```

**Frontend `.env`**:
```
VITE_API_URL=http://localhost:5000/api
```

## 🌟 Features

- ✅ JWT + Google OAuth Authentication
- ✅ Email Verification & Password Reset
- ✅ Habit CRUD with Categories, Priority, Icons, Colors
- ✅ Flexible Scheduling (Daily/Weekly/Monthly/Custom)
- ✅ One-Click Habit Completion
- ✅ Automatic Streak Tracking
- ✅ Advanced Analytics (Weekly/Monthly/Yearly Charts)
- ✅ Calendar Heatmap View
- ✅ Goal Management with Milestones
- ✅ Daily Reflection Journal + Mood Tracking
- ✅ Gamification (XP, Levels, Badges, Achievements)
- ✅ Social Features (Leaderboard, Friends)
- ✅ Premium Subscription (Stripe)
- ✅ Admin Dashboard
- ✅ Dark/Light Mode
- ✅ PWA Support
- ✅ Rate Limiting & Security Middleware

## 🔐 Security

- bcrypt password hashing (12 rounds)
- JWT with refresh tokens
- Rate limiting (100 req/15min)
- NoSQL injection prevention
- XSS protection
- CORS whitelist
- Helmet HTTP headers

## 📊 API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
GET    /api/auth/verify-email
GET    /api/auth/google

GET    /api/habits
POST   /api/habits
GET    /api/habits/:id
PUT    /api/habits/:id
DELETE /api/habits/:id
PUT    /api/habits/:id/archive
PUT    /api/habits/:id/restore
POST   /api/habits/:id/complete

GET    /api/analytics/dashboard
GET    /api/analytics/weekly
GET    /api/analytics/monthly
GET    /api/analytics/yearly
GET    /api/analytics/habits

GET    /api/goals
POST   /api/goals
PUT    /api/goals/:id
DELETE /api/goals/:id
POST   /api/goals/:id/milestones
PUT    /api/goals/:goalId/milestones/:milestoneId/toggle

GET    /api/journals
POST   /api/journals
GET    /api/journals/mood-history

GET    /api/users/profile
PUT    /api/users/profile
GET    /api/users/leaderboard
GET    /api/users/search

GET    /api/admin/stats
GET    /api/admin/users
```

## 🚀 Deployment

- **Frontend**: Deploy `/frontend` to Vercel
- **Backend**: Deploy `/backend` to Render
- **Database**: MongoDB Atlas (already configured)

## 📝 License
MIT
