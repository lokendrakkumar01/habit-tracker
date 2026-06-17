const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const User = require('../models/User');

// ── JWT Strategy ──────────────────────────────────────────────────────────────
passport.use(
  'jwt',
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    async (payload, done) => {
      try {
        const user = await User.findById(payload.id).select('-password');
        if (!user) return done(null, false);
        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

// ── Google OAuth Strategy ─────────────────────────────────────────────────────
const GOOGLE_CLIENT_ID     = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const CALLBACK_URL         = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback';

const googleEnabled =
  GOOGLE_CLIENT_ID &&
  !GOOGLE_CLIENT_ID.includes('your_google') &&
  GOOGLE_CLIENT_SECRET &&
  !GOOGLE_CLIENT_SECRET.includes('your_google');

if (googleEnabled) {
  const GoogleStrategy = require('passport-google-oauth20').Strategy;

  passport.use(
    'google',
    new GoogleStrategy(
      {
        clientID:     GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL:  CALLBACK_URL,
        scope:        ['profile', 'email'],
        proxy:        true, // important for redirect_uri matching
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(new Error('No email from Google'), false);

          // 1. Find by Google ID
          let user = await User.findOne({ googleId: profile.id });

          // 2. Find by email → link account
          if (!user) {
            user = await User.findOne({ email });
            if (user) {
              user.googleId  = profile.id;
              user.isVerified = true;
              if (!user.avatar && profile.photos?.[0]?.value) {
                user.avatar = profile.photos[0].value;
              }
              await user.save({ validateBeforeSave: false });
            }
          }

          // 3. Create new user
          if (!user) {
            user = await User.create({
              name:       profile.displayName || email.split('@')[0],
              email,
              googleId:   profile.id,
              avatar:     profile.photos?.[0]?.value || '',
              isVerified: true,
            });
          }

          return done(null, user);
        } catch (err) {
          return done(err, false);
        }
      }
    )
  );

  console.log(`✅ Google OAuth enabled → callback: ${CALLBACK_URL}`);
} else {
  console.log('⚠️  Google OAuth disabled (set GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET in .env)');
}

passport.serializeUser((user, done)   => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('-password');
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
