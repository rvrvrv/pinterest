/*jshint browser: true, esversion: 6*/
/* global $, ajaxFunctions, localStorage, Materialize, progress */
'use strict';

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

//Initial pin-creation submission
function savePin() {
    let caption = $('#newPinCaption').val();
    //Check for blank/invalid fields
    if (!caption || $('#newPinCaption').hasClass('invalid')) return Materialize.toast('Please enter a valid caption for your pin.', 3000, 'error');
    if (!lastUrl) return Materialize.toast('Please enter a valid image URL.', 3000, 'error');

    /*If fields appear to be valid, wait for 2.5 seconds, and then ask for confirmation 
    before submission. This allows for additional URL validation.*/
    let $btn = $('#saveBtn');
    $btn.html('<i class="fa fa-circle-o-notch fa-spin fa-3x"></i>');
    $btn.addClass('disabled');
    setTimeout(() => {
        //If URL is valid, open confirmation modal
        if (lastUrl) $('#modal-confirm').modal('open');
        $btn.html('Save Pin');
        $btn.removeClass('disabled');
    }, 2500);
}

//After confirmation, save pin to the DB
function performSave() {
    let pinCaption = $('#newPinCaption');
    let pinSrc = $('#newPinUrl');
    //Final validation check
    if (pinCaption.hasClass('invalid') || pinSrc.hasClass('invalid')) return $('#modal-confirm').modal('close');
    
	//Update UI while save is performed
	progress('show');
	$('#modal-confirm a').addClass('disabled');
	$('#modal-confirm h5').html('Saving...');
	
	//Update the database (add pin to the user's collection)
	let apiUrl = `/api/pin/${encodeURIComponent(pinSrc.val())}/${encodeURIComponent(pinCaption.val())}`;
	ajaxFunctions.ajaxRequest('PUT', apiUrl, (data) => {
	    //Restore UI
	    $('#modal-confirm').modal('close');
	    $('#modal-confirm a').removeClass('disabled');
	    $('#modal-confirm h5').html('Are you sure?');
	    cancelPin();
	    Materialize.toast('New pin saved!');
	    return console.log(data);
	});
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
