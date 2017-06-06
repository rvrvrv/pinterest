'use strict';

var TwitterStrategy = require('passport-twitter').Strategy;
var User = require('../models/users');
var configAuth = require('./auth');

module.exports = function(passport) {

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });

    passport.use(new TwitterStrategy({
            consumerKey: configAuth.twitterAuth.consumerKey,
            consumerSecret: configAuth.twitterAuth.consumerSecret,
            callbackURL: configAuth.twitterAuth.callbackURL

        },
        function(token, tokenSecret, profile, done) {
            console.log(profile);
            process.nextTick(() => {
                User.findOne({ 'id': profile.id }, (err, user) => {
                    if (err) return done(err);
                    if (user) return done(null, user);
                    else {
                        let newUser = new User();
                        newUser.id = profile.id;
                        newUser.username = profile.username;
                        newUser.displayName = profile.displayName;

                        newUser.save(err => {
                            if (err) throw err;
                            return done(null, newUser);
                        });
                    }
                });
            });
        }));
};
