'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const favicon = require('serve-favicon');
const routes = require('./app/routes/index.js');
const mongoose = require('mongoose');
const passport = require('passport');
const path = require('path');
const session = require('client-sessions');

const app = express();
require('dotenv').load();
require('./app/config/passport')(passport);

mongoose.connect(process.env.MONGO_URI);
mongoose.Promise = global.Promise;

app.use(bodyParser.urlencoded({extended: true}));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use('/controllers', express.static(process.cwd() + '/app/controllers'));
app.use('/public', express.static(process.cwd() + '/public'));
app.use('/common', express.static(process.cwd() + '/app/common'));

app.use(session({
    cookieName: 'session',
    secret: process.env.SESS_SECRET,
    duration: 60 * 60 * 1000,
    activeDuration: 30 * 60 * 1000,
    httpOnly: true,
    secure: true,
    ephemeral: true
}));

app.use(passport.initialize());
app.use(passport.session());

routes(app, passport);

const port = process.env.PORT || 8080;
app.listen(port, () => console.log('Node.js listening on port ' + port + '...'));