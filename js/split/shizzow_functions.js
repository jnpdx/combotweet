function send_shout(panel_id) {
	
	var pan = get_panel_by_id(panel_id);
	var shout = $('#panel_' + panel_id).find('.tweet_input').val();
	var location = $('#panel_' + panel_id).find('.shizzow_favorites').val();
	
	$('#panel_' + panel_id).find('.tweet_input').val('');
	
	$('#panel_' + panel_id).find('.length_notify_box').html('');
	
	if (PROXY) {
		proxy_send_shout(panel_id,shout,location);
	}
	
}

function add_shizzow_place(panel_id,place_name,place_key) {
  
  $('#panel_' + panel_id).find('.shizzow_favorites').append('<option value="' + place_key + '">' + place_name + '</option>')
  $('#panel_' + panel_id).find('.shizzow_favorites').val(place_key)
  $('#panel_' + panel_id).find('.tweet_input').focus();
  
  $.scrollTo( $('#panel_' + panel_id + ''), 20, {
	
		offset: { left: 0, top: -110 }
	
	} );
  
}

//Make a new Shizzow panel
function make_new_shizzow_panel(u,p) {
	
	//alert("making shizzow panel");
	
	//u = u.substring(8);
	
	var d = new Date();
	
	var new_id = "Shizzow_" + d.getTime();
	
	if (get_panel_by_id(new_id) != null) {
		
		alert("You already have a panel open like that!");
		return;
		
	}
	
	if (PROXY) {
		var old_data = proxy_get_shizzow_panel(new_id,u,p);//register the panel
	}
	
	var panel_info = '';
	
	var new_panel = new Data_Panel(new_id,'shizzow_panel',u,p,panel_info);
	
	new_panel.tweet_type = "shouts";
	
	tw_panels.push(new_panel);
	
	var panel_code = js_get_shizzow_panel(new_id,u,p);
	
	set_up_panel(new_id,panel_code,u,p);
	
	if (PROXY) {
	
		proxy_get_shizzow_favorites(new_id);
	
	}
	
}