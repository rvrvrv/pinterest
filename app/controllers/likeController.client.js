/*jshint browser: true, esversion: 6*/
/* global $, ajaxFunctions, FB, localStorage, Materialize, progress, tradeRequest */
'use strict';

//Handle 'Accept Trade' / 'Reject Trade' link click
function answerTrade(link, accept) {
    progress('show');
    
    //Store book trade information
    let tradeRequest = {
        book: $(link).data('book'),
        owner: localStorage.getItem('rv-bookclub-id'),
        user: $(link).data('user')
    };
    
    //Make the appropriate API call
    let method = accept ? 'PUT' : 'DELETE';
    
    ajaxFunctions.ajaxRequest(method, `/api/trade/${JSON.stringify(tradeRequest)}`, (res) => {
        //After DB changes are complete, update UI
        if (accept) {
            Materialize.toast('Trade accepted!', 4000);
            let reqBtn = $(`.req-btn[data-book="${tradeRequest.book}"][data-owner="${tradeRequest.owner}"`);
            reqBtn.html('Traded!');
            reqBtn.addClass('disabled');
        }
        else {
            Materialize.toast('Trade rejected!', 4000);
        }
        $(link).remove();
        $($(link).children()).tooltip('remove');
        $('.collapsible').collapsible('close', 0);
        requestCount('incoming', -1);
        progress('hide');
    });
}


//Update Trade request button and collapsible
function tradeReqUI(link, requested) {
    
    //Store book information
    let title = $(link).data('title');
    let bookId = $(link).data('book');
    let owner = $(link).data('owner');
    let modalLink = `#modal-${$(link).data('modal')}`;
    
    if (requested) {
        //Update link in book modal
        $(link).html('Cancel Request');
        $(link).data('tooltip', 'Cancel trade request');
        $(link).attr('onclick', 'reqTrade(this)');
        $(link).removeClass('waves-green').addClass('waves-orange');
        //Create link in outgoing requests collapsible
        requestCount('outgoing', 1);
        $('#outgoingList').append(`
            <a class="collection-item blue-text tooltipped" data-book="${bookId}" 
            data-owner="${owner}" data-tooltip="View ${title} and/or cancel request"
            onclick="$('${modalLink}').modal('open');">${title}</a>`);
    } else {
        //Update link in book modal
        $(link).html('Request Trade');
        $(link).data('tooltip', `Request ${title}`);
        $(link).attr('onclick', 'reqTrade(this, true)');
        $(link).removeClass('waves-orange').addClass('waves-green');
        //Delete link in outgoing requests collapsible
        requestCount('outgoing', -1);
        $(`.collection-item[data-book="${bookId}"][data-owner="${owner}"]`).remove();
    }
    $('.tooltipped').tooltip();
}

//Handle 'Request Trade' / 'Cancel Request' link click
function reqTrade(link, interested) {
    
    //Store book trade information
    let tradeRequest = {
        book: $(link).data('book'),
        owner: $(link).data('owner'),
        user: localStorage.getItem('rv-bookclub-id'),
        title: $(link).data('title')
    };

    //First, ensure the user isn't requesting their own book
    if (tradeRequest.owner == tradeRequest.user)
        return Materialize.toast('This is your book!', 3000, 'error');

    //If the trade request is valid, update UI
    $(link).addClass('disabled');
    progress('show');

    //Make the appropriate API call
    let method = interested ? 'POST' : 'DELETE';

    ajaxFunctions.ajaxRequest(method, `/api/trade/${JSON.stringify(tradeRequest)}`, (res) => {
        //After DB changes are complete, update UI
        if (interested) {
            Materialize.toast('Trade requested!', 4000);
            tradeReqUI(link, true);
        }
        else {
            Materialize.toast('Trade request cancelled!', 4000);
            tradeReqUI(link);
        }
        $(link).removeClass('disabled');
        progress('hide');
        setTimeout(() => $('.modal').modal('close'), 500);
    });

}

//Add or subtract from request count
function requestCount(reqType, num) {
    let count = +$(`#${reqType}Count`).html() + num;
    //Update count
    $(`#${reqType}Count`).html(count);
    //When updating incoming requests, update the badge color as necessary
    if (reqType === 'incoming') {
        if (count > 0)
            $(`#incomingCount`).addClass('new light-blue darken-3');
        if (count === 0)
            $(`#incomingCount`).removeClass('new light-blue darken-3');
    }
    
}
