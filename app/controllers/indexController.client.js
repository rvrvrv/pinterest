/*jshint browser: true, esversion: 6*/
/* global $, ajaxFunctions, checkLoginStatus, generatePin, Materialize */
'use strict';

$(document).ready(() => {
    //Automatically load and display all pins
    ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', '/api/allPins/', showAllPins));

    //When navbar title is clicked, scroll to top of page
    $('.brand-logo').click(() => scroll(0, 0));
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
    let isotopeCode = '';
    pins.forEach((e, i) => {
        //Update progress bar
        $('.determinate').css('width', `${Math.round((i / (pins.length - 1) * 100))}%`);
        //Generate code for grid
        isotopeCode += generatePin(e.url, e.caption, e.ownerId, e.ownerName, e.likes);
        //When at the end of the list, initialize all generated code
        if (i === pins.length - 1) {
            $('#loading').fadeOut().remove();
            //Check to see if user is logged in. If so, logged-in view is generated.
            checkLoginStatus();
            //Add and initialize generated code
            $('.pins').append(isotopeCode);
            $('.tooltipped').tooltip();
            $('#modal-bigImg').modal();
            //After all images are loaded, initialize the grid
            let $grid = $('.pins').imagesLoaded(() => {
                $grid.isotope({
                    itemSelector: '.grid-item',
                    stagger: 50,
                });
                $grid.isotope('shuffle');
                $grid.removeClass('hidden');
            });
            //Click-handler to open pins
            $('.grid-item img').click(function() {
                bigImg($(this));
            });
            progress('hide');
        }
    });
}
