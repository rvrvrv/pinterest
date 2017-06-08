/*jshint browser: true, esversion: 6*/
/* global $, ajaxFunctions, generateLoggedInUI, localStorage, location, progress */
'use strict';

//Check for login status change
function checkLoginStatus() {
    ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', '/api/', (res) => {
        if (typeof res !== Object) return false;
        return JSON.parse(res);
    }));
}

//Show logged-in view and save/load new user in DB
function loggedIn(response) {
    if ($('#adsblocked')) $('#adsblocked').remove();
    progress('show');
    FB.api('/me?fields=first_name, last_name, picture, hometown, location', function(user) {
        //Store user's info
        localStorage.setItem('rv-bookclub-id', user.id);
        let userLoc = (!user.location) ? 'Add your location' : user.location.name;
        let currentUser = {
            id: user.id,
            name: `${user.first_name} ${user.last_name}`,
            location: userLoc,
            signed: response.authResponse.accessToken
        };
        //Load or create new user in DB
		$.post('/api/user/', currentUser)
			.done((res) => {
			    //Update UI with logged-in view)
                generateLoggedInUI(res, user.picture.data.url);
                progress('hide');
			})
			.fail(() => {
			    console.error('Could not load data');
			    progress('hide');
			});
    });
}

//Remove stored ID and redirect to homepage (if necessary)
function loggedOut(reload) {
    localStorage.removeItem('rv-bookclub-id');
    //If user isn't logged in, redirect to homepage
    if (reload) location.replace('/logout');
}