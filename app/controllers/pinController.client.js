/*jshint browser: true, esversion: 6*/
/* global $, ajaxFunctions, bigImg, errorMsg, likePin, Materialize, progress */
'use strict';

var lastUrl = void 0;

//Generate HTML for pin in grid
function generatePin(url, caption, ownerId, ownerName, likes, loggedIn, updateGrid) {
    var divClass = void 0,
        delBtn = void 0,
        onClick = void 0;
    //If loggedIn, set properties for user's newly created pin
    if (loggedIn) {
        divClass = 'grid-item yours';
        delBtn = generateDelBtn(url, caption, ownerId);
        onClick = '';
    }
    //If not loggedIn, set default properties
    else {
            divClass = 'grid-item';
            delBtn = '';
            onClick = 'errorMsg(\'Please log in to like ' + caption + '\')';
        }
    //Outputted HTML code
    var pinHtml = '<div class="' + divClass + '" data-owner="' + ownerId + '" data-url="' + url + '">\n                    <img src="' + url + '" alt="' + caption + '" data-owner-name="' + ownerName + '"\n                    onerror="this.onerror=null;this.src=\'../public/img/badImg.jpg\';">\n                    <h6 class="center">' + caption + '</h6>\n                        <h6>\n                            ' + delBtn + '\n                            <span class="right">\n                                <a class="dynLink tooltipped" data-link="like" data-owner="' + ownerId + '" data-url="' + url + '" \n                                data-tooltip="Like this pin" onclick="' + onClick + '">\n                                <i class="fa fa-heart-o"></i>&nbsp;</a>\n                                <span class="likes">' + likes + '</span>\n                            </span>\n                        </h6>\n                    </div>';
    //If called from performSave function, update the grid
    if (updateGrid) {
        $('.pins').isotope('insert', $(pinHtml));
        $('.tooltipped').tooltip();
        //Set click-handlers
        $('img[data-owner="' + ownerId + '"][data-url="' + url + '"]').click(function () {
            bigImg($(this));
        });
        $('a[data-owner="' + ownerId + '"][data-url="' + url + '"]').click(function () {
            likePin(this);
        });
    }
    //If called from showAllPins (indexController.client.js), return html code only
    else return pinHtml;
}

//Generate HTML for delete-pin buttons in grid
function generateDelBtn(url, caption, ownerId) {
    return '<span class="left">\n                <a class="tooltipped" data-caption="' + caption + '" \n                data-owner="' + ownerId + '" data-url="' + url + '" \n                onclick="deletePin(this)" data-tooltip="Delete this pin">\n                <i class="fa fa-minus-square-o"></i></a>\n            </span>';
}

//Update UI when image cannot be found
function badImg(url) {
    //Insert placeholder image
    $('#newPinImg').attr('src', '../public/img/badImg.jpg');
    //Notify the user
    errorMsg('No image found at \'' + url + '\'');
    $('#newPinUrl').removeClass('valid').addClass('invalid');
    //Prevent user from saving a bad image URL
    lastUrl = false;
}

//Validate URL field and update image
function updateImg() {
    var $url = $('#newPinUrl');

    //If URL field is empty, don't do anything
    if ($url.val() === '') return;

    //Otherwise, continue with validation
    var thisUrl = $url.val().trim();

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
    var caption = $('#newPinCaption').val();
    //Check for blank/invalid fields
    if (!caption || $('#newPinCaption').hasClass('invalid')) return errorMsg('Please enter a valid caption for your pin.');
    if (!lastUrl) return errorMsg('Please enter a valid image URL.');

    /*If fields appear to be valid, wait for 0.5 seconds, and then ask for confirmation 
    before submission. This allows for additional URL validation.*/
    var $btn = $('#saveBtn');
    $btn.html('<i class="fa fa-circle-o-notch fa-spin fa-3x"></i>');
    $btn.addClass('disabled');
    setTimeout(function () {
        //If URL is valid, open confirmation modal
        if (lastUrl) $('#modalConfirmSave').modal('open');
        $btn.html('Save Pin');
        $btn.removeClass('disabled');
    }, 500);
}

//After confirmation, save pin to the DB
function performSave() {
    var pinCaption = $('#newPinCaption');
    var pinUrl = $('#newPinUrl');
    //Final validation check
    if (pinCaption.hasClass('invalid') || pinUrl.hasClass('invalid')) return $('#modalConfirmSave').modal('close');

    //Update UI while save is performed
    progress('show', true);
    $('#modalConfirmSave a').addClass('disabled');
    $('#modalConfirmSave h5').html('Saving...');

    //Update the database (add pin to the user's collection)
    var apiUrl = '/api/pin/' + encodeURIComponent(pinUrl.val()) + '/' + encodeURIComponent(pinCaption.val());
    ajaxFunctions.ajaxRequest('PUT', apiUrl, function (result) {
        //Regardless of result, close and restore the confirmation modal
        $('#modalConfirmSave').modal('close');
        setTimeout(function () {
            $('#modalConfirmSave a').removeClass('disabled');
            $('#modalConfirmSave h5').html('Are you sure you would like to save this pin?');
        }, 1000);
        progress('hide', true);
        //If an error occured, notify the user
        if (result === 'error') return errorMsg();
        if (result === 'exists') return errorMsg('You\'ve already pinned this image!');
        //Otherwise, close the modal and update the UI
        resetPinModal();
        var data = JSON.parse(result);
        generatePin(pinUrl.val(), pinCaption.val(), data.ownerId, data.ownerName, 0, true, true);
        Materialize.toast('New pin saved!', 3000);
    });
}

//Reset the new-pin modal
function resetPinModal() {
    $('#modal-newPin').modal('close');
    setTimeout(function () {
        $('input').val('');
        $('input').removeClass('invalid valid');
        $('#newPinImg').attr('src', '../public/img/galaxy.jpg');
    }, 1000);
    lastUrl = '';
}

//Initial pin-deletion attempt from user
function deletePin(pin) {
    //Update and display delete-confirmation modal
    $('#delMsg').html('Are you sure you want to delete ' + $(pin).data('caption') + '?');
    $('#confirmDelBtn').unbind('click');
    $('#confirmDelBtn').click(function () {
        return performDelete($(pin).data('url'));
    });
    $('#modalConfirmDelete').modal('open');
}

//After confirmation, delete the pin in the DB
function performDelete(pinUrl) {
    ajaxFunctions.ajaxRequest('DELETE', '/api/pin/' + encodeURIComponent(pinUrl), function (result) {
        //If an error occured, notify the user
        if (result === 'error') return errorMsg();
        if (result === 'no') return errorMsg('That isn\'t your pin!');
        //Otherwise, close the modal and update the UI
        $('#modalConfirmDelete').modal('close');
        Materialize.toast('Your pin has been deleted!', 3000);
        $('.pins').isotope('remove', $('.grid-item[data-owner="' + result + '"][data-url="' + pinUrl + '"]'));
    });
}