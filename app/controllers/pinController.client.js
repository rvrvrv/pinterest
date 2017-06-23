/*jshint browser: true, esversion: 6*/
/* global $, ajaxFunctions, errorMsg, Materialize, progress */
'use strict';

let lastUrl;

//Generate HTML for pin in grid
function generatePin(url, caption, ownerId, ownerName, likes, loggedIn, updateGrid) {
    //Set onclick based on whether or not user is logged in
    let onclick = loggedIn ? 'likePin(this)' : `errorMsg('Please log in to like ${caption}')`;
    //If user is logged in (and created the pin), generate the delete button
    let delBtn = loggedIn ? generateDelBtn(url, caption, ownerId) : '';
    //Outputted HTML code
    let pinHtml = `<div class="grid-item" data-owner="${ownerId}" data-url="${url}">
                    <img src="${url}" alt="${caption}" data-owner-name="${ownerName}"
                    onerror="this.onerror=null;this.src='../public/img/badImg.jpg';">
                    <h6 class="center">${caption}</h6>
                        <h6>
                            ${delBtn}
                            <span class="right">
                                <a class="dynLink tooltipped" data-link="like" data-owner="${ownerId}" data-url="${url}" 
                                onclick="${onclick}" data-tooltip="Like this pin">
                                <i class="fa fa-heart-o"></i>&nbsp;</a>
                                <span class="likes">${likes}</span>
                            </span>
                        </h6>
                    </div>`;
    //If called from performSave function, update the grid
    if (updateGrid) return $('.pins').isotope('insert', pinHtml);
    //If called from showAllPins (indexController.client.js), return html code only
    else return pinHtml;
}

//Generate HTML for delete-pin buttons in grid
function generateDelBtn(url, caption, ownerId) {
    return `<span class="left">
                <a class="tooltipped" data-caption="${caption}" 
                data-owner="${ownerId}" data-url="${url}" 
                onclick="deletePin(this)" data-tooltip="Delete this pin">
                <i class="fa fa-minus-square-o"></i></a>
            </span>`;
}

//Update UI when image cannot be found
function badImg(url) {
    //Insert placeholder image
    $('#newPinImg').attr('src', '../public/img/badImg.jpg');
    //Notify the user
    errorMsg(`No image found at '${url}'`);
    $('#newPinUrl').removeClass('valid').addClass('invalid');
    //Prevent user from saving a bad image URL
    lastUrl = false;
}

//Validate URL field and update image
function updateImg() {
    let $url = $('#newPinUrl');

    //If URL field is empty, don't do anything
    if ($url.val() === '') return;

    //Otherwise, continue with validation
    let thisUrl = $url.val().trim();

    //Prepend URL with protocol, if necessary
    if (!thisUrl.toLowerCase().startsWith('http')) thisUrl = 'https://' + thisUrl;
    $url.val(thisUrl);

    //If URL is new and appears valid, update the image
    if (thisUrl !== lastUrl) {
        $('#newPinImg').attr('src', thisUrl);
        lastUrl = thisUrl;
    }
}

//Initial pin-creation submission
function savePin() {
    let caption = $('#newPinCaption').val();
    //Check for blank/invalid fields
    if (!caption || $('#newPinCaption').hasClass('invalid')) return errorMsg('Please enter a valid caption for your pin.');
    if (!lastUrl) return errorMsg('Please enter a valid image URL.');

    /*If fields appear to be valid, wait for 0.5 seconds, and then ask for confirmation 
    before submission. This allows for additional URL validation.*/
    let $btn = $('#saveBtn');
    $btn.html('<i class="fa fa-circle-o-notch fa-spin fa-3x"></i>');
    $btn.addClass('disabled');
    setTimeout(() => {
        //If URL is valid, open confirmation modal
        if (lastUrl) $('#modalConfirmSave').modal('open');
        $btn.html('Save Pin');
        $btn.removeClass('disabled');
    }, 500);
}

//After confirmation, save pin to the DB
function performSave() {
    let pinCaption = $('#newPinCaption');
    let pinUrl = $('#newPinUrl');
    //Final validation check
    if (pinCaption.hasClass('invalid') || pinUrl.hasClass('invalid')) return $('#modalConfirmSave').modal('close');

    //Update UI while save is performed
    progress('show', true);
    $('#modalConfirmSave a').addClass('disabled');
    $('#modalConfirmSave h5').html('Saving...');

    //Update the database (add pin to the user's collection)
    let apiUrl = `/api/pin/${encodeURIComponent(pinUrl.val())}/${encodeURIComponent(pinCaption.val())}`;
    ajaxFunctions.ajaxRequest('PUT', apiUrl, (result) => {
        //Regardless of result, close and restore the confirmation modal
        $('#modalConfirmSave').modal('close');
        setTimeout(() => {
            $('#modalConfirmSave a').removeClass('disabled');
            $('#modalConfirmSave h5').html('Are you sure you would like to save this pin?');
        }, 1000);
        progress('hide', true);
        //If an error occured, notify the user
        if (result === 'error') return errorMsg();
        if (result === 'exists') return errorMsg('You\'ve already pinned this image!');
        //Otherwise, close the modal and update the UI
        resetPinModal();
        Materialize.toast('New pin saved!', 3000);
    });
}

//Reset the new-pin modal
function resetPinModal() {
    $('#modal-newPin').modal('close');
    setTimeout(() => {
        $('input').val('');
        $('input').removeClass('invalid valid');
        $('#newPinImg').attr('src', '../public/img/galaxy.jpg');
    }, 1000);
    lastUrl = '';
}

//Initial pin-deletion attempt from user
function deletePin(pin) {
    //Update and display delete-confirmation modal
    $('#delMsg').html(`Are you sure you want to delete ${$(pin).data('caption')}?`);
    $('#confirmDelBtn').unbind('click');
    $('#confirmDelBtn').click(() => performDelete($(pin).data('url')));
    $('#modalConfirmDelete').modal('open');
}

//After confirmation, delete the pin in the DB
function performDelete(pinUrl) {
    ajaxFunctions.ajaxRequest('DELETE', `/api/pin/${encodeURIComponent(pinUrl)}`, (result) => {
        //If an error occured, notify the user
        if (result === 'error') return errorMsg();
        if (result === 'no') return errorMsg('That isn\'t your pin!');
        //Otherwise, close the modal and update the UI
        $('#modalConfirmDelete').modal('close');
        Materialize.toast('Your pin has been deleted!', 3000);
        $('.pins').isotope('remove', $(`.grid-item[data-owner="${result}"][data-url="${pinUrl}"]`));
    });
}
