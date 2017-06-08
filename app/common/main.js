/*jshint browser: true, esversion: 6*/
/* global $, ajaxFunctions, localStorage, location, Materialize */
'use strict';

//Show and hide progress bar
function progress(operation) {
    if (operation === 'show') $('.progress').removeClass('hidden');
    else $('.progress').addClass('hidden');
}

//Restore modal buttons upon close
function restoreBtns() {
    //Only perform this operation if 'Confirm Removal' button exists
    if ($('.req-btn').hasClass('confirm-rm-btn')) {
        let btn = $('.confirm-rm-btn');
        btn.html('Remove Book');
        btn.attr('onclick', 'removeBook(this)');
        btn.removeClass('red white-text waves-light confirm-rm-btn').addClass('waves-red');
    }
}

//Helper to open modals from collapsibles
function openModal(link, trueOwner) {
    let owner = trueOwner ? link.data('user') : localStorage.getItem('rv-bookclub-id');
    let bookModal = $(`.modal-book[data-book="${link.data('book')}"][data-owner="${owner}"]`);
    bookModal.modal('open');
}

//Handle 'Remove Book' link click
function removeBook(link, confirmed) {
    //First, ask for user confirmation
    if (!confirmed) {
        $(link).removeClass('waves-red').addClass('red white-text waves-light confirm-rm-btn');
        $(link).html('Confirm Removal');
        $(link).attr('onclick', 'removeBook(this, true)');
    }
    else {
        progress('show');
        //When confirmed, delete book from DB
        let book = $(link).data('book');
        let apiUrl = `/api/book/${book}/${localStorage.getItem('rv-bookclub-id')}`;
        ajaxFunctions.ajaxRequest('DELETE', apiUrl, (data) => {
            console.log(data);
            //Remove book from carousel
            $(`.carousel-item[data-book="${book}"]`).remove();
            $('.carousel').removeClass('initialized');
            $('.carousel').carousel();
            //Close and remove book modal and tooltip
            $(`.modal[data-book="${book}"]`).modal('close');
            $(`.modal[data-book="${book}"]`).remove();
            $(link).tooltip('remove');
            //Notify the user
            Materialize.toast(`${$(link).data('title')} has been removed from the collection!`, 5000);
            progress('hide');
        });
    }
}

//When navbar title is clicked, scroll to top of page
$('.brand-logo').click(() => scroll(0, 0));
