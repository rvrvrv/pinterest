// Like (or unlike) a pin
function likePin(a,b){$(a).css("pointer-events","none");// Store pin information for API call
const c={url:encodeURIComponent($(a).data("url")),owner:$(a).data("owner")},d=b?"DELETE":"PUT";// Make the appropriate API call
ajaxFunctions.ajaxRequest(d,`/api/like/${JSON.stringify(c)}`,c=>{if("error"===c)return errorMsg("An error has occurred.",a);const d=$(a).next();// After trying to unlike pin
return b?"no"===c?errorMsg("You don't like this pin yet!",a):(Materialize.toast("Unliked it!",2e3),d.html(`${+d.text()-1}`),likeBtnSwitch(a)):"exists"===c?errorMsg("You already like this pin!",a):(Materialize.toast("Liked it!",2e3),d.html(`${+d.text()+1}`),likeBtnSwitch(a,!0));// After trying to like pin
// If like is successful, notify the user and update UI
})}// Switch like button (to like or unlike)
function likeBtnSwitch(a,b){$(a).unbind("click"),$(a).css("pointer-events","unset"),b?($(a).parents(".grid-item").addClass("liked"),$(a).tooltip("remove"),$(a).attr("data-tooltip","Unlike this pin"),$(a).tooltip(),$(a).find("i").removeClass("fa-heart-o").addClass("fa-heart"),$(a).click(()=>likePin($(a),!0)),$(a).data("link","unlike")):($(a).parents(".grid-item").removeClass("liked"),$(a).tooltip("remove"),$(a).attr("data-tooltip","Like this pin"),$(a).tooltip(),$(a).find("i").removeClass("fa-heart").addClass("fa-heart-o"),$(a).click(()=>likePin($(a))))}