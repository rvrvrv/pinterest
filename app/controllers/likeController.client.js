/*jshint browser: true, esversion: 6*/
/* global $, ajaxFunctions, errorMsg, Materialize */
'use strict';

//Like (or unlike) a pin

function likePin(link, unlike) {
    //Store pin information for API call
    var likeReq = {
        url: encodeURIComponent($(link).data('url')),
        owner: $(link).data('owner')
    };

    //Make the appropriate API call
    var method = unlike ? 'DELETE' : 'PUT';

    ajaxFunctions.ajaxRequest(method, '/api/like/' + JSON.stringify(likeReq), function (res) {
        if (res === 'error') return errorMsg('An error has occured.');

        var likeCount = $(link).next();

        //After trying to unlike pin
        if (unlike) {
            if (res === 'no') return errorMsg('You don\'t like this pin yet!');
            //If unlike is successful, notify the user and update UI
            Materialize.toast('Unliked it!', 2000);
            likeCount.html('' + (+likeCount.text() - 1));
            likeBtnSwitch(link);
        }
        //After trying to like pin
        else {
                if (res === 'exists') return errorMsg('You already like this pin!');
                //If like is successful, notify the user and update UI
                Materialize.toast('Liked it!', 2000);
                likeCount.html('' + (+likeCount.text() + 1));
                likeBtnSwitch(link, true);
            }
    });
}

//Switch like button (to like or unlike)
function likeBtnSwitch(link, makeUnlike) {
    $(link).unbind('click');
    if (makeUnlike) {
        $(link).parents('.grid-item').addClass('liked');
        $(link).tooltip('remove');
        $(link).attr('data-tooltip', 'Unlike this pin');
        $(link).tooltip();
        $(link).find('i').removeClass('fa-heart-o').addClass('fa-heart');
        $(link).click(function () {
            return likePin($(link), true);
        });
        $(link).data('link', 'unlike');
    } else {
        $(link).parents('.grid-item').removeClass('liked');
        $(link).tooltip('remove');
        $(link).attr('data-tooltip', 'Like this pin');
        $(link).tooltip();
        $(link).find('i').removeClass('fa-heart').addClass('fa-heart-o');
        $(link).click(function () {
            return likePin($(link));
        });
    }
}