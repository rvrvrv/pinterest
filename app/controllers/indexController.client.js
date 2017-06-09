/*jshint browser: true, esversion: 6*/
/* global $, ajaxFunctions, checkLoginStatus, progress */
'use strict';

$(document).ready(() => {
    //Check to see if user is logged in. If so, logged-in view is generated.
    checkLoginStatus();

    //Automatically show all pins on index page
    //ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', '/api/allPins/', getAllPins));
    
    
    //When navbar title is clicked, scroll to top of page
    $('.brand-logo').click(() => scroll(0, 0));
});


//Retrieve and display all pins from DB
function getAllPins(data) {
    let pins = JSON.parse(data);
    let masonryCode = '';
    let modalCode = '';
    pins.forEach((e, i) => {
        // masonryCode += `<a class="carousel-item tooltipped dynLink" data-book="${e.id}" data-link="#modal-${i}" data-tooltip="${e.title}" data-delay="600">
        //         <img src="${e.thumbnail}"></a>`;
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
    });
    $('.pins').append(masonryCode);
    $('.modals').append(modalCode);
    $('.tooltipped').tooltip();
    progress('hide');
}
