/*jshint browser: true, esversion: 6*/
/* global $, ajaxFunctions, checkLoginStatus, Materialize */
'use strict';

$(document).ready(() => {
    //Automatically load and display all pins
    ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', '/api/allPins/', showAllPins));

    //Check to see if user is logged in. If so, logged-in view is generated.
    checkLoginStatus();

    //When navbar title is clicked, scroll to top of page
    $('.brand-logo').click(() => scroll(0, 0));
});

//Show and hide progress bar
function progress(operation) {
    if (operation === 'show') $('.progress').removeClass('hidden');
    else $('.progress').addClass('hidden');
}

//Show an error message
function errorMsg(message) {
    Materialize.toast(message, 3000, 'error');
}

//Display all pins as Isotope elements
function showAllPins(data) {
    progress('show');
    let pins = JSON.parse(data);
    let isotopeCode = '';
    let modalCode = '';
    pins.forEach((e, i) => {
        isotopeCode += `<div class="grid-item">
                            <img src="${e.url}" alt="${e.caption}">
                            <h6 class="center">${e.caption}</h6>
                            <h6 class="right">
                                <a class="dynLink tooltipped" data-link="like" data-owner="${e.ownerId}" data-url="${e.url}" 
                                onclick="errorMsg('Please log in to like ${e.caption}')
                                data-tooltip="Like this pin">
                                    <i class="fa fa-heart-o"></i>&nbsp;
                                </a>
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
            $('.pins').append(isotopeCode);
            $('.modals').append(modalCode);
            $('.tooltipped').tooltip();
            //Smooth entrance
            setTimeout(() => {
                $('.pins').isotope({
                    itemSelector: '.grid-item'
                });
                $('.pins').addClass('fadeIn').removeClass('hidden');
                $('#loading').fadeOut().remove();
                progress('hide');
            }, 1000);
        }
    });
}
