import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import User from "./models/User.js";
import bcrypt from "bcrypt";
dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URI,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Google profile info
        const email = profile.emails[0].value;
        const username = profile.displayName;

        // Check if user exists
        let user = await User.findOne({ where: { username: email } });
        if (!user) {
          // create a new user with random password
          const hash = await bcrypt.hash("google-oauth-placeholder", 10);
          user = await User.create({ username: email, passwordHash: hash, role: "user" });
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

export default passport;
