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
	
    app.get('/auth/twitter/callback',
        passport.authenticate('twitter', (req, res) => {
        	console.log(req);
        	res.redirect('/');
        }));

	//Display all pins in collection
	app.route('/api/allpins/')
		.get((req, res) => clickHandler.showAllpins(req, res));

	//Login / user creation
	app.route('/api/user/:name?')
		.post(isLoggedIn, (req, res) => clickHandler.createUser(req, res));

	//Add & remove pin routes
	app.route('/api/pin/:pinId/:userId?')
		.post((req, res) => clickHandler.addToCollection(req, res))
		.put((req, res) => clickHandler.addPin(req.params.pinId, req.session.user, res))
		.delete((req, res) => clickHandler.delPin(req.params.pinId, req.session.user, res));
		
};
