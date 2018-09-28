let lastUrl;

// Filter pins by button-click
function filterPinsByBtn(btn) {
  // If active filter is clicked, don't do anything
  if ($(btn).hasClass('active')) return;
  // Otherwise, update filter buttons and filter the pins
  $('.filter-btn.active').removeClass('active');
  $(btn).addClass('active');
  $('.pins').isotope({
    filter: $(btn).data('filter')
  });
}

// Filter pins by link-click
function filterPinsByLink(val) {
  // If filter buttons are available, use/update them where applicable
  if ($('#filters').length) {
    if (val === '*') return $('#allPinsBtn').click();
    $('.filter-btn.active').removeClass('active');
  }
  $('.pins').isotope({ filter: val });
  // If unauthenticated user filters one person's pins, show them how to view all pins
  if (!$('#filters').length && val !== '*') {
    setTimeout(() => Materialize.toast("To view all pins, click 'Almost Pinterest'<br>at the top of this page.", 4000), 2000);
  }
}

// Generate HTML for pin in grid
function generatePin(url, caption, ownerId, ownerName, likes, loggedIn, updateGrid) {
  let divClass;
  let bottomLeft;
  let onClick;
  // If user is logged in, set properties for their newly created pin
  if (loggedIn) {
    divClass = 'grid-item yours';
    bottomLeft = generateDelBtn(url, caption, ownerId, true);
    onClick = '';
  } else {
  // If user isn't logged in, set default properties
    divClass = 'grid-item';
    bottomLeft = `
      <span class="left owner-filter">
        <a data-caption="${caption}" data-owner="${ownerId}" data-url="${url}">${ownerName}</a>
      </span>`;
    onClick = `errorMsg('Please log in to like ${caption}')`;
  }
  // Outputted HTML code
  const pinHtml = `
    <div class="${divClass}" data-owner="${ownerId}" data-url="${url}">
      <img src="${url}" alt="${caption}" data-owner-name="${ownerName}" onerror="this.onerror=null;this.src='../public/img/badImg.jpg';" />
      <h6 class="center">${caption}</h6>
      <h6>
        ${bottomLeft}
        <span class="right">
          <a class="dynLink tooltipped" data-link="like" data-owner="${ownerId}" data-url="${url}" data-tooltip="Like this pin" onclick="${onClick}"><i class="fa fa-heart-o"></i>&nbsp;</a>
          <span class="likes">${likes}</span>
        </span>
      </h6>
    </div>`;
  // If called from performSave function, update the grid
  if (updateGrid) {
    $('.pins').isotope('insert', $(pinHtml));
    $('.tooltipped').tooltip();
    // Set click-handlers
    $(`img[data-owner="${ownerId}"][data-url="${url}"]`).click(function () {
      bigImg($(this));
    });
    $(`a[data-owner="${ownerId}"][data-url="${url}"]`).click(function () {
      likePin(this);
    });
  } else return pinHtml;
  // ^^ If called from showAllPins (indexController.client.js), return HTML code only
}

// Generate HTML for delete-pin buttons in grid
function generateDelBtn(url, caption, ownerId, needsLeft) {
  // Prepend and append span tags, if necessary
  const beginning = needsLeft ? '<span class="left">' : '';
  const end = needsLeft ? '</span>' : '';
  return `${beginning}<a class="tooltipped" data-caption="${caption}" data-owner="${ownerId}" data-url="${url}" onclick="deletePin(this)" data-tooltip="Delete this pin"><i class="fa fa-minus-square-o"></i></a>${end}`;
}

// Update UI when image cannot be found
function badImg(url) {
  // Insert placeholder image
  $('#newPinImg').attr('src', '../public/img/badImg.jpg');
  // Notify the user
  errorMsg(`No image found at '${url}'`);
  $('#newPinUrl').removeClass('valid').addClass('invalid');
  // Prevent user from saving a bad image URL
  lastUrl = false;
}

// Validate URL field and update image
function updateImg() {
  const $url = $('#newPinUrl');
  // If URL field is empty, don't do anything
  if ($url.val() === '') return;
  // Otherwise, continue with validation
  let thisUrl = $url.val().trim();
  // Prepend URL with protocol, if necessary
  if (!thisUrl.toLowerCase().startsWith('http')) thisUrl = `https://${thisUrl}`;
  $url.val(thisUrl);
  // If URL is new and appears valid, update the image
  if (thisUrl !== lastUrl) {
    $('#newPinImg').attr('src', thisUrl);
    lastUrl = thisUrl;
  }
}

// Initial pin-creation submission
function savePin() {
  updateImg();
  const caption = $('#newPinCaption').val();
  // Check for blank/invalid fields
  if (!caption || $('#newPinCaption').hasClass('invalid')) return errorMsg('Please enter a valid caption for your pin.');
  if (!lastUrl) return errorMsg('Please enter a valid image URL.');

  /* If fields appear to be valid, wait for 2.5 seconds, and then ask for confirmation
    before submission. This allows for additional URL validation. */
  const $btn = $('#saveBtn');
  $btn.html('<i class="fa fa-circle-o-notch fa-spin fa-3x"></i>');
  $btn.addClass('disabled');
  setTimeout(() => {
    // If URL is valid, open confirmation modal
    if (lastUrl) $('#modalConfirmSave').modal('open');
    $btn.html('Save Pin');
    $btn.removeClass('disabled');
  }, 2500);
}

// After confirmation, save pin to the DB
function performSave() {
  const pinCaption = $('#newPinCaption');
  const pinUrl = $('#newPinUrl');
  // Final validation check
  if (pinCaption.hasClass('invalid') || pinUrl.hasClass('invalid')) return $('#modalConfirmSave').modal('close');

  // Update UI while save is performed
  progress('show', true);
  $('#modalConfirmSave a').addClass('disabled');
  $('#modalConfirmSave h5').html('Saving...');

  // Update the database (add pin to the user's collection)
  const apiUrl = `/api/pin/${encodeURIComponent(pinUrl.val())}/${encodeURIComponent(pinCaption.val())}`;
  ajaxFunctions.ajaxRequest('PUT', apiUrl, (result) => {
    // Regardless of result, close and restore the confirmation modal
    $('#modalConfirmSave').modal('close');
    setTimeout(() => {
      $('#modalConfirmSave a').removeClass('disabled');
      $('#modalConfirmSave h5').html('Are you sure you would like to save this pin?');
    }, 1000);
    progress('hide', true);
    // If an error occured, notify the user
    if (result === 'error') return errorMsg();
    if (result === 'exists') return errorMsg('You\'ve already pinned this image!');
    // Otherwise, close the modal and update the UI
    resetPinModal();
    const data = JSON.parse(result);
    generatePin(pinUrl.val(), pinCaption.val(), data.ownerId, data.ownerName, 0, true, true);
    Materialize.toast('New pin saved!', 3000);
  });
}

// Reset the new-pin modal
function resetPinModal() {
  $('#modal-newPin').modal('close');
  setTimeout(() => {
    $('input').val('');
    $('input').removeClass('invalid valid');
    $('#newPinImg').attr('src', '../public/img/galaxy.jpg');
  }, 1000);
  lastUrl = '';
}

// Initial pin-deletion attempt from user
function deletePin(pin) {
  // Update and display delete-confirmation modal
  $('#delMsg').html(`Are you sure you want to delete ${$(pin).data('caption')}?`);
  $('#confirmDelBtn').unbind('click');
  $('#confirmDelBtn').click(() => performDelete($(pin).data('url')));
  $('#modalConfirmDelete').modal('open');
}

// After confirmation, delete the pin in the DB
function performDelete(pinUrl) {
  ajaxFunctions.ajaxRequest('DELETE', `/api/pin/${encodeURIComponent(pinUrl)}`, (result) => {
    // If an error occured, notify the user
    if (result === 'error') return errorMsg();
    if (result === 'no') return errorMsg('That isn\'t your pin!');
    // Otherwise, close the modal and update the UI
    $('#modalConfirmDelete').modal('close');
    Materialize.toast('Your pin has been deleted!', 3000);
    $('.pins').isotope('remove', $(`.grid-item[data-owner="${result}"][data-url="${pinUrl}"]`));
  });
}
