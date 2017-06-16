/*jshint browser: true, esversion: 6*/
/* global $, ajaxFunctions, errorMsg, Materialize, progress */
'use strict';

let lastUrl;

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
        if (lastUrl) $('#modal-confirm').modal('open');
        $btn.html('Save Pin');
        $btn.removeClass('disabled');
    }, 500);
}

//After confirmation, save pin to the DB
function performSave() {
    let pinCaption = $('#newPinCaption');
    let pinUrl = $('#newPinUrl');
    //Final validation check
    if (pinCaption.hasClass('invalid') || pinUrl.hasClass('invalid')) return $('#modal-confirm').modal('close');
    
	//Update UI while save is performed
	progress('show');
	$('#modal-confirm a').addClass('disabled');
	$('#modal-confirm h5').html('Saving...');
	
	//Update the database (add pin to the user's collection)
	let apiUrl = `/api/pin/${encodeURIComponent(pinUrl.val())}/${encodeURIComponent(pinCaption.val())}`;
	ajaxFunctions.ajaxRequest('PUT', apiUrl, (data) => {
	    //Regardless of result, close and restore the confirmation modal
	    $('#modal-confirm').modal('close');
	    setTimeout(() => { 
	        $('#modal-confirm a').removeClass('disabled');
	        $('#modal-confirm h5').html('Are you sure you would like to save this pin?');
	    }, 1000);
	    progress('hide');
        //If an error occured, notify the user
        if (data === 'error') return Materialize.toast('An error has occurred. Please try again later.', 3000, 'error');
        if (data === 'exists') return Materialize.toast('You\'ve already pinned this image!', 3000, 'error');
        //Otherwise, close the modal and update the UI
        resetPinModal();
        let result = JSON.parse(data);
        console.log(result);
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
