// Like (or unlike) a pin
function likePin(link, unlike) {
  // Disable link
  $(link).css('pointer-events', 'none');
  // Store pin information for API call
  const likeReq = {
    url: encodeURIComponent($(link).data('url')),
    owner: $(link).data('owner')
  };

  // Make the appropriate API call
  const method = unlike ? 'DELETE' : 'PUT';

  ajaxFunctions.ajaxRequest(method, `/api/like/${JSON.stringify(likeReq)}`, (res) => {
    if (res === 'error') return errorMsg('An error has occurred.', link);

    const likeCount = $(link).next();

    // After trying to unlike pin
    if (unlike) {
      if (res === 'no') return errorMsg('You don\'t like this pin yet!', link);
      // If unlike is successful, notify the user and update UI
      Materialize.toast('Unliked it!', 2000);
      likeCount.html(`${+likeCount.text() - 1}`);
      return likeBtnSwitch(link);
    }
    // After trying to like pin
    if (res === 'exists') return errorMsg('You already like this pin!', link);
    // If like is successful, notify the user and update UI
    Materialize.toast('Liked it!', 2000);
    likeCount.html(`${+likeCount.text() + 1}`);
    return likeBtnSwitch(link, true);
  });
}

// Switch like button (to like or unlike)
function likeBtnSwitch(link, makeUnlike) {
  $(link).unbind('click');
  $(link).css('pointer-events', 'unset');
  if (makeUnlike) {
    $(link).parents('.grid-item').addClass('liked');
    $(link).tooltip('remove');
    $(link).attr('data-tooltip', 'Unlike this pin');
    $(link).tooltip();
    $(link).find('i').removeClass('fa-heart-o').addClass('fa-heart');
    $(link).click(() => likePin($(link), true));
    $(link).data('link', 'unlike');
  } else {
    $(link).parents('.grid-item').removeClass('liked');
    $(link).tooltip('remove');
    $(link).attr('data-tooltip', 'Like this pin');
    $(link).tooltip();
    $(link).find('i').removeClass('fa-heart').addClass('fa-heart-o');
    $(link).click(() => likePin($(link)));
  }
}
