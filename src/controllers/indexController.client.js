/*jshint browser: true, esversion: 6*/
/* global $, ajaxFunctions, checkLoginStatus, generatePin, Materialize */
'use strict';

$(document).ready(() => {
    //Automatically load and display all pins
    ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', '/api/allPins/', showAllPins));

    //When navbar title is clicked, shuffle the grid
    $('.brand-logo').click(() => $('.pins').isotope('shuffle'));
});

//Display pin in big-image modal
function bigImg(img) {
    $('#bigImg').attr('src', img.attr('src'));
    $('#bigImgCaption').html(img.attr('alt'));
    $('#bigImgOwner').html(`Pinned by ${img.attr('data-owner-name')}`);
    $('#modal-bigImg').modal('open');
}

//Show an error message
function errorMsg(message = 'An error has occurred. Please try again later.') {
    Materialize.toast(message, 3000, 'error');
}

//Show/hide progress bar, which can be determinate or indeterminate
function progress(operation, indeterminate) {
    if (operation === 'show') {
        if (indeterminate) $('.bar').removeClass('determinate').addClass('indeterminate');
        $('.progress').removeClass('hidden');
    }
    else {
        $('.progress').addClass('hidden');
        if (indeterminate) $('.bar').removeClass('indeterminate').addClass('determinate');
    }
}

//Display all pins as Isotope elements
function showAllPins(data) {
    progress('show');
    let pins = JSON.parse(data);
    let loadedCount = 0;
    let loadedPercent = 0;
    pins.forEach((e, i) => {
        //Generate code for grid
        $('.pins').append(generatePin(e.url, e.caption, e.ownerId, e.ownerName, e.likes));
        //When at the end of the list (all pin HTML generated), update UI
        if (i === pins.length - 1) {
            $('#loading').fadeOut().remove();
            //Initialize Isotope grid
            let $grid = $('.pins').isotope({
                itemSelector: '.grid-item',
                masonry: {
                    isFitWidth: true
                }
            });
            //Update progress bar and Isotope layout after each image loads
            $grid.imagesLoaded().progress(() => {
                loadedCount++;
                loadedPercent = Math.round((loadedCount / pins.length) * 100);
                $('.determinate').css('width', `${loadedPercent}%`);
                $grid.isotope('layout');
            });
            //Check to see if user is logged in. If so, logged-in view is generated.
            checkLoginStatus();
            //Initialize tooltips and modals
            $('.tooltipped').tooltip();
            $('#modal-bigImg').modal();
            //Click-handler to open pins
            $('.grid-item img').click(function() {
                bigImg($(this));
            });
            //Wait for all images to load before hiding progress bar
            $grid.imagesLoaded(() => progress('hide'));
        }
    });
}
