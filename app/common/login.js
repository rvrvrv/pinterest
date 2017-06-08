/*jshint browser: true, esversion: 6*/
/* global $, ajaxFunctions, localStorage, location */
'use strict';

//Check for login status
function checkLoginStatus() {
    ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', '/api/', (res) => {
        if (res !== 'no') loggedIn(JSON.parse(res));
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
        <li><a class="waves-effect waves-red" id="logoutBtn">Log Out</a></li>`);

    //Activate logout link
    $('#logoutBtn').click(() => {
        localStorage.removeItem('rv-pinterest-id');
        location.replace('/logout');
    });

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

    //Activate dynamic links for logged-in user
    activateLinks();

}

//Activate dynamic links
function activateLinks() {
    //Iterate through all dynamic links
    $('.dynLink').each(function() {
        let link = $(this).data('link');
        if (link.includes('modal'))
            $(this).click(() => $(link).modal('open'));
    });
}
