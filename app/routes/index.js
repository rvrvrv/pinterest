'use strict';

const path = process.cwd();
const ClickHandler = require(path + '/app/controllers/clickHandler.server');

module.exports = (app, passport) => {

	function isLoggedIn(req, res, next) {
		console.log('req.session at isLoggedIn: ', req.session);
		if (req.session.passport === req.session.userId) return next();
	}

	let clickHandler = new ClickHandler();

	//Homepage
	app.get('/', (req, res) => {
		res.sendFile(path + '/public/index.html');
	});

	//Logout route
	app.get('/logout', (req, res) => {
		req.session.reset();
		res.redirect('/');
	});

	//Twitter auth routes
	app.get('/auth/twitter', passport.authenticate('twitter'));

	app.get('/auth/twitter/callback', (req, res, next) => {
		passport.authenticate('twitter', (err, user) => {
			if (err) return next(err);
			if (!user) return res.send('error');
			req.logIn(user, err => {
				if (err) return next(err);
				req.session.passport = user.id;
				req.session.userId = user.id;
				req.session.userName = user.name;
				res.redirect('/');
			});
		})(req, res, next);
	});

	//Retrieve all pins in collection
	app.route('/api/allpins/')
		.get((req, res) => clickHandler.getAllPins(req, res));

	//Get user information
	app.get('/api/:id?', isLoggedIn, (req, res) => {
		clickHandler.loadUser(req, res);
	});
	
	//Like & unlike pin routes
	app.route('/api/like/:obj')
		.put(isLoggedIn, (req, res) => clickHandler.likePin(req.session.userId, req.params.obj, res))
		.delete(isLoggedIn, (req, res) => clickHandler.unlikePin(req.session.userId, req.params.obj, res));
		
	//Add & remove pin routes
	app.route('/api/pin/:pinUrl/:pinCaption')
		.post(isLoggedIn, (req, res) => clickHandler.addToCollection(req, res))
		.put(isLoggedIn, (req, res) => clickHandler.addPin(req.session, decodeURIComponent(req.params.pinUrl), decodeURIComponent(req.params.pinCaption), res))
		.delete(isLoggedIn, (req, res) => clickHandler.delPin(req.session, decodeURIComponent(req.params.pinUrl), res));
};
