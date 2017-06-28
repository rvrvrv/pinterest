/*jshint browser: true, esversion: 6*/
/* global $, ajaxFunctions, checkLoginStatus, generatePin, Materialize */
'use strict';

$(document).ready(function () {
    //Automatically load and display all pins
    ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', '/api/allPins/', showAllPins));

    //When navbar title is clicked, scroll to top of page
    $('.brand-logo').click(function () {
        return scroll(0, 0);
    });
});

//Display pin in big-image modal
function bigImg(img) {
    $('#bigImg').attr('src', img.attr('src'));
    $('#bigImgCaption').html(img.attr('alt'));
    $('#bigImgOwner').html('Pinned by ' + img.attr('data-owner-name'));
    $('#modal-bigImg').modal('open');
}

//Show an error message
function errorMsg() {
    var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'An error has occurred. Please try again later.';

    Materialize.toast(message, 3000, 'error');
}

//Show/hide progress bar, which can be determinate or indeterminate
function progress(operation, indeterminate) {
    if (operation === 'show') {
        if (indeterminate) $('.bar').removeClass('determinate').addClass('indeterminate');
        $('.progress').removeClass('hidden');
    } else {
        $('.progress').addClass('hidden');
        if (indeterminate) $('.bar').removeClass('indeterminate').addClass('determinate');
    }
}

//Display all pins as Isotope elements
function showAllPins(data) {
    progress('show');
    var pins = JSON.parse(data);
    var loadedCount = 0;
    var loadedPercent = 0;
    pins.forEach(function (e, i) {
        //Generate code for grid
        $('.pins').append(generatePin(e.url, e.caption, e.ownerId, e.ownerName, e.likes));
        //When at the end of the list (all pin HTML generated), update UI
        if (i === pins.length - 1) {
            $('#loading').fadeOut().remove();
            //Initialize Isotope grid
            var $grid = $('.pins').isotope({
                itemSelector: '.grid-item',
                masonry: {
                    isFitWidth: true
                }
            });
            //Update progress bar and Isotope layout after each image loads
            $grid.imagesLoaded().progress(function () {
                loadedCount++;
                loadedPercent = Math.round(loadedCount / pins.length * 100);
                $('.determinate').css('width', loadedPercent + '%');
                $grid.isotope('layout');
            });
            //Check to see if user is logged in. If so, logged-in view is generated.
            checkLoginStatus();
            //Initialize tooltips and modals
            $('.tooltipped').tooltip();
            $('#modal-bigImg').modal();
            //Click-handler to open pins
            $('.grid-item img').click(function () {
                bigImg($(this));
            });
            //Wait for all images to load before hiding progress bar
            $grid.imagesLoaded(function () {
                return progress('hide');
            });
        }
    });
}