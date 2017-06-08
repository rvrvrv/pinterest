/*jshint browser: true, esversion: 6*/
/* global $, ajaxFunctions, localStorage, location */
'use strict';

//Check for login status change
function checkLoginStatus() {
    ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', '/api/', (res) => {
        if (typeof res === 'object') loggedIn(JSON.parse(res));
    }));
}

//Show logged-in view
function loggedIn(user) {
    console.log(user);
    //Store user's info
    localStorage.setItem('rv-pinterest-id', user.id);

    //Generate user info in navbar
    $('#userInfo').html(`
        <a class="dropdown-button" data-beloworigin="true" data-activates="userDropdown">
        <li><img class="valign left-align" src="${user.img}"
        alt="${user.name}" id="navImg"></li>
        <li class="hide-on-small-only" id="navName">${user.name.split(' ')[0]}</li></a>`);

    //Generate dropdown menu
    $('#userDropdown').html(`
        <li><a class="waves-effect waves-light dynLink" data-link="addpin">Add a Pin</a></li>
        <li><a class="waves-effect waves-red" href="/logout">Log Out</a></li>`);

    //Initialize dropdown menu
    $('.dropdown-button').dropdown({
        inDuration: 300,
        outDuration: 225,
        constrainWidth: false,
        hover: false,
        gutter: 0,
        belowOrigin: false,
        alignment: 'left',
        stopPropagation: false
    });

    //Remove login button and change welcome message
    $('#loginBtn').remove();
    $('#welcome').html(`<h5 class="white-text center">You're in the club!<br>
            Feel free to <a class="dynLink light-blue-text text-lighten-4" data-link="addbook">add a book</a>
            or <span class="light-blue-text text-lighten-4" id="requestText">request a trade</span>.</h5>`);
    $('#bottomInfo').html(`<h5 class="center">Select any book for more information.</h5>`);

    //Activate all dynamic links
    //activateLinks();

}

//Remove stored ID and redirect to homepage (if necessary)
function loggedOut(reload) {
    localStorage.removeItem('rv-bookclub-id');
    //If user isn't logged in, redirect to homepage
    if (reload) location.replace('/logout');
}
