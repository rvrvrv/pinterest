/*jshint browser: true, esversion: 6*/
/* global $, ajaxFunctions, checkLoginStatus, Materialize */
'use strict';

$(document).ready(() => {
    //Automatically load and display all pins
    ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', '/api/allPins/', showAllPins));

    //When navbar title is clicked, scroll to top of page
    $('.brand-logo').click(() => scroll(0, 0));
});

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

//Show an error message
function errorMsg(message) {
    Materialize.toast(message, 3000, 'error');
}

//Display all pins as Isotope elements
function showAllPins(data) {
    progress('show');
    let pins = JSON.parse(data);
    console.log(pins);
    let isotopeCode = '';
    let modalCode = '';
    pins.forEach((e, i) => {
        //Update progress bar
        $('.determinate').css('width', `${Math.round((i / (pins.length - 1) * 100))}%`);
        //Generate code for grid
        isotopeCode += `<div class="grid-item">
                            <img src="${e.url}" alt="${e.caption}">
                            <h6 class="center">${e.caption}</h6>
                            <h6 class="right">
                                <a class="dynLink tooltipped" data-link="like" data-owner="${e.ownerId}" data-url="${e.url}" 
                                onclick="errorMsg('Please log in to like ${e.caption}')" data-tooltip="Like this pin">
                                <i class="fa fa-heart-o"></i>&nbsp;</a>
                                <span class="likes">${e.likes}</span>
                            </h6>
                        </div>`;
        // modalCode += `
        //         <div id="modal-${i}" class="modal modal-book" data-book="${e.id}" data-owner="${e.owner}">
        //             <div class="modal-content">
        //                 <h4>${e.title}</h4>
        //                 <h5 class="authors"><i class="fa fa-caret-right"></i>&nbsp;${e.authors}</h6>
        //                 <br>
        //                 <br>
        //                 <div class="row">
        //                     <div class="col m4 hide-on-small-only">
        //                         <a href="${e.link}" target="_blank">
        //                             <img src="${e.thumbnail}">
        //                         </a>
        //                     </div>
        //                     <div class="col m8">
        //                         <p>${e.description}</p>
        //                     </div>
        //                 </div>
        //             </div>
        //             <div class="modal-fixed-footer right">
        //                 <a class="modal-action modal-close waves-effect waves-light btn-flat">Back</a>
        //                 <a class="req-btn waves-effect waves-green btn-flat tooltipped" data-tooltip="Request ${e.title}" 
        //                     data-book="${e.id}" data-owner="${e.owner}" data-title="${e.title}" data-modal="${i}"
        //                     onclick="reqTrade(this, true)">Request Trade</a>
        //             </div>
        //         </div>`;

        //When at the end of the list, initialize all generated code
        if (i === pins.length - 1) {
            $('#loading').fadeOut().remove();
            //Check to see if user is logged in. If so, logged-in view is generated.
            checkLoginStatus();
            //Add generated code
            $('.pins').append(isotopeCode);
            $('.modals').append(modalCode);
            $('.tooltipped').tooltip();
            //Initialize the grid
            let $grid = $('.pins').imagesLoaded(() => {
                $grid.isotope({
                    itemSelector: '.grid-item',
                    stagger: 50,
                });
                $grid.isotope('shuffle');
                $grid.removeClass('hidden');
            });
            progress('hide');
        }
    });
}
