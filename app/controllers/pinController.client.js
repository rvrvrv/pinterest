let lastUrl;// Filter pins by button-click
function filterPinsByBtn(a){// If active filter is clicked, don't do anything
$(a).hasClass("active")||(// Otherwise, update filter buttons and filter the pins
$(".filter-btn.active").removeClass("active"),$(a).addClass("active"),$(".pins").isotope({filter:$(a).data("filter")}))}// Filter pins by link-click
function filterPinsByLink(a){// If filter buttons are available, use/update them where applicable
if($("#filters").length){if("*"===a)return $("#allPinsBtn").click();$(".filter-btn.active").removeClass("active")}$(".pins").isotope({filter:a}),$("#filters").length||"*"===a||setTimeout(()=>Materialize.toast("To view all pins, click 'Almost Pinterest'<br>at the top of this page.",4e3),2e3)}// Generate HTML for pin in grid
function generatePin(a,b,c,d,e,f,g){let h,i,j;f?(h="grid-item yours",i=generateDelBtn(a,b,c,!0),j=""):(h="grid-item",i=`
      <span class="left owner-filter">
        <a data-caption="${b}" data-owner="${c}" data-url="${a}">${d}</a>
      </span>`,j=`errorMsg('Please log in to like ${b}')`);// Outputted HTML code
const k=`
    <div class="${h}" data-owner="${c}" data-url="${a}">
      <img src="${a}" alt="${b}" data-owner-name="${d}" onerror="this.onerror=null;this.src='../public/img/badImg.jpg';" />
      <h6 class="center">${b}</h6>
      <h6>
        ${i}
        <span class="right">
          <a class="dyn-link tooltipped" data-link="like" data-owner="${c}" data-url="${a}" data-tooltip="Like this pin" onclick="${j}"><i class="fa fa-heart-o"></i>&nbsp;</a>
          <span class="likes">${e}</span>
        </span>
      </h6>
    </div>`;// If called from performSave function, update the grid
return g?void(// Set click-handlers
$(".pins").isotope("insert",$(k)),$(".tooltipped").tooltip(),$(`img[data-owner-name="${d}"][src="${a}"]`).click(function(){bigImg($(this))}),$(`.right a[data-owner="${c}"][data-url="${a}"]`).click(function(){likePin(this)})):k;// ^^ If called from showAllPins (indexController.client.js), return HTML code only
}// Generate HTML for delete-pin buttons in grid
function generateDelBtn(a,b,c,d){return`${d?"<span class=\"left\">":""}<a class="tooltipped" data-caption="${b}" data-owner="${c}" data-url="${a}" onclick="deletePin(this)" data-tooltip="Delete this pin"><i class="fa fa-minus-square-o"></i></a>${d?"</span>":""}`}// Update UI when image cannot be found
function badImg(a){// Insert placeholder image
// Notify the user
// Prevent user from saving a bad image URL
$("#newPinImg").attr("src","../public/img/badImg.jpg"),errorMsg(`No image found at '${a}'`),$("#newPinUrl").removeClass("valid").addClass("invalid"),lastUrl=!1}// Validate URL field and update image
function updateImg(){const a=$("#newPinUrl");// If URL field is empty, don't do anything
if(""===a.val())return;// Otherwise, continue with validation
let b=a.val().trim().replace(/['"]/g,"");// Prepend URL with protocol, if necessary
b.toLowerCase().startsWith("http")||(b=`https://${b}`),a.val(b),b!==lastUrl&&($("#newPinImg").attr("src",b),lastUrl=b)}// Initial pin-creation submission
function savePin(){updateImg();const a=$("#newPinCaption").val();// Check for blank/invalid fields
if(!a||$("#newPinCaption").hasClass("invalid"))return errorMsg("Please enter a valid caption for your pin.");if(!lastUrl)return errorMsg("Please enter a valid image URL.");/* If fields appear to be valid, wait for 2.5 seconds, and then ask for confirmation
    before submission. This allows for additional URL validation. */const b=$("#saveBtn");b.html("<i class=\"fa fa-circle-o-notch fa-spin fa-3x\"></i>"),b.addClass("disabled"),setTimeout(()=>{lastUrl&&$("#modalConfirmSave").modal("open"),b.html("Save Pin"),b.removeClass("disabled")},2500)}// After confirmation, save pin to the DB
function performSave(){const a=$("#newPinCaption"),b=$("#newPinUrl");// Final validation check
if(a.hasClass("invalid")||b.hasClass("invalid"))return $("#modalConfirmSave").modal("close");// Update UI while save is performed
progress("show",!0),$("#modalConfirmSave a").addClass("disabled"),$("#modalConfirmSave h5").html("Saving...");// Update the database (add pin to the user's collection)
const c=`/api/pin/${encodeURIComponent(b.val())}/${encodeURIComponent(a.val())}`;ajaxFunctions.ajaxRequest("PUT",c,c=>{// If an error occurred, notify the user
if($("#modalConfirmSave").modal("close"),setTimeout(()=>{$("#modalConfirmSave a").removeClass("disabled"),$("#modalConfirmSave h5").html("Are you sure you would like to save this pin?")},1e3),progress("hide",!0),"error"===c)return errorMsg();if("exists"===c)return errorMsg("You've already pinned this image!");// Otherwise, close the modal and update the UI
resetPinModal();const d=JSON.parse(c);generatePin(b.val(),a.val(),d.ownerId,d.ownerName,0,!0,!0),Materialize.toast("New pin saved!",3e3)})}// Reset the new-pin modal
function resetPinModal(){$("#modal-newPin").modal("close"),setTimeout(()=>{$("input").val(""),$("input").removeClass("invalid valid"),$("#newPinImg").attr("src","../public/img/galaxy.jpg")},1e3),lastUrl=""}// Initial pin-deletion attempt from user
function deletePin(a){// Update and display delete-confirmation modal
$("#delMsg").html(`Are you sure you want to delete ${$(a).data("caption")}?`),$("#confirmDelBtn").unbind("click"),$("#confirmDelBtn").click(()=>performDelete($(a).data("url"))),$("#modalConfirmDelete").modal("open")}// After confirmation, delete the pin in the DB
function performDelete(a){ajaxFunctions.ajaxRequest("DELETE",`/api/pin/${encodeURIComponent(a)}`,b=>"error"===b?errorMsg():"no"===b?errorMsg("That isn't your pin!"):void(// Otherwise, close the modal and update the UI
$("#modalConfirmDelete").modal("close"),Materialize.toast("Your pin has been deleted!",3e3),$(".pins").isotope("remove",$(`.grid-item[data-owner="${b}"][data-url="${a}"]`))))}