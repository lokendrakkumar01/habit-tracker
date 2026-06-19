# 🎯 HabitFlow – Staff-Level MERN SaaS Habit Tracker Architecture

Welcome to the ultimate technical architecture guide for **HabitFlow**. This document is designed to provide an exhaustive, production-grade explanation of the entire codebase. Use this guide to walk your trainer through how the frontend and backend interact, how the database schemas are structured, and how the core logic executes line-by-line.

---

## 🏛️ System Architecture Overview

HabitFlow is structured as a decoupled **MERN (MongoDB, Express, React, Node)** application. Below is the complete data flow diagram showing how a user request flows through the entire system:

```text
┌──────────────────────────────────────────────────────────────────────────────────┐
│                                CLIENT (React.js)                                 │
│                                                                                  │
│  ┌──────────────┐      Dispatches      ┌────────────────┐     Reads State        │
│  │  React Page  ├─────────────────────►│ Redux Actions  ├─────────────────────┐  │
│  └──────▲───────┘                      └───────┬────────┘                     │  │
│         │ Rerenders                            │ Axios Call                   │  │
│  ┌──────┴───────┐                      ┌───────▼────────┐                     │  │
│  │ Redux Store  │◄─────────────────────┤   API Service  │                     │  │
│  └──────────────┘   Updates Store      │   (api.js)     │                     │  │
└────────────────────────────────────────┴───────┬────────┴─────────────────────┼──┘
                                                 │                              │
                                   HTTP Request  │ JWT Bearer                   │
                                   (JSON Payload)│ Cookie Credentials           │
                                                 ▼                              │
┌───────────────────────────────────────────────────────────────────────────────┼──┐
│                             API SERVER (Node/Express)                         │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │                           MIDDLEWARE STACK                              │  │
│  │                                                                         │  │
│  │ 1. CORS / Helmet        2. Rate Limiting      3. JWT Validator          │  │
│  │    (Security Headers)      (DDOS Check)          (auth.middleware.js)   │  │
│  └──────────────────────────────────────────────────┬──────────────────────┘  │
│                                                     │ Passes Req.user         │
│                                                     ▼                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │                             ROUTING SYSTEM                              │  │
│  │                                                                         │  │
│  │    /api/auth           /api/habits         /api/analytics   ...etc      │  │
│  └──────────────────────────────┬──────────────────────────────────────────┘  │
│                                 │ Triggers Controller                         │
│                                 ▼                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │                            CONTROLLER LAYER                             │  │
│  │                                                                         │  │
│  │   - auth.controller.js     - habit.controller.js  - ai.controller.js    │  │
│  └──────────────────────────────┬──────────────────────────────────────────┘  │
│                                 │ Invokes Business Logic                      │
│                                 ▼                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │                             SERVICES LAYER                              │  │
│  │                                                                         │  │
│  │   - streak.service.js      - gamification.service.js                    │  │
│  └──────────────────────────────┬──────────────────────────────────────────┘  │
│                                 │ Database Queries                            │
│                                 ▼                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │                       DATABASE LAYER (MongoDB Atlas)                    │  │
│  │                                                                         │  │
│  │   [User Schema]            [Habit Schema]         [HabitLog Schema]     │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Backend Code Map & Line-by-Line Logic

The backend handles route matching, user sessions, data structures, transactional emails, streak calculations, gamification algorithms, and payments.

### 1. Main Configuration & Entry Points
* **[server.js](file:///c:/Users/loken/Downloads/habit-tracker/backend/server.js)**
  * **Role**: The main process bootstrapper. Sets up the express application, middlewares, and routes.
  * **Key Middlewares Explained**:
    * `helmet()`: Sets secure HTTP headers to prevent Cross-Site Scripting (XSS) and Clickjacking.
    * `cors()`: Configured dynamically to allow requests from the React frontend port (`5173`) while allowing production URLs hosted on Vercel or Render. Enforces `credentials: true` to support HTTP cookies.
    * `rateLimit()`: Limits connections to 100 requests per 15 minutes to block brute-force bots.
    * `mongoSanitize()`: Strips out query operators (like `$gt` or `$ne`) from incoming request bodies to prevent NoSQL injection attacks.
* **[config/db.js](file:///c:/Users/loken/Downloads/habit-tracker/backend/config/db.js)**
  * **Role**: Connects to the database cluster.
  * **How it works**: Uses `mongoose.connect(process.env.MONGODB_URI)` to spin up a connection pool. It listens to errors and logs status outputs to the console.
* **[config/passport.js](file:///c:/Users/loken/Downloads/habit-tracker/backend/config/passport.js)**
  * **Role**: Integrates passport-based social authentication.
  * **How it works**: Uses `GoogleStrategy`. When a user authenticates with Google, Passport receives the `profile` object containing the name, email, and avatar. It searches for an existing user with `googleId` or `email`. If none exists, it creates one with a default verified status, bypassing Nodemailer verification.

### 2. Business Logic Services (`backend/services/`)
These files run calculation rules, decoupled from HTTP routing.
* **[services/gamification.service.js](file:///c:/Users/loken/Downloads/habit-tracker/backend/services/gamification.service.js)**
  * **Role**: Houses the logic governing XP gains, levels, and badges.
  * **How it works**:
    * `calculateXP(streak)`: The formula is `10 + Math.floor(streak * 0.5)`. Completing a habit with a 10-day streak awards 15 XP.
    * `awardXP(user, xpAmount)`: Adds XP to the user model. Then, it calls `user.calculateLevel()`. If the computed level is higher than the previous level, it writes a `Notification` record to the database with `type: 'achievement'` so the user gets an alert banner: `"Level Up! ⚡"`.
    * `unlockAchievement(user, achievementType)`: Checks if the user's `achievements` array already contains this badge. If not, pushes the achievement to the user's document, inserts the corresponding badge emoji (e.g. `🌱`, `🔥`, `🏆`) into the `badges` array, calls `awardXP()` for the achievement bonus, and creates a database notification.
* **[services/streak.service.js](file:///c:/Users/loken/Downloads/habit-tracker/backend/services/streak.service.js)**
  * **Role**: Evaluates and keeps habit streaks active.
  * **How it works**:
    * `updateStreak(habit, completionDate)`: Normalizes dates to midnight. Searches for a completed log from *yesterday*. If found, or if the current streak is 0, the streak increments by 1. If yesterday's log is missing, the streak resets to 1.
    * `recalculateStreak(habit)`: Triggered when a user unchecks a previously completed habit. Query logs the last 200 logs sorted chronologically descending. It loops backwards step-by-step to rebuild the streak length based on consecutive days.
* **[services/email.service.js](file:///c:/Users/loken/Downloads/habit-tracker/backend/services/email.service.js)**
  * **Role**: Transports emails via Nodemailer.
  * **How it works**: Configures a SMTP transporter (`smtp.gmail.com`). Includes formatting templates for `sendVerificationEmail` (containing verification tokens), `sendPasswordResetEmail`, and `sendReminderEmail` (listing missed habits).

---

## 💻 Frontend Code Map & Line-by-Line Core Explanation

The frontend client utilizes React 19, Redux Toolkit, Framer Motion, and Recharts. Here is an in-depth breakdown of how the frontend files operate under the hood.

### 1. The Core Infrastructure

#### 🔹 [main.jsx](file:///c:/Users/loken/Downloads/habit-tracker/frontend/src/main.jsx)
* **Lines 1-15**: Imports `StrictMode`, `createRoot`, the global Redux `Provider`, and the main `App` entry.
* **Execution Flow**: Mounts the application to the `#root` element in `index.html`. It wraps `App` in `<Provider store={store}>` to make Redux state accessible to every child component.

#### 🔹 [App.jsx](file:///c:/Users/loken/Downloads/habit-tracker/frontend/src/App.jsx)
* **Routing & Code Splitting**: Utilizes `lazy()` imports to split pages (e.g. `DashboardPage`, `AnalyticsPage`) into separate JS chunks. These are loaded on-demand via `<Suspense fallback={<PageFallback />}>`, reducing the initial bundle size.
* **Route Guards Logic**:
  * **`ProtectedRoute`**: Subscribes to `state.auth` using `useSelector`. If the application is initializing, it renders a loading screen. If `isAuthenticated` is `false`, it redirects the user to `/login`.
  * **`PublicRoute`**: The inverse of `ProtectedRoute`. If `isAuthenticated` is `true`, it redirects the user to `/dashboard` so they do not see authentication forms again.
* **User Session Restoration**: On initial load, the `AppContent` component triggers `dispatch(fetchMe())` if a JWT exists in `localStorage`. This verifies the token with the backend and retrieves the user profile.

#### 🔹 [services/api.js](file:///c:/Users/loken/Downloads/habit-tracker/frontend/src/services/api.js)
* **Axios Instance Client**: Configured with a default `baseURL` matching `import.meta.env.VITE_API_URL`.
* **Interceptors Setup**:
  * **Request Interceptor**: Scans `localStorage` for a `token`. If found, it injects the authorization header: `config.headers.Authorization = Bearer ${token}` dynamically on every API request.
  * **Response Interceptor**: Intercepts HTTP errors. If a response returns status code `401` or `403` (meaning the token has expired), it removes the invalid token from storage and redirects the user to `/login`.

---

### 2. Redux State Architecture (`frontend/src/features/`)

Redux serves as the single source of truth for the application.

#### 🔹 [features/auth/authSlice.js](file:///c:/Users/loken/Downloads/habit-tracker/frontend/src/features/auth/authSlice.js)
* **Async Thunk: `loginUser`**
  ```javascript
  export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/login', credentials);
      localStorage.setItem('token', res.data.token); // Persist JWT
      return res.data; // payload containing user profile and token
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  });
  ```
* **State Lifecycle (`extraReducers`)**:
  * `loginUser.pending`: Sets `loading = true` to trigger spinner animations.
  * `loginUser.fulfilled`: Sets `isAuthenticated = true`, stores `user` profile info, and saves the JWT `token`.
  * `loginUser.rejected`: Sets `loading = false` and stores the error message to display in UI alerts.

#### 🔹 [features/habits/habitSlice.js](file:///c:/Users/loken/Downloads/habit-tracker/frontend/src/features/habits/habitSlice.js)
* **Async Thunk: `completeHabit`**
  * **How it works**: Sends a POST request to `/habits/:id/complete`. Upon receiving the response, it updates the habit object in the state array.
  * **Global Hooking**: In the fulfilled reducer for `completeHabit`, it updates the user's XP and achievements, keeping their profile stats in sync without reloading the page.

---

### 3. Page Views & Interactive Logic (`frontend/src/pages/`)

#### 🔹 [pages/LandingPage.jsx](file:///c:/Users/loken/Downloads/habit-tracker/frontend/src/pages/LandingPage.jsx)
* **Dynamic Scroll Navbar**:
  * Uses Framer Motion's `useScroll()` and `useTransform()` hooks to track page scroll:
    ```javascript
    const { scrollY } = useScroll();
    const navBg = useTransform(scrollY, [0, 80], ['rgba(10,10,15,0)', 'rgba(10,10,15,0.95)']);
    const navBorder = useTransform(scrollY, [0, 80], ['rgba(255,255,255,0)', 'rgba(255,255,255,0.07)']);
    ```
    This changes the navbar background from transparent to blur-glass as the user scrolls.
* **Animated Counter Component**:
  ```javascript
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !started) setStarted(true);
  });
  ```
  Uses an `IntersectionObserver` to trigger the counting animation when statistics (e.g., "50K+ Active Users") scroll into view.

#### 🔹 [pages/DashboardPage.jsx](file:///c:/Users/loken/Downloads/habit-tracker/frontend/src/pages/DashboardPage.jsx)
* **confetti() Integration**:
  * Import: `import confetti from 'canvas-confetti';`
  * Action: Checked habits call `confetti({ particleCount: 80, spread: 60, origin: { y: 0.8 } })` to celebrate completion.
* **Recharts SVG Render**:
  * Utilizes `<BarChart>` and `<AreaChart>` with custom gradient tags:
    ```xml
    <defs>
      <linearGradient id="gradientColor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
      </linearGradient>
    </defs>
    ```
    This creates modern, glowing charts in both dark and light modes.

#### 🔹 [pages/JournalPage.jsx](file:///c:/Users/loken/Downloads/habit-tracker/frontend/src/pages/JournalPage.jsx)
* **Two-Panel Layout**:
  * Configured as a responsive grid: `grid grid-cols-1 lg:grid-cols-3`.
  * **On Mobile**: Renders as a single column. Clicking an item toggles local view variables, switching between the list of entries and the text editor.
  * **On Desktop**: Displays a split-pane layout (entries list on the left 1/3, rich editor on the right 2/3).

#### 🔹 [pages/ProfilePage.jsx](file:///c:/Users/loken/Downloads/habit-tracker/frontend/src/pages/ProfilePage.jsx)
* **Theme Switching Mechanism**:
  ```javascript
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.className = nextTheme; // Toggles CSS root class
    dispatch(updateProfileSettings({ theme: nextTheme }));
  };
  ```
  Toggling root classes switches active CSS theme variables, updating background, text, and border colors across the application instantly.
* **Responsive Wrap Adjustments**:
  Uses flexbox styling (`flex flex-row flex-wrap gap-2`) to keep Level and Plan badges clean and organized, preventing overlaps on small viewports.

---

## 🔄 Core Workflows & Code Execution Steps

Use these step-by-step flows to explain exactly how data moves through the codebase to your trainer.

### Scenario A: Clicking a Habit Checkbox (Completion Flow)
1. **User Action**: The user clicks the complete checkbox on [DashboardPage.jsx](file:///c:/Users/loken/Downloads/habit-tracker/frontend/src/pages/DashboardPage.jsx).
2. **Action Dispatch**: The component calls `dispatch(completeHabit({ id: habitId, date: today }))` defined in [habitSlice.js](file:///c:/Users/loken/Downloads/habit-tracker/frontend/src/features/habits/habitSlice.js).
3. **HTTP Call**: An Axios POST request is made to `/api/habits/:id/complete` with credentials.
4. **Backend Router**: The route in `habit.routes.js` matches the path and verifies the user's JWT using `protect` middleware.
5. **Backend Controller**: `toggleComplete()` in [habit.controller.js](file:///c:/Users/loken/Downloads/habit-tracker/backend/controllers/habit.controller.js) checks if a `HabitLog` entry already exists for today.
6. **Streak Calculation**: The controller calls `streakService.updateStreak()`. This service queries logs from yesterday; if found, it increments the streak by 1.
7. **Gamification Processing**: The controller calls `gamificationService.awardXP()`. This calculates the earned XP (base 10 + streak bonus) and checks if the user's level has increased.
8. **Real-time Notifications**: If the user levels up, a notification is written to the database.
9. **JSON Response**: The API returns the updated habit, updated user profile, and completion log.
10. **State Update**: Redux updates `habitSlice` and `authSlice` states, triggering a rerender and launching canvas confetti on the dashboard.

### Scenario B: Stripe Billing Upgrade Flow
1. **Checkout Action**: The user clicks "Upgrade to Premium" on [PremiumPage.jsx](file:///c:/Users/loken/Downloads/habit-tracker/frontend/src/pages/PremiumPage.jsx).
2. **Checkout Session Creation**: The app redirects the user to the API endpoint `POST /api/payments/create-checkout-session`.
3. **Stripe Redirection**: The payment controller calls `stripe.checkout.sessions.create` with product metadata, sets the customer ID, and redirects the user to the Stripe Checkout page.
4. **Webhook Event Processing**: Once checkout completes, Stripe sends a secure POST request to `/api/payments/webhook`.
5. **Signature Verification**: `payment.controller.js` verifies the event signature using the webhook secret.
6. **Plan Activation**: On a successful `checkout.session.completed` event, the controller updates the corresponding `User` document in MongoDB: `subscription.plan = 'premium'` and `subscription.status = 'active'`.
7. **Access Granted**: When the user returns to the app, `fetchMe` resolves their upgraded subscription status, unlocking premium features (like custom AI coaching and advanced analytics).

### Scenario C: Daily Reflection Log Flow
1. **Reflections Entry**: The user fills out the mood and gratitude forms in [JournalPage.jsx](file:///c:/Users/loken/Downloads/habit-tracker/frontend/src/pages/JournalPage.jsx) and clicks "Save Entry".
2. **Redux Dispatch**: The component dispatches `saveJournal(journalData)` to [journalSlice.js](file:///c:/Users/loken/Downloads/habit-tracker/frontend/src/features/journal/journalSlice.js).
3. **API Processing**: The request goes to `POST /api/journals`. The controller checks if the user has already submitted an entry for today (returns a `400 Bad Request` if they have, to prevent double submissions).
4. **Data Storage**: The controller saves the new `Journal` record, awards 15 XP to the user, and updates the local state.
5. **Analytics Rendering**: The analytics page fetches mood history data and displays it on a clean area chart using Recharts.

---

## 🛡️ Security Implementation Details

For your trainer, emphasize these security features that keep the application secure:
1. **Password Hashing**: Uses `bcryptjs` with a work factor of 12 rounds to hash passwords before saving them, protecting them even in the event of a database compromise.
2. **Stateless JWT Checks**: Tokens are signed with a strong secret key. We also issue 30-day refresh tokens via HTTP-only cookies, keeping user sessions active securely.
3. **Input Sanitization**: Express validation rules sanitize and normalize email inputs, and Mongo-sanitize strips out malicious query operators.
4. **CORS Protection**: The app restricts API access to allowed origins, blocking cross-origin data access from unauthorized domains.
5. **Rate Limiting**: Limits connections to 100 requests per 15 minutes to prevent DDoS attacks, and limits login attempts to 10 per 15 minutes to protect against brute-force attacks.
