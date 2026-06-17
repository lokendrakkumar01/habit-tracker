const nodemailer = require('nodemailer');

const isEmailConfigured = () =>
  process.env.EMAIL_USER &&
  process.env.EMAIL_USER !== 'your_email@gmail.com' &&
  process.env.EMAIL_PASS &&
  process.env.EMAIL_PASS !== 'your_gmail_app_password';

exports.isEmailConfigured = isEmailConfigured;

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: { rejectUnauthorized: false },
  });
};

const sendEmail = async ({ to, subject, html }) => {
  if (!isEmailConfigured()) {
    console.log(`📧 [DEV] Email not sent (not configured). To: ${to}, Subject: ${subject}`);
    return; // Silently skip in dev
  }
  try {
    const transporter = createTransporter();
    await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, html });
    console.log(`✅ Email sent to ${to}`);
  } catch (err) {
    console.error('❌ Email send failed:', err.message);
    // Don't throw - email failure shouldn't block registration
  }
};

exports.sendVerificationEmail = async (email, name, verifyUrl) => {
  await sendEmail({
    to: email,
    subject: '✅ Verify Your HabitFlow Account',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#e2e8f0;border-radius:12px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:40px;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:28px">🎯 HabitFlow</h1>
          <p style="color:rgba(255,255,255,0.8);margin:8px 0 0">Build better habits, one day at a time</p>
        </div>
        <div style="padding:40px">
          <h2 style="color:#f1f5f9;margin-top:0">Welcome, ${name}! 👋</h2>
          <p style="color:#94a3b8;line-height:1.6">Please verify your email to get started.</p>
          <div style="text-align:center;margin:32px 0">
            <a href="${verifyUrl}" style="background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">Verify Email Address</a>
          </div>
          <p style="color:#64748b;font-size:14px">Link expires in 24 hours.</p>
        </div>
      </div>`,
  });
};

exports.sendPasswordResetEmail = async (email, name, resetUrl) => {
  await sendEmail({
    to: email,
    subject: '🔐 Reset Your HabitFlow Password',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#e2e8f0;border-radius:12px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:40px;text-align:center">
          <h1 style="color:#fff;margin:0">🎯 HabitFlow</h1>
        </div>
        <div style="padding:40px">
          <h2 style="color:#f1f5f9;margin-top:0">Password Reset</h2>
          <p style="color:#94a3b8">Hi ${name}, click below to reset your password.</p>
          <div style="text-align:center;margin:32px 0">
            <a href="${resetUrl}" style="background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">Reset Password</a>
          </div>
          <p style="color:#64748b;font-size:14px">Link expires in 1 hour.</p>
        </div>
      </div>`,
  });
};

exports.sendReminderEmail = async (email, name, habits) => {
  const habitList = habits.map((h) => `<li style="color:#94a3b8;padding:4px 0">${h.icon || '🎯'} ${h.title}</li>`).join('');
  await sendEmail({
    to: email,
    subject: '⏰ Your Daily Habit Reminder',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#e2e8f0;border-radius:12px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:40px;text-align:center">
          <h1 style="color:#fff;margin:0">🎯 HabitFlow</h1>
        </div>
        <div style="padding:40px">
          <h2 style="color:#f1f5f9;margin-top:0">Time to build habits, ${name}! 💪</h2>
          <ul style="padding-left:20px">${habitList}</ul>
          <div style="text-align:center;margin:32px 0">
            <a href="${process.env.FRONTEND_URL}/dashboard" style="background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600">Open App</a>
          </div>
        </div>
      </div>`,
  });
};
