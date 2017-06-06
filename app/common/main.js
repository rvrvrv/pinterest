/*jshint browser: true, esversion: 6*/
/* global $, ajaxFunctions, localStorage, location, Materialize */
'use strict';

//Show and hide progress bar
function progress(operation) {
    if (operation === 'show') $('.progress').removeClass('hidden');
    else $('.progress').addClass('hidden');
}

//Restore modal buttons upon close
function restoreBtns() {
    //Only perform this operation if 'Confirm Removal' button exists
    if ($('.req-btn').hasClass('confirm-rm-btn')) {
        let btn = $('.confirm-rm-btn');
        btn.html('Remove Book');
        btn.attr('onclick', 'removeBook(this)');
        btn.removeClass('red white-text waves-light confirm-rm-btn').addClass('waves-red');
    }
}

//Activate nav links
function activateLinks() {

    //Iterate through nav links
    $('.dynLink').each(function() {
        let link = $(this).data('link');
        if (link.includes('modal'))
            $(this).click(() => $(link).modal('open'));
        else if (!location.pathname.includes(link))
            $(this).click(() => location.href = `${link}.html`);
    });
}

//Generate UI for logged-in users
function generateLoggedInUI(user, picture) {

    //Generate user info in navbar
    $('#userInfo').html(`
        <a class="dropdown-button" data-beloworigin="true" data-activates="userDropdown">
        <li><img class="valign left-align" src="${picture}"
        alt="${user.name}" id="navImg"></li>
        <li class="hide-on-small-only" id="navName">${user.name.split(' ')[0]}</li></a>`);

    //Generate dropdown menu
    $('#userDropdown').html(`
        <li><a class="waves-effect waves-green dynLink" data-link="addbook">Add a Book</a></li>
        <li><a class="modal-trigger waves-effect waves-green" data-target="profileModal">Edit Profile</a></li>
        <li class="divider"></li>
        <li><a class="waves-effect waves-green" id="logoutLink">Log Out</a></li>`);

    //Initialize dropdown menu
    $('.dropdown-button').dropdown({
        inDuration: 300,
        outDuration: 225,
        constrainWidth: false,
        hover: true,
        gutter: 0,
        belowOrigin: false,
        alignment: 'left',
        stopPropagation: false
    });


        //Hide login button and change welcome message
        $('.fb-login-button').hide();
        $('#welcome').html(`<h5 class="white-text center">You're in the club!<br>
            Feel free to <a class="dynLink light-blue-text text-lighten-4" data-link="addbook">add a book</a>
            or <span class="light-blue-text text-lighten-4" id="requestText">request a trade</span>.</h5>`);
        $('#bottomInfo').html(`<h5 class="center">Select any book for more information.</h5>`);
        //Activate 'request a trade' text
        $('#requestText').click(() => {
            $('.carousel').addClass('shake');
            setTimeout(() => $('.carousel').removeClass('shake'), 1000);
        });

    //Activate all dynamic links
    activateLinks();
    
}

//Helper to open modals from collapsibles
function openModal(link, trueOwner) {
    let owner = trueOwner ? link.data('user') : localStorage.getItem('rv-bookclub-id');
    let bookModal = $(`.modal-book[data-book="${link.data('book')}"][data-owner="${owner}"]`);
    bookModal.modal('open');
}

//Handle 'Remove Book' link click
function removeBook(link, confirmed) {
    //First, ask for user confirmation
    if (!confirmed) {
        $(link).removeClass('waves-red').addClass('red white-text waves-light confirm-rm-btn');
        $(link).html('Confirm Removal');
        $(link).attr('onclick', 'removeBook(this, true)');
    }
    else {
        progress('show');
        //When confirmed, delete book from DB
        let book = $(link).data('book');
        let apiUrl = `/api/book/${book}/${localStorage.getItem('rv-bookclub-id')}`;
        ajaxFunctions.ajaxRequest('DELETE', apiUrl, (data) => {
            console.log(data);
            //Remove book from carousel
            $(`.carousel-item[data-book="${book}"]`).remove();
            $('.carousel').removeClass('initialized');
            $('.carousel').carousel();
            //Close and remove book modal and tooltip
            $(`.modal[data-book="${book}"]`).modal('close');
            $(`.modal[data-book="${book}"]`).remove();
            $(link).tooltip('remove');
            //Notify the user
            Materialize.toast(`${$(link).data('title')} has been removed from the collection!`, 5000);
            progress('hide');
        });
    }
}

