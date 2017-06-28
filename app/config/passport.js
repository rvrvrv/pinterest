'use strict';

var TwitterStrategy = require('passport-twitter').Strategy;
var mongoose = require('mongoose');
var User = require('../models/users');
var configAuth = require('./auth');

module.exports = function (passport) {

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        var userId = mongoose.Schema.Types.ObjectId(id);
        User.findById(userId, function (err, user) {
            done(err, user);
        });
    });

    passport.use(new TwitterStrategy({
        consumerKey: configAuth.twitterAuth.consumerKey,
        consumerSecret: configAuth.twitterAuth.consumerSecret,
        callbackURL: configAuth.twitterAuth.callbackURL
    }, function (token, tokenSecret, profile, done) {
        process.nextTick(function () {
            User.findOne({ 'id': profile.id }, function (err, user) {
                if (err) return done(err);
                if (user) return done(null, user);else {
                    var newUser = new User();
                    newUser.id = profile.id;
                    newUser.name = profile.displayName;
                    newUser.img = profile.photos[0].value;
                    newUser.save(function (err) {
                        if (err) throw err;
                        return done(null, newUser);
                    });
                }
            });
        });
    }));
};