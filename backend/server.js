require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const passport = require('./config/passport');
const connectDB = require('./config/db');

// Routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const habitRoutes = require('./routes/habit.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const goalRoutes = require('./routes/goal.routes');
const journalRoutes = require('./routes/journal.routes');
const adminRoutes = require('./routes/admin.routes');
const aiRoutes = require('./routes/ai.routes');
const socialRoutes = require('./routes/social.routes');
const paymentRoutes      = require('./routes/payment.routes');
const notificationRoutes  = require('./routes/notification.routes');

const app = express();

// Trust reverse proxy (Render, Vercel, etc.) to get correct client IP for rate limiting
app.set('trust proxy', 1);

// Connect Database
connectDB();

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman, etc.)
    if (!origin) return callback(null, true);
    // Allow any onrender.com subdomain (backend hosting)
    if (origin.endsWith('.onrender.com')) return callback(null, true);
    // Allow Vercel deployments
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    // Allow Netlify deployments
    if (origin.endsWith('.netlify.app')) return callback(null, true);
    // Allow configured origins from .env
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Auth rate limiter (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts, please try again in 15 minutes.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Sanitize against NoSQL injection
app.use(mongoSanitize());

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Passport
app.use(passport.initialize());

// Health check
app.get('/health', (req, res) => {
  const mongoose = require('mongoose');
  const dbStatus = mongoose.connection.readyState;
  const dbStates = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    database: dbStates[dbStatus] || 'unknown',
    uptime: Math.floor(process.uptime()) + 's',
    memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
    version: '2.0.0',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/journals', journalRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/payments',       paymentRoutes);
app.use('/api/notifications',  notificationRoutes);

// 404 handler
app.all('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid ID format' });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ success: false, message: `${field} already exists` });
  }
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: messages.join(', ') });
  }
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired' });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`💚 Health check: http://localhost:${PORT}/health\n`);
});

module.exports = app;
