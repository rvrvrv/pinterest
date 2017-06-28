'use strict';

var path = process.cwd();
var ClickHandler = require(path + '/app/controllers/clickHandler.server');

module.exports = function (app, passport) {

	function isLoggedIn(req, res, next) {
		console.log('req.session at isLoggedIn: ', req.session);
		if (req.session.passport === req.session.userId) return next();
	}

	var clickHandler = new ClickHandler();

	//Homepage
	app.get('/', function (req, res) {
		res.sendFile(path + '/public/index.html');
	});

	//Logout route
	app.get('/logout', function (req, res) {
		req.session.reset();
		res.redirect('/');
	});

	//Twitter auth routes
	app.get('/auth/twitter', passport.authenticate('twitter'));

	app.get('/auth/twitter/callback', function (req, res, next) {
		passport.authenticate('twitter', function (err, user) {
			if (err) return next(err);
			if (!user) return res.send('error');
			req.logIn(user, function (err) {
				if (err) return next(err);
				req.session.passport = user.id;
				req.session.userId = user.id;
				req.session.userName = user.name;
				res.redirect('/');
			});
		})(req, res, next);
	});

	//Retrieve all pins in collection
	app.route('/api/allpins/').get(function (req, res) {
		return clickHandler.getAllPins(req, res);
	});

	//Get user information
	app.get('/api/:id?', isLoggedIn, function (req, res) {
		clickHandler.loadUser(req, res);
	});

	//Like & unlike pin routes
	app.route('/api/like/:obj').put(isLoggedIn, function (req, res) {
		return clickHandler.likePin(req.session.userId, req.params.obj, res);
	}).delete(isLoggedIn, function (req, res) {
		return clickHandler.unlikePin(req.session.userId, req.params.obj, res);
	});

	//Add & remove pin routes
	app.route('/api/pin/:pinUrl/:pinCaption?').post(isLoggedIn, function (req, res) {
		return clickHandler.addToCollection(req, res);
	}).put(isLoggedIn, function (req, res) {
		return clickHandler.addPin(req.session, decodeURIComponent(req.params.pinUrl), decodeURIComponent(req.params.pinCaption), res);
	}).delete(isLoggedIn, function (req, res) {
		return clickHandler.delPin(req.session, decodeURIComponent(req.params.pinUrl), res);
	});
};