// Show logged-in view
function loggedIn(user) {
  // Generate user info in navbar
  $('.user-info').html(`
    <a class="dropdown-button" data-activates="userDropdown">
      <li><img src="${user.img}" alt="${user.name}"></li>
      <li class="hide-on-small-only nav-name">${user.name.split(' ')[0]}</li>
    </a>`);

  // Generate dropdown menu
  $('#userDropdown').html(`
    <li><a class="waves-effect waves-light dyn-link" data-link="#modal-newPin">Add a Pin</a></li>
    <li><a class="waves-effect waves-red" id="logoutBtn">Log Out</a></li>`);

  // Initialize dropdown menu
  $('.dropdown-button').dropdown({
    inDuration: 350,
    outDuration: 175,
    constrainWidth: false,
    hover: true,
    belowOrigin: true,
    alignment: 'left',
    stopPropagation: false
  });

  // Generate and display pin-filter menu
  $('.progress').after(`
    <div class="container" id="filters">
      <div class="row">
        <div class="col s12">
          <ul class="tabs tabs-fixed-width">
            <li class="tab col s4"><a class="filter-btn active" id="allPinsBtn" data-filter="*">All Pins</a></li>
            <li class="tab col s4"><a class="filter-btn" data-filter=".yours">Yours</a></li>
            <li class="tab col s4"><a class="filter-btn" data-filter=".liked">Liked</a></li>
          </ul>
        </div>
      </div>
    </div>`);

  // Activate pin-filter menu buttons
  $('.filter-btn').click(function () {
    filterPinsByBtn(this);
  });

  // Generate 'New Pin' modals
  $('.modals').append(`
    <div id="modal-newPin" class="modal">
      <div class="modal-content">
        <div class="row new-pin">
          <img class="z-depth-4" id="newPinImg" src="../public/img/galaxy.jpg" onerror="badImg(this.src)" />
        </div>
        <form class="col s12">
          <div class="row center">
            <h5>Add a pin! Fill out the fields below, and share your awesome pin with the community.</h5>
          </div>
          <div class="row">
            <div class="input-field col s12">
              <input id="newPinCaption" alt="Caption" placeholder="Radiant Galaxy" type="text" class="validate" pattern="[a-zA-Z0-9.,?!@#$%&*() ]{1,}$"
                maxlength="50" data-length="50">
              <label class="active" for="newPinCaption" data-error="Please enter a valid caption.">Caption</label>
            </div>
          </div>
          <div class="row">
            <div class="input-field col s12">
              <input id="newPinUrl" alt="Image URL" placeholder="https://goo.gl/Ls5l2M" type="url" class="validate"
                maxlength="500" data-length="500">
              <label class="active" for="newPinUrl" data-error="Please enter a valid image URL.">Image URL</label>
            </div>
          </div>
        </form>
      </div>
      <div class="modal-footer valign-wrapper">
        <div class="row center">
          <a class="waves-effect waves-green btn-flat" id="saveBtn" onclick="savePin()">Save Pin</a>
          <a class="waves-effect waves-red btn-flat" onclick="resetPinModal()">Cancel</a>
        </div>
      </div>
    </div>
    <div id="modalConfirmSave" class="modal modal-confirm">
      <div class="modal-content">
        <div class="row center">
          <h5>Are you sure you would like to save this pin?</h5>
        </div>
      </div>
      <div class="modal-footer valign-wrapper">
        <div class="row center">
          <a class="waves-effect waves-green btn-flat" id="confirmSaveBtn" onclick="performSave()">Yes</a>
          <a class="waves-effect waves-red btn-flat modal-action modal-close" id="notConfirmedBtn">No</a>
        </div>
      </div>
  </div>`);
  $('#newPinUrl').focusout(() => updateImg());

  // Generate 'Delete Pin' confirmation modal
  $('.modals').append(`
    <div id="modalConfirmDelete" class="modal modal-confirm">
      <div class="modal-content">
        <div class="row center">
          <h5 id="delMsg"></h5>
        </div>
      </div>
      <div class="modal-footer valign-wrapper">
        <div class="row center">
          <a class="waves-effect waves-red btn-flat" id="confirmDelBtn">Yes</a>
          <a class="waves-effect waves-yellow btn-flat modal-action modal-close">No</a>
        </div>
      </div>
    </div>`);

  // Initialize new modals
  $('.modal').modal();

  // Update and activate like buttons
  user.likes.forEach((e) => {
    const likedPin = $(`.right a[data-owner="${e.ownerId}"][data-url="${e.url}"]`);
    // If user likes the pin, update the UI
    if (likedPin) likeBtnSwitch(likedPin, true);
  });

  // Update user's pins (for filter and delete buttons)
  user.pins.forEach((e) => {
    const userPin = $(`.grid-item[data-owner="${user.id}"][data-url="${e}"]`);
    // Add class for filtering
    userPin.addClass('yours');
    // Add delete button
    userPin.find('.left').empty().removeClass('owner-filter').unbind();
    userPin.find('.left').html(generateDelBtn(e, userPin.find('.center').html(), user.id));
    $('.tooltipped').tooltip();
  });

  // Activate dynamic links for logged-in user
  $('.dyn-link').each(function () {
    const link = $(this).data('link');
    // New-pin modal
    if (link.includes('modal')) { $(this).click(() => $(link).modal('open')); }
    // Like/unlike links
    else if (link.includes('like')) {
      // Remove 'Please login' message from all like/unlike links
      $(this).prop('onclick', null); // For IE compatibility
      $(this).removeAttr('onclick');
      // Activate 'like' links
      if (link === 'like') $(this).click(() => likePin(this));
    }
  });

  // Activate logout link
  $('#logoutBtn').click(() => {
    location.replace('/logout');
  });

  // Remove login button
  $('.login-btn').remove();
}

// Check for login status
function checkLoginStatus() {
  ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', '/api/', (res) => {
    // If user is not logged in, show the login button
    if (res === 'no') $('.login-btn').removeClass('hidden');
    else loggedIn(JSON.parse(res));
  }));
}
