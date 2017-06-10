/*jshint browser: true, esversion: 6*/
/* global $, ajaxFunctions, localStorage, Materialize, progress */
'use strict';

let lastUrl;

$(document).ready(() => $('#newPinUrl').focusout(() => updateImg()));

//Update UI when image cannot be found
function badImg(url) {
    //Insert placeholder image
    $('#newPinImg').attr('src', '../public/img/badImg.jpg');
    //Notify the user
    Materialize.toast(`No image found at '${url}'`, 3000, 'error');
    //Update lastUrl for form submission validation
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
    if (!thisUrl.toLowerCase().startsWith('http')) {
        thisUrl = 'https://' + thisUrl;
        $url.val(thisUrl);
    }
    //If URL is new and appears valid, update the image
    if (thisUrl !== lastUrl && $('#newPinUrl').hasClass('valid')) {
        $('#newPinImg').attr('src', thisUrl);
        lastUrl = thisUrl;
    }
}

//Form submission
function savePin() {
    let caption = $('#newPinCaption').val();
    //Check for blank/invalid fields
    if (!caption || $('#newPinCaption').hasClass('invalid')) return Materialize.toast('Please enter a valid caption for your pin.', 3000, 'error');
    if (!lastUrl || $('#newPinUrl').hasClass('invalid')) return Materialize.toast('Please enter a valid image URL.', 3000, 'error');

    //TO-DO:
    //If fields are valid, ask for confirmation before submission

}

//Cancel pin creation
function cancelPin() {
    //Restore UI to original state
    $('input').val('');
    $('input').removeClass('invalid valid');
    $('#newPinImg').attr('src', '../public/img/galaxy.jpg');
    //Reset lastUrl and close the modal
    lastUrl = '';
    $('#modal-newPin').modal('close');
}
