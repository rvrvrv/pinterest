'use strict';var lastUrl;function filterPinsByBtn(a){$(a).hasClass('active')||($('.filter-btn.active').removeClass('active'),$(a).addClass('active'),$('.pins').isotope({filter:$(a).data('filter')}))}function filterPinsByLink(a){if($('#filters').length){if('*'===a)return $('#allPinsBtn').click();$('.filter-btn.active').removeClass('active')}$('.pins').isotope({filter:a}),$('#filters').length||'*'===a||setTimeout(function(){return Materialize.toast('To view all pins, click \'Almost Pinterest\'<br>at the top of this page.',4e3)},2e3)}function generatePin(a,b,c,d,e,f,g){var h=void 0,i=void 0,j=void 0;f?(h='grid-item yours',i=generateDelBtn(a,b,c,!0),j=''):(h='grid-item',i='\n      <span class="left owner-filter">\n        <a data-caption="'+b+'" data-owner="'+c+'" data-url="'+a+'">'+d+'</a>\n      </span>',j='errorMsg(\'Please log in to like '+b+'\')');var k='\n    <div class="'+h+'" data-owner="'+c+'" data-url="'+a+'">\n      <img src="'+a+'" alt="'+b+'" data-owner-name="'+d+'" onerror="this.onerror=null;this.src=\'../public/img/badImg.jpg\';" />\n      <h6 class="center">'+b+'</h6>\n      <h6>\n        '+i+'\n        <span class="right">\n          <a class="dyn-link tooltipped" data-link="like" data-owner="'+c+'" data-url="'+a+'" data-tooltip="Like this pin" onclick="'+j+'"><i class="fa fa-heart-o"></i>&nbsp;</a>\n          <span class="likes">'+e+'</span>\n        </span>\n      </h6>\n    </div>';return g?void($('.pins').isotope('insert',$(k)),$('.tooltipped').tooltip(),$('img[data-owner-name="'+d+'"][src="'+a+'"]').click(function(){bigImg($(this))}),$('.right a[data-owner="'+c+'"][data-url="'+a+'"]').click(function(){likePin(this)})):k}function generateDelBtn(a,b,c,d){return(d?'<span class="left">':'')+'<a class="tooltipped" data-caption="'+b+'" data-owner="'+c+'" data-url="'+a+'" onclick="deletePin(this)" data-tooltip="Delete this pin"><i class="fa fa-minus-square-o"></i></a>'+(d?'</span>':'')}function badImg(a){$('#newPinImg').attr('src','../public/img/badImg.jpg'),errorMsg('No image found at \''+a+'\''),$('#newPinUrl').removeClass('valid').addClass('invalid'),lastUrl=!1}function updateImg(){var a=$('#newPinUrl');if(''!==a.val()){var b=a.val().trim().replace(/['"]/g,'');b.toLowerCase().startsWith('http')||(b='https://'+b),a.val(b),b!==lastUrl&&($('#newPinImg').attr('src',b),lastUrl=b)}}function savePin(){updateImg();var a=$('#newPinCaption').val();if(!a||$('#newPinCaption').hasClass('invalid'))return errorMsg('Please enter a valid caption for your pin.');if(!lastUrl)return errorMsg('Please enter a valid image URL.');var b=$('#saveBtn');b.html('<i class="fa fa-circle-o-notch fa-spin fa-3x"></i>'),b.addClass('disabled'),setTimeout(function(){lastUrl&&$('#modalConfirmSave').modal('open'),b.html('Save Pin'),b.removeClass('disabled')},2500)}function performSave(){var a=$('#newPinCaption'),b=$('#newPinUrl');if(a.hasClass('invalid')||b.hasClass('invalid'))return $('#modalConfirmSave').modal('close');progress('show',!0),$('#modalConfirmSave a').addClass('disabled'),$('#modalConfirmSave h5').html('Saving...');var c='/api/pin/'+encodeURIComponent(b.val())+'/'+encodeURIComponent(a.val());ajaxFunctions.ajaxRequest('PUT',c,function(c){if($('#modalConfirmSave').modal('close'),setTimeout(function(){$('#modalConfirmSave a').removeClass('disabled'),$('#modalConfirmSave h5').html('Are you sure you would like to save this pin?')},1e3),progress('hide',!0),'error'===c)return errorMsg();if('exists'===c)return errorMsg('You\'ve already pinned this image!');resetPinModal();var d=JSON.parse(c);generatePin(b.val(),a.val(),d.ownerId,d.ownerName,0,!0,!0),Materialize.toast('New pin saved!',3e3)})}function resetPinModal(){$('#modal-newPin').modal('close'),setTimeout(function(){$('input').val(''),$('input').removeClass('invalid valid'),$('#newPinImg').attr('src','../public/img/galaxy.jpg')},1e3),lastUrl=''}function deletePin(a){$('#delMsg').html('Are you sure you want to delete '+$(a).data('caption')+'?'),$('#confirmDelBtn').unbind('click'),$('#confirmDelBtn').click(function(){return performDelete($(a).data('url'))}),$('#modalConfirmDelete').modal('open')}function performDelete(a){ajaxFunctions.ajaxRequest('DELETE','/api/pin/'+encodeURIComponent(a),function(b){return'error'===b?errorMsg():'no'===b?errorMsg('That isn\'t your pin!'):void($('#modalConfirmDelete').modal('close'),Materialize.toast('Your pin has been deleted!',3e3),$('.pins').isotope('remove',$('.grid-item[data-owner="'+b+'"][data-url="'+a+'"]')))})}