/*jshint browser: true, esversion: 6*/
/* global $, ajaxFunctions, localStorage, Materialize, progress */
'use strict';

//const urlReg = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/g;
let lastUrl;

//Update UI when image cannot be found
function badImg(url) {
    //Insert placeholder image
    $('#newPinImg').attr('src', '../public/img/badImg.jpg');
    //Notify the user
    Materialize.toast(`No image found at '${url}'`, 3000, 'error');
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

//Form submission
function savePin(confirmed) {
    //TO DO: Implement save functionality
    if (confirmed) {
        return Materialize.toast('Saved!');
    }
    
    let caption = $('#newPinCaption').val();
    //Check for blank/invalid fields
    if (!caption || $('#newPinCaption').hasClass('invalid')) return Materialize.toast('Please enter a valid caption for your pin.', 3000, 'error');
    if (!lastUrl) return Materialize.toast('Please enter a valid image URL.', 3000, 'error');

    /*If fields appear to be valid, wait for 2 seconds, and then ask for confirmation 
    before submission. This allows for additional URL validation.*/
    let $btn = $('#saveBtn');
    $btn.html('<i class="fa fa-circle-o-notch fa-spin fa-3x"></i>');
    $btn.addClass('disabled');
    setTimeout(() => {
        //If URL is valid, open confirmation modal
        if (lastUrl) $('#modal-confirm').modal('open');
        $btn.html('Save Pin');
        $btn.removeClass('disabled');
    }, 2000);
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
