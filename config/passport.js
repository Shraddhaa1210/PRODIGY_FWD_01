const passport = require('passport');

// Check if credentials exist
const hasGoogleCreds = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;
const hasFacebookCreds = process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET;

if (hasGoogleCreds) {
  const GoogleStrategy = require('passport-google-oauth20').Strategy;
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback"
    },
    // ... rest of Google strategy
  ));
} else {
  console.log('⚠️ Google OAuth disabled - missing credentials in .env');
}

if (hasFacebookCreds) {
  const FacebookStrategy = require('passport-facebook').Strategy;
  passport.use(new FacebookStrategy({
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "/api/auth/facebook/callback",
      profileFields: ['id', 'displayName', 'photos', 'email']
    },
    // ... rest of Facebook strategy
  ));
} else {
  console.log('⚠️ Facebook OAuth disabled - missing credentials in .env');
}

module.exports = passport;