// Show logged-in view
function loggedIn(a){// Generate user info in navbar
// Generate dropdown menu
// Initialize dropdown menu
// Generate and display pin-filter menu
// Activate pin-filter menu buttons
// Generate 'New Pin' modals
// Generate 'Delete Pin' confirmation modal
// Initialize new modals
// Update and activate like buttons
// Update user's pins (for filter and delete buttons)
// Activate dynamic links for logged-in user
// Activate logout link
// Remove login button
$(".user-info").html(`
    <a class="dropdown-button" data-activates="userDropdown">
      <li><img src="${a.img}" alt="${a.name}"></li>
      <li class="hide-on-small-only nav-name">${a.name.split(" ")[0]}</li>
    </a>`),$("#userDropdown").html(`
    <li><a class="waves-effect waves-light dyn-link" data-link="#modal-newPin">Add a Pin</a></li>
    <li><a class="waves-effect waves-red" id="logoutBtn">Log Out</a></li>`),$(".dropdown-button").dropdown({inDuration:350,outDuration:175,constrainWidth:!1,hover:!0,belowOrigin:!0,alignment:"left",stopPropagation:!1}),$(".progress").after(`
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
    </div>`),$(".filter-btn").click(function(){filterPinsByBtn(this)}),$(".modals").append(`
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
              <input id="newPinCaption" alt="Caption" placeholder="Radiant Galaxy" type="text" class="validate" pattern="[a-zA-Z0-9.,?!@#$%&*() ]{1,}$" maxlength="50" data-length="50">
              <label class="active" for="newPinCaption" data-error="Please enter a valid caption.">Caption</label>
            </div>
          </div>
          <div class="row">
            <div class="input-field col s12">
              <input id="newPinUrl" alt="Image URL" placeholder="https://goo.gl/Ls5l2M" type="url" class="validate" maxlength="200" data-length="200">
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
  </div>`),$("#newPinUrl").focusout(()=>updateImg()),$(".modals").append(`
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
    </div>`),$(".modal").modal(),a.likes.forEach(a=>{const b=$(`.right a[data-owner="${a.ownerId}"][data-url="${a.url}"]`);// If user likes the pin, update the UI
b&&likeBtnSwitch(b,!0)}),a.pins.forEach(b=>{const c=$(`.grid-item[data-owner="${a.id}"][data-url="${b}"]`);// Add class for filtering
// Add delete button
c.addClass("yours"),c.find(".left").empty().removeClass("owner-filter").unbind(),c.find(".left").html(generateDelBtn(b,c.find(".center").html(),a.id)),$(".tooltipped").tooltip()}),$(".dyn-link").each(function(){const a=$(this).data("link");// New-pin modal
a.includes("modal")?$(this).click(()=>$(a).modal("open")):a.includes("like")&&($(this).prop("onclick",null),$(this).removeAttr("onclick"),"like"===a&&$(this).click(()=>likePin(this)))}),$("#logoutBtn").click(()=>{location.replace("/logout")}),$(".login-btn").remove()}// Check for login status
function checkLoginStatus(){ajaxFunctions.ready(ajaxFunctions.ajaxRequest("GET","/api/",a=>{"no"===a?$(".login-btn").removeClass("hidden"):loggedIn(JSON.parse(a))}))}