/*jshint browser: true, esversion: 6*/
/* global $, ajaxFunctions, localStorage, Materialize */
'use strict';

//Show and hide progress bar
function progress(operation) {
    if (operation === 'show') $('.progress').removeClass('hidden');
    else $('.progress').addClass('hidden');
}

//When navbar title is clicked, scroll to top of page
$('.brand-logo').click(() => scroll(0, 0));

/*
//Restore modal buttons upon close
function restoreBtns() {
    //Only perform this operation if 'Confirm Removal' button exists
    if ($('.req-btn').hasClass('confirm-rm-btn')) {
        let btn = $('.confirm-rm-btn');
        btn.html('Remove Pin');
        btn.attr('onclick', 'removePin(this)');
        btn.removeClass('red white-text waves-light confirm-rm-btn').addClass('waves-red');
    }
}

//Helper to open modals from collapsibles
function openModal(link, trueOwner) {
    let owner = trueOwner ? link.data('user') : localStorage.getItem('rv-pinclub-id');
    let pinModal = $(`.modal-pin[data-pin="${link.data('pin')}"][data-owner="${owner}"]`);
    pinModal.modal('open');
}

//Handle 'Remove Pin' link click
function removePin(link, confirmed) {
    //First, ask for user confirmation
    if (!confirmed) {
        $(link).removeClass('waves-red').addClass('red white-text waves-light confirm-rm-btn');
        $(link).html('Confirm Removal');
        $(link).attr('onclick', 'removePin(this, true)');
    }
    else {
        progress('show');
        //When confirmed, delete pin from DB
        let pin = $(link).data('pin');
        let apiUrl = `/api/pin/${pin}/${localStorage.getItem('rv-pinclub-id')}`;
        ajaxFunctions.ajaxRequest('DELETE', apiUrl, (data) => {
            console.log(data);
            //Remove pin from carousel
            $(`.carousel-item[data-pin="${pin}"]`).remove();
            $('.carousel').removeClass('initialized');
            $('.carousel').carousel();
            //Close and remove pin modal and tooltip
            $(`.modal[data-pin="${pin}"]`).modal('close');
            $(`.modal[data-pin="${pin}"]`).remove();
            $(link).tooltip('remove');
            //Notify the user
            Materialize.toast(`${$(link).data('title')} has been removed from the collection!`, 5000);
            progress('hide');
        });
    }
}
*/
