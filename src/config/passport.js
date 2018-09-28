const TwitterStrategy = require('passport-twitter').Strategy;
const mongoose = require('mongoose');
const User = require('../models/users');
const configAuth = require('./auth');

module.exports = function (passport) {
  passport.serializeUser((user, done) => done(null, user.id));

  passport.deserializeUser((id, done) => {
    const userId = mongoose.Schema.Types.ObjectId(id);
    User.findById(userId, (err, user) => {
      done(err, user);
    });
  });

  passport.use(new TwitterStrategy({
    consumerKey: configAuth.twitterAuth.consumerKey,
    consumerSecret: configAuth.twitterAuth.consumerSecret,
    callbackURL: configAuth.twitterAuth.callbackURL
  },
  ((token, tokenSecret, profile, done) => {
    process.nextTick(() => {
      User.findOne({ id: profile.id }, (err, user) => {
        if (err) return done(err);
        if (user) return done(null, user);

        const newUser = new User();
        newUser.id = profile.id;
        newUser.name = profile.displayName;
        newUser.img = profile.photos[0].value;

        return newUser.save((dbErr) => {
          if (dbErr) throw dbErr;
          return done(null, newUser);
        });
      });
    });
  })));
};
