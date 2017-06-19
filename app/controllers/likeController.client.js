/*jshint browser: true, esversion: 6*/
/* global $, ajaxFunctions, errorMsg, localStorage, Materialize, progress */
'use strict';


//Like (or unlike) a pin
function likePin(link, unlike) {
    console.log('link at likePin: ', link);
    //Store pin information for API call
    let likeReq = {
        url: encodeURIComponent($(link).data('url')),
        owner: $(link).data('owner')
    };

    //Make the appropriate API call
    let method = unlike ? 'DELETE' : 'PUT';

    ajaxFunctions.ajaxRequest(method, `/api/like/${JSON.stringify(likeReq)}`, (res) => {
        if (res === 'error') return errorMsg('An error has occured.');

        let likeCount = $(link).next();

        //After trying to unlike pin
        if (unlike) {
            if (res === 'no') return errorMsg('You don\'t like this pin yet!');
            //If unlike is successful, notify the user and update UI
            Materialize.toast('Unliked it!', 2000);
            likeCount.html(`${+likeCount.text() - 1}`);
            likeBtnSwitch(link);
        }
        //After trying to like pin
        else {
            if (res === 'exists') return errorMsg('You already like this pin!');
            //If like is successful, notify the user and update UI
            Materialize.toast('Liked it!', 2000);
            likeCount.html(`${+likeCount.text() + 1}`);
            likeBtnSwitch(link, true);
        }
    });
}

//Switch like button (to like or unlike)
function likeBtnSwitch(link, makeUnlike) {
    $(link).unbind('click');
    if (makeUnlike) {
        $(link).tooltip('remove');
        $(link).attr('data-tooltip', 'Unlike this pin');
        $(link).tooltip();
        $(link).removeClass('liked');
        $(link).find('i').removeClass('fa-heart-o').addClass('fa-heart');
        $(link).click(() => likePin($(link), true));
    }
    else {
        $(link).tooltip('remove');
        $(link).attr('data-tooltip', 'Like this pin');
        $(link).tooltip();
        $(link).addClass('liked');
        $(link).find('i').removeClass('fa-heart').addClass('fa-heart-o');
        $(link).click(() => likePin($(link)));
    }
}

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
    }
    else {
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
