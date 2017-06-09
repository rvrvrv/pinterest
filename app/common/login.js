/*jshint browser: true, esversion: 6*/
/* global $, ajaxFunctions, localStorage, location, progress */
'use strict';

//Check for login status
function checkLoginStatus() {
    ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', '/api/', (res) => {
        //If user is not logged in, show the login button
        if (res === 'no') {
            $('.login-btn').removeClass('hidden');
            progress('hide');
        }
        else loggedIn(JSON.parse(res));
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
        <li><a class="waves-effect waves-light dynLink" data-link="#modal-newPin">Add a Pin</a></li>
        <li><a class="waves-effect waves-red" id="logoutBtn">Log Out</a></li>`);

    //Initialize dropdown menu
    $('.dropdown-button').dropdown({
        inDuration: 350,
        outDuration: 175,
        constrainWidth: false,
        hover: true,
        belowOrigin: true,
        alignment: 'left',
        stopPropagation: false
    });

    //Generate 'New Pin' modal
    $('.modals').append(`
        <div id="modal-newPin" class="modal">
            <div class="modal-content">
                <h4>New Pin</h4>
                <div class="modal-fixed-footer right">
                    <a class="modal-action modal-close waves-effect waves-light btn-flat">Cancel</a>
                    <a class="req-btn waves-effect waves-green btn-flat tooltipped" data-tooltip="Save this pin" 
                        onclick="savePin(this, true)">Save Pin</a>
                </div>
            </div>`);
    $('.modal').modal();
    
    //Activate logout link
    $('#logoutBtn').click(() => {
        localStorage.removeItem('rv-pinterest-id');
        location.replace('/logout');
    });

    //Activate dynamic links for logged-in user
    $('.dynLink').each(function() {
        let link = $(this).data('link');
        if (link.includes('modal'))
            $(this).click(() => $(link).modal('open'));
    });

    //Remove login button
    $('.login-btn').remove();
    progress('hide');
}
