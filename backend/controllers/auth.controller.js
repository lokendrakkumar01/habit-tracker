const User = require('../models/User');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const emailService = require('../services/email.service');
const gamificationService = require('../services/gamification.service');

const isDev = process.env.NODE_ENV !== 'production';

// ── Helper: sign & send token response ───────────────────────────────────────
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.generateJWT();
  const refreshToken = user.generateRefreshToken();

  res.cookie('refreshToken', refreshToken, {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: !isDev,
    sameSite: 'lax',
  });

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.verificationToken;
  delete userObj.resetPasswordToken;

  res.status(statusCode).json({ success: true, token, user: userObj });
};

// @POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const emailConfigured = emailService.isEmailConfigured ? emailService.isEmailConfigured() : false;

    // Auto-verify if email is not configured or in development
    const user = await User.create({
      name,
      email,
      password,
      isVerified: isDev || !emailConfigured,
    });

    if (!isDev && emailConfigured) {
      // Only send verification email in production when email is configured
      const verificationToken = user.generateVerificationToken();
      await user.save({ validateBeforeSave: false });
      const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
      await emailService.sendVerificationEmail(user.email, user.name, verifyUrl);

      return res.status(201).json({
        success: true,
        message: 'Registration successful! Please check your email to verify your account.',
      });
    }

    // Return token/success directly if email verification is skipped
    res.status(201).json({
      success: true,
      message: 'Registration successful! You can now log in.',
    });
  } catch (error) {
    next(error);
  }
};

// @POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const emailConfigured = emailService.isEmailConfigured ? emailService.isEmailConfigured() : false;

    // Only enforce email verification in production AND when email is configured
    if (!isDev && emailConfigured && !user.isVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email before logging in.',
      });
    }

    user.lastActive = Date.now();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @POST /api/auth/logout
exports.logout = async (req, res) => {
  res.cookie('refreshToken', '', { expires: new Date(0), httpOnly: true });
  res.json({ success: true, message: 'Logged out successfully' });
};

// @GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Always return success (don't reveal if email exists)
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If that email is registered, a reset link has been sent.',
      });
    }

    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await emailService.sendPasswordResetEmail(user.email, user.name, resetUrl);

    res.json({ success: true, message: 'Password reset link sent to your email.' });
  } catch (error) {
    next(error);
  }
};

// @POST /api/auth/reset-password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ success: false, message: 'Token and password are required' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successful. You can now log in.' });
  } catch (error) {
    next(error);
  }
};

// @GET /api/auth/verify-email
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ success: false, message: 'No token provided' });

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await gamificationService.unlockAchievement(user, 'account_verified');
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, message: 'Email verified! You can now log in.' });
  } catch (error) {
    next(error);
  }
};

// @POST /api/auth/refresh-token
exports.refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, message: 'No refresh token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
};

// @GET /api/auth/google/callback
exports.googleCallback = async (req, res) => {
  try {
    const token = req.user.generateJWT();
    res.redirect(`${process.env.FRONTEND_URL}/auth/google/success?token=${token}`);
  } catch (error) {
    res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
  }
};
