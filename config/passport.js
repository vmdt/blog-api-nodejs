const GoogleStrategy = require('passport-google-oauth20').Strategy;
require("dotenv").config();

const User = require('../models/User');
const AppError = require('../utils/appError');

module.exports = function (passport) {
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        const user = await User.findById(id);
        if (!user)
            done(new AppError('Unauthenticated!', 401));
        done(null, user);
    });

    passport.use(
        new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/auth/google/callback',
        }, 
        async function (accessToken, refeshToken, profile, done) {
            try {
                let user = await User.findOne({googleId: profile.id});

                if (!user) {
                    user = await User.create({
                        googleId: profile.id,
                        username: profile.displayName,
                        email: profile.emails[0].value,
                        profilePhoto: profile.photos[0].value,
                        active: profile.emails[0].verified ? 'active':'verify',
                        typeAuth: 'google'
                    });
                }
                done(null, user);
            } catch (error) {
                done(error);
            }
        })
    );
}