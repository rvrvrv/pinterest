/*jshint browser: true, esversion: 6*/
/* global $, ajaxFunctions, generateDelBtn, likeBtnSwitch, likePin, localStorage, location, updateImg */
'use strict';

//Check for login status

function checkLoginStatus() {
    ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', '/api/', function (res) {
        //If user is not logged in, show the login button
        if (res === 'no') {
            $('.login-btn').removeClass('hidden');
        } else loggedIn(JSON.parse(res));
    }));
}

//Show logged-in view
function loggedIn(user) {
    //Store user's info
    localStorage.setItem('rv-pinterest-id', user.id);
    localStorage.setItem('rv-pinterest-name', user.name);

    //Generate user info in navbar
    $('#userInfo').html('\n        <a class="dropdown-button" data-activates="userDropdown">\n        <li><img src="' + user.img + '" alt="' + user.name + '" id="navImg"></li>\n        <li class="hide-on-small-only" id="navName">' + user.name.split(' ')[0] + '</li></a>');

    //Generate dropdown menu
    $('#userDropdown').html('\n        <li><a class="waves-effect waves-light dynLink" data-link="#modal-newPin">Add a Pin</a></li>\n        <li><a class="waves-effect waves-red" id="logoutBtn">Log Out</a></li>');

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

    //Generate and display pin-filter menu
    $('.progress').after('\n        <div class="container animated hidden" id="filters">\n            <div class="row">\n                <div class="col s12">\n                    <ul class="tabs tabs-fixed-width">\n                        <li class="tab col s4"><a class="filter-btn active" data-filter="*">All Pins</a></li>\n                        <li class="tab col s4"><a class="filter-btn" data-filter=".yours">Yours</a></li>\n                        <li class="tab col s4"><a class="filter-btn" data-filter=".liked">Liked</a></li>\n                    </ul>\n                </div>\n            </div>\n        </div>');
    $('#filters').addClass('fadeIn').removeClass('hidden');

    //Activate pin-filter menu buttons
    $('.filter-btn').click(function () {
        $('.filter-btn.active').removeClass('active');
        $(this).addClass('active');
        var filterVal = $(this).data('filter');
        $('.pins').isotope({
            filter: filterVal
        });
    });

    //Generate 'New Pin' modals
    $('.modals').append('\n        <div id="modal-newPin" class="modal">\n            <div class="modal-content">\n                <div class="row" id="newImgDiv">\n                    <img class="z-depth-4" id="newPinImg" src="../public/img/galaxy.jpg" onerror="badImg(this.src)"></img>\n                </div>\n                <form class="col s12">\n                    <div class="row center">\n                        <h5>Add a pin! Fill out the fields below, and share your awesome pin with the community.</h5>\n                    </div>\n                    <div class="row">\n                        <div class="input-field col s12">\n                            <input id="newPinCaption" alt="Caption" placeholder="Radiant Galaxy" type="text" \n                                class="validate" pattern="[a-zA-Z0-9.,?!@#$%&*() ]{1,}$" maxlength="50" data-length="50">\n                            <label class="active" for="newPinCaption" data-error="Please enter a valid caption.">Caption</label>\n                        </div>\n                    </div>\n                    <div class="row">\n                        <div class="input-field col s12">\n                            <input id="newPinUrl" alt="Image URL" placeholder="https://goo.gl/Ls5l2M" type="url" \n                                class="validate" maxlength="500" data-length="500">\n                            <label class="active" for="newPinUrl" data-error="Please enter a valid image URL.">Image URL</label>\n                        </div>\n                    </div>\n                </form>\n            </div>\n            <div class="modal-footer valign-wrapper">\n                <div class="row center">\n                    <a class="waves-effect waves-green btn-flat" id="saveBtn" onclick="savePin()">Save Pin</a>\n                    <a class="waves-effect waves-red btn-flat" onclick="resetPinModal()">Cancel</a>\n                </div>\n            </div>\n        </div>\n        <div id="modalConfirmSave" class="modal modal-confirm">\n            <div class="modal-content">\n                <div class="row center">\n                    <h5>Are you sure you would like to save this pin?</h5>\n                </div>\n            </div>\n            <div class="modal-footer valign-wrapper">\n                <div class="row center">\n                    <a class="waves-effect waves-green btn-flat" id="confirmSaveBtn" onclick="performSave()">Yes</a>\n                    <a class="waves-effect waves-red btn-flat modal-action modal-close" id="notConfirmedBtn">No</a>\n                </div>\n            </div>\n        </div>');
    $('#newPinUrl').focusout(function () {
        return updateImg();
    });

    //Generate 'Delete Pin' confirmation modal
    $('.modals').append('\n        <div id="modalConfirmDelete" class="modal modal-confirm">\n            <div class="modal-content">\n                <div class="row center">\n                    <h5 id="delMsg"></h5>\n                </div>\n            </div>\n            <div class="modal-footer valign-wrapper">\n                <div class="row center">\n                    <a class="waves-effect waves-red btn-flat" id="confirmDelBtn">Yes</a>\n                    <a class="waves-effect waves-yellow btn-flat modal-action modal-close">No</a>\n                </div>\n            </div>\n        </div>');

    //Initialize new modals
    $('.modal').modal();

    //Update and activate like buttons
    user.likes.forEach(function (e) {
        var likedPin = $('a[data-owner="' + e.ownerId + '"][data-url="' + e.url + '"]');
        //If user likes the pin, update the UI
        if (likedPin) likeBtnSwitch(likedPin, true);
    });

    //Update user's pins (for filter and delete buttons)
    user.pins.forEach(function (e) {
        var userPin = $('a[data-owner="' + user.id + '"][data-url="' + e + '"]');
        //Add class for filtering
        userPin.parents('.grid-item').addClass('yours');
        //Add delete button
        userPin.parents('.right').before(generateDelBtn(e, userPin.parents('h6').prev().html(), user.id));
        $('.tooltipped').tooltip();
    });

    //Activate dynamic links for logged-in user
    $('.dynLink').each(function () {
        var _this = this;

        var link = $(this).data('link');
        //New-pin modal
        if (link.includes('modal')) $(this).click(function () {
            return $(link).modal('open');
        });
        //Like/unlike links
        else if (link.includes('like')) {
                //Remove 'Please login' message from all like/unlike links
                $(this).prop('onclick', null); //For IE compatibility
                $(this).removeAttr('onclick');
                //Activate 'like' links
                if (link === 'like') $(this).click(function () {
                    return likePin(_this);
                });
            }
    });

    //Activate logout link
    $('#logoutBtn').click(function () {
        localStorage.removeItem('rv-pinterest-id');
        localStorage.removeItem('rv-pinterest-name');
        location.replace('/logout');
    });

    //Remove login button
    $('.login-btn').remove();
}