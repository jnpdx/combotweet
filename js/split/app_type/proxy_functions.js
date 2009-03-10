/******************************** PROXY FUNCTIONS ********************************/

function proxy_get_panel(id,t_user,t_pass,info) {
	
	var panel_code = '';
	
	$.post(URL_BASE + 'bin/ajax.php', {
		func: "get_panel",
		panel_id: id,
		user: t_user,
		pass: t_pass,
		async: false,
	}, function(data,textStatus) {

		panel_code = data;
		
	},
	"html");
	
	return panel_code;
	
}

function proxy_get_search_panel(id,t_user,t_pass,info) {
	
	$.post(URL_BASE + 'bin/ajax.php', {
		func: "get_search_panel",
		panel_id: id,
		search_term: t_user,
	}, function(data,textStatus) {
	
	},"html");
	
	return '';
	
}

function proxy_get_session_panels() {
	
	
	show_loader();
	
	$.post(URL_BASE + 'bin/ajax.php', {
		func: "get_session_panels",
	}, function(data) {
			
			
		//$('#panels').append(data);
		
		//$('.twitter_panel').hide();  //this hides all of them - should only hide front?	
		
		if (TABBED_PANELS) {
			$('#panels').width(PANEL_WIDTH + 20);
			$('#header_nav_buttons').show()	
		}
		
		for (i in data) {
		  
		  cur_panel = data[i];
		  var panel_id = cur_panel.panel_id;
		  var pan_type = cur_panel.panel_type;
		  var pan_user = cur_panel.panel_user;
		  var gen_info = cur_panel.gen_info;
		  tw_panels[tw_panels.length] = new Data_Panel(panel_id,pan_type,pan_user,'',null);
		  
		  if (pan_type == 'regular') {
			  var pan_data = js_get_panel(panel_id, pan_user, '', gen_info);
			} else if (pan_type == 'search') {
			  var pan_data = js_get_search_panel(panel_id,pan_user,"_search");
			} else if (pan_type == 'shizzow_panel') {
			  var pan_data = js_get_shizzow_panel(panel_id,pan_user,'')
			  //alert("shizzow panel!");
			}
			
			set_up_panel(panel_id, pan_data, pan_user, '')
			
			if (pan_type == "shizzow_panel") {
			  if (PROXY) {

      		proxy_get_shizzow_favorites(panel_id);

      	}
			}
			
		}
		
		/*
		$('' + data).find('.twitter_panel').each(
			function(i) {
				alert("here");
				if ($(this).is('.proxy_panel')) {
					var panel_id = $(this).find('.panel_id');
					var pan_type = $(this).find('.panel_type').val();
					var pan_user = $(this).find('.panel_user_name').val();
					
					tw_panels[tw_panels.length] = new Data_Panel(panel_id.val(),pan_type,pan_user,'',null);
					
					if (pan_type == 'regular_panel') {
					  var pan_data = js_get_panel(panel_id, t_user, t_pass, gen_info);
					} else if (pan_type == 'search_panel') {
					  js_get_search_panel(panel_id,pan_user,"_search");
					}
					
					set_up_panel(panel_id, pan_data, pan_user, '')
					//add_new_nav_button(panel_id.val());
					//get_tweets(panel_id.val(),"regular",1);
					//get_last_update(panel_id.value);
										
					//if (!TABBED_PANELS) {
					//	$('#panels').width($('#panels').width() + PANEL_WIDTH + 20)
					//}
					
					//show_panel(panel_id.val())
					
				}
				
			}
			);
			*/

		
				
		//now we have to add buttons
		//and get tweets
		
		hide_loader();
		
	},
	"json");
	
	
}

function proxy_get_tweets(panel_id,type,page_num,latest_tweet,user_loc,dist) {
	
	$.post(URL_BASE + 'bin/ajax.php', {
		func: "get_tweets",
		panel: panel_id,
		tweet_type: type,
		page: page_num,
		since: latest_tweet,
		location: user_loc,
		location_search_dist: dist,
	}, function(data) {
		parse_get_tweets_data(panel_id,type,page_num,data);
	},
	"json");
	
}

function proxy_remove_panel(panel_id) {
	
	$.post(URL_BASE + 'bin/ajax.php', {
		func: "remove_panel",
		panel: panel_id,
	}, function(data) {
	
	},
	'json');
	
}

function proxy_send_tweet(panel_id,tweet,reply_to_id,t_reply_to_name,dm) {
	
	var pan = get_panel_by_id(panel_id);
	
	var tweet_type_to_display = 'regular';
	
	if (pan.tweet_type == "direct") {
		
		tweet_type_to_display = "direct_sent";
		
	}
	
	$.post(URL_BASE + 'bin/ajax.php', {
		func: "send_tweet",
		panel: panel_id,
		tweet_data: tweet,
		reply_to: reply_to_id,
		reply_to_name: t_reply_to_name,
		direct_message: dm,
	}, function(data) {
		get_tweets(panel_id,tweet_type_to_display,1);
	},
	'json');
	
}

function proxy_toggle_favorite(panel_id,t_id,new_val) {
	
	$.post(URL_BASE + 'bin/ajax.php', {
		func: "toggle_favorite",
		panel: panel_id,
		tweet_id: t_id,
		favorite: new_val,
	}, function(data) {
		
	},
	'json');
	
}

function proxy_get_twitter_user_info(t_user) {
	
	var user_info = '';
	
	$.ajax({
		async: false,
		url: URL_BASE + 'bin/ajax.php',
		type: "POST",
		data: "func=get_twitter_user_info&user=" + t_user,
		success: function(data) {
			
			user_info = data;
			
		},
		dataType: 'json',
		
		});
	
	return user_info;
	
}

function proxy_check_login(t_user,t_pass) {
	
	var good_login = false;
	
	$.ajax({
		async: false,
		url: URL_BASE + 'bin/ajax.php',
		type: "POST",
		data: "func=check_login&user=" + t_user + '&pass=' + t_pass,
		success: function(data) {
			
			good_login = data;
			
		},
		dataType: 'json',
		
		});
	
	return good_login;
	
}

function proxy_get_user_tweets(user,container) {
	
	
	$.ajax({
		url: URL_BASE + 'bin/ajax.php',
		type: "POST",
		data: "func=get_user_tweets&user=" + user,
		success: function(data) {
			
			display_user_tweets(data,container);
			
		},
		dataType: 'json',
		});
	
	
}

function proxy_follow_user(panel_id,user_name) {
	
	$.post(URL_BASE + 'bin/ajax.php', {
		func: "follow_user",
		panel: panel_id,
		user: user_name,
	}, function(data) {
		alert("You are now following @" + user_name);
	},
	'json');
	
}


/** PROXY For Shizzow **/
function proxy_get_shizzow_panel(id,s_user,s_pass) {
	//alert('making the call');

	$.post(URL_BASE + 'bin/ajax.php', {
		func: "get_shizzow_panel",
		panel_id: id,
		user: s_user,
		pass: s_pass,
	}, function(data,textStatus) {
	
	},"html");
	
	return '';
	
}

function proxy_get_shizzow_favorites(panel_id) {
	
	$.post(URL_BASE + 'bin/ajax.php', {
		func: "get_shizzow_favorites",
		panel: panel_id,
	}, function(data,textStatus) {
		parse_shizzow_favorites(panel_id,data);
	},"json");
	
	return '';
	
}

function proxy_send_shout(panel_id,shout,location) {
	show_loader();
	
	$.post(URL_BASE + 'bin/ajax.php', {
		func: "proxy_send_shout",
		panel: panel_id,
		shout_text: shout,
		loc: location,
	}, function(data,textStatus) {
		alert(data.results.message);
		hide_loader();
	},"json");
	
	return '';
	
}

function proxy_save_state(openid) {
  show_loader();
  
  $.post(URL_BASE + 'bin/ajax.php', {
      func: "save_state",
    }, function (data,textStatus) {
    hide_loader();
  },'json');
  
  return '';
  
  
}

function proxy_load_state(openid) {
  show_loader();
  
  $.post(URL_BASE + 'bin/ajax.php', {
      func: "load_state",
    }, function (data,textStatus) {
      if (data == "NO_SAVED_STATE") {
        
        alert("There was no saved state to load!");
        
      } else {
        
        var href = window.location.href;
      	window.location.href = href;
        
      }
  },'json');
  
  return '';
  
}


