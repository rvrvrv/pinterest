'use strict';

const path = process.cwd();
const ClickHandler = require(path + '/app/controllers/clickHandler.server');

module.exports = (app, passport) => {

	function isLoggedIn(req, res, next) {
		if (req.isAuthenticated()) return next();
		else res.redirect('/');
	}

	let clickHandler = new ClickHandler();

	//Homepage
	app.get('/', (req, res) => {
		res.sendFile(path + '/public/index.html');
	});

	//Logout route
	app.get('/logout', (req, res) => {
		req.logout();
		res.redirect('/');
	});

	//Twitter auth routes
	app.get('/auth/twitter', passport.authenticate('twitter'));

	app.get('/auth/twitter/callback', (req, res, next) => {
		passport.authenticate('twitter', (err, user) => {
			if (err) return next(err);
			if (!user) return res.send('Error');
			req.logIn(user, err => {
				if (err) return next(err);
				req.session.user = user.id;
				res.redirect('/');
			});
		})(req, res, next);
	});

	//Display all pins in collection
	app.route('/api/allpins/')
		.get((req, res) => clickHandler.showAllpins(req, res));

	//Get user information
	app.get('/api/:id', isLoggedIn, (req, res) => {
		clickHandler.loadUser(res, res);
	});

	//Add & remove pin routes
	app.route('/api/pin/:pinId/:userId?')
		.post((req, res) => clickHandler.addToCollection(req, res))
		.put((req, res) => clickHandler.addPin(req.params.pinId, req.session.user, res))
		.delete((req, res) => clickHandler.delPin(req.params.pinId, req.session.user, res));

};
