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
            process.nextTick(() => {
                User.findOne({ 'twitter.id': profile.id }, (err, user) => {
                    if (err) return done(err);
                    if (user) return done(null, user);
                    else {
                        let newUser = new User();

                        newUser.twitter.id = profile.id;
                        newUser.twitter.token = token;
                        newUser.twitter.username = profile.username;
                        newUser.twitter.displayName = profile.displayName;

                        newUser.save(err => {
                            if (err) throw err;
                            return done(null, newUser);
                        });
                    }
                });
            });
        }));
};
