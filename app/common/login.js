/*jshint browser: true, esversion: 6*/
/* global $, ajaxFunctions, localStorage, location, progress, updateImg */
'use strict';

//Check for login status
function checkLoginStatus() {
    ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', '/api/', (res) => {
        //If user is not logged in, show the login button
        if (res === 'no') {
            $('.login-btn').removeClass('hidden');
        }
        else loggedIn(JSON.parse(res));
    }));
}

//Show logged-in view
function loggedIn(user) {
    console.log(user);
    //Store user's info
    localStorage.setItem('rv-pinterest-id', user.id);
    localStorage.setItem('rv-pinterest-name', user.name);

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

    //Generate 'New Pin' modals
    $('.modals').append(`
        <div id="modal-newPin" class="modal">
            <div class="modal-content">
                <div class="row" id="newImgDiv">
                    <img class="z-depth-4" id="newPinImg" src="../public/img/galaxy.jpg" onerror="badImg(this.src)"></img>
                </div>
                <form class="col s12">
                    <div class="row center">
                        <h5>Add a pin! Fill out the fields below, and share your awesome pin with the community.</h5>
                    </div>
                    <div class="row">
                        <div class="input-field col s12">
                            <input id="newPinCaption" alt="Caption" placeholder="Radiant Galaxy" type="text" 
                                class="validate" pattern="[a-zA-Z0-9.,?!@#$%&*() ]{1,}$" maxlength="50" data-length="50">
                            <label class="active" for="newPinCaption" data-error="Please enter a valid caption.">Caption</label>
                        </div>
                    </div>
                    <div class="row">
                        <div class="input-field col s12">
                            <input id="newPinUrl" alt="Image URL" placeholder="https://goo.gl/Ls5l2M" type="url" 
                                class="validate" maxlength="500" data-length="500">
                            <label class="active" for="newPinUrl" data-error="Please enter a valid image URL.">Image URL</label>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer valign-wrapper">
                <div class="row center">
                    <a class="waves-effect waves-green btn-flat" id="saveBtn" onclick="savePin()">Save Pin</a>
                    <a class="waves-effect waves-red btn-flat" onclick="resetPinModal()">Cancel</a>
                </div>
            </div>
        </div>
        <div id="modal-confirm" class="modal">
            <div class="modal-content">
                <div class="row center">
                    <h5>Are you sure you would like to save this pin?</h5>
                </div>
            </div>
            <div class="modal-footer valign-wrapper">
                <div class="row center">
                    <a class="waves-effect waves-green btn-flat" id="confirmSaveBtn" onclick="performSave()">Yes</a>
                    <a class="waves-effect waves-red btn-flat modal-action modal-close" id="notConfirmedBtn">No</a>
                </div>
            </div>
        </div>`);
    $('#newPinUrl').focusout(() => updateImg());
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
        else if (link.includes('like'))
            $(this.click(() => likePin(this)));
    });

    //Remove login button
    $('.login-btn').remove();
    progress('hide');
}
