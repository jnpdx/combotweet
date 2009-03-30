/******************************** WINDOW FUNCTIONS ******************************/

//Used to follow a link instead of <a href=""
//In web version, it just returns true so that the href="" is still followed
function follow_link(l) {
	
	if (AIR) {
		window.parentSandboxBridge.nav_in_browser(l);
		return false;
	}
	
	return true;
	
}

function show_overlay() {
  
  $('#notify_overlay').css('opacity','0.5');
	$('#notify_overlay').css('height',$(document).height());
	
	$('#notify_overlay').show();
  
}

function hide_overlay() {
  $('#notify_overlay').hide();
	
}

function hide_open_windows() {
  hide_notify_window();
  $('#settings_form:visible').hide();
  $('#login_form:visible').hide();
}

//Shows a notification window
//Right now, this is a lightbox style window w/dropshaddow
function show_notify_window(html, click_event) {
	
  show_overlay();
	
	var win_left = $(window).scrollLeft() + 100;
	var win_top = $(window).scrollTop() + 150;
	
	if (click_event != undefined) {
	  win_left = click_event.pageX;
	  win_top = click_event.pageY;
	}
	
	$('#notify_window').css('left',win_left);
	$('#notify_window').css('top',win_top);
	$('#notify_window').css('opacity','1');
	
	
	
	$('#notify_content').html(html);
	
	$('#notify_window').show();
	
}

//Hides the notification window
function hide_notify_window() {
	

	hide_overlay();
	
	$('#notify_content').html('');
	
	$('#notify_window').hide();
	
}

//Displays information about a user
function display_twitter_user(user) {
	
	var display_follow_link = true;
	
	var user_info = '';
	
	show_loader();
	
	if (PROXY) {
		user_info = proxy_get_twitter_user_info(user);
	}
	
	if (XS) {
		user_info = js_get_twitter_user_info(user);
	}
	
	hide_loader();
	
	var info_div = '';
	
	info_div += '<span class="user_name"><a target="_blank" href="http://twitter.com/' + user + '" onclick="return follow_link(\'http://twitter.com/' + user + '\')">@' + user + '</a>';
	
	if (display_follow_link) {
		
		info_div += ' - <a href="" onclick="follow_user_window(\'' + user + '\'); return false;">Follow</a>';
		
	}
	
	info_div += '</span>';
	
	info_div += '<img class="avatar" src="' + user_info.profile_image_url + '" alt="Avatar" title="' + user + '"/>';
	info_div += '<p class="user_info">' + parse_tweet(user_info.description) + '</p>';
	
	if (user_info.url != null) {
		info_div += '<span class="user_url"><a target="_blank" href="' + user_info.url + '" onclick="return follow_link(\'' + user_info.url + '\')">' + user_info.url + '</a></span>';
	}
	
	info_div += '<div class="user_stats">';
	info_div += '<label>Followers:</label>' + user_info.followers_count + '<br/>';
	info_div += '<label>Following:</label>' + user_info.friends_count + '<br/>';
	info_div += "</div>";
	info_div += '<div class="user_tweets">';
	info_div += '<a href="" class="get_user_tweets" onclick="get_user_tweets(this,\'' + user + '\'); return false;">Get tweets</a>';
	info_div += '</div>';
	
	show_notify_window(info_div);
	
	return false;
	
}

//Displays a user's tweets
function display_user_tweets(data, container) {
	var tweets_html = '';

  $('#notify_window').width(PANEL_WIDTH);

	for (var i = 0; i < data.length; i ++) {
	
	  tweet = data[i];
	  
	  tweets_html += '<div class="tweet" style="display: block">'
	  
	  tweets_html += '<div class="avatar_container"><img class="avatar" src="' + tweet.user.profile_image_url + '" alt="Avatar"/></div>';
		
	  tweets_html += '<div class="the_tweet">'
		
		tweet_text = parse_tweet(tweet.text);
		
		tweets_html += '<span class="tweet_text">' + tweet_text + '</span>';
	
		tweets_html += '<span class="tweet_meta">';
	
		var created_date = new Date(tweet.created_at);
		
		from_sn = tweet.user.screen_name;
	
		tweets_html += '<span id="tweet_time_' + tweet.id + '">' + '<a href="http://twitter.com/' + from_sn + '/status/' + tweet.id + '" target="_blank">' + get_time_text(cur_date,created_date) + "</a></span>";
		
		tweets_html += '</span>'
		
		tweets_html += '</div>'
		tweets_html += '</div>'
		tweets_html += '<br class="clear_both"/>'
	
	}

	tweets_html += "";

	container.append(tweets_html);
	
}

//Displays a window asking which acct to use to follow a user
function follow_user_window(user_name) {
	
	var user_panels = new Array();
	
	for (i in tw_panels) {
		
		if (tw_panels[i].panel_type == "regular") {
			
			user_panels.push(tw_panels[i]);
			
		}
		
	}
	
	if (user_panels.length < 1) {
	
		alert("I'm sorry, but you aren't logged in to any Twitter accounts, so you can't follow that user");
		return;
		
	} 
	
	var notify_html = "";
	
	notify_html += '<h3>Follow @' + user_name + '</h3>';
	
	for (i in user_panels) {
		notify_html += '<a href="" onclick="follow_user(\'' + user_panels[i].panel_id + '\',\'' + user_name + '\'); return false;">Follow with ' + user_panels[i].panel_id + ' account</a>';
		notify_html += '<br/>';
	}
	
	show_notify_window(notify_html);
	
}


function update_widths() {
	
	$('div.panel').width(PANEL_WIDTH);
	
	$('div.the_tweet').width(PANEL_WIDTH - 110)
	
	if (!TABBED_PANELS) {
		$('#panels').width((PANEL_WIDTH + 20) * tw_panels.length)
	}
	
}

function refresh_window() {
	
	var href = window.location.href;
	window.location.href = href;
	
}

//Removes all panels and refreshes the page
function logout() {
	
	if (AIR) {
		
		air_destroy_db();
		refresh_window();
		
	}
	
	if (PROXY) {
		$.post(URL_BASE + 'bin/ajax.php', {
			func: "logout",
		}, function(data) {
			refresh_window();
		},"html");
	}
	
	
}

//Shows the spinning loader icon
function show_loader() {
	
	$('#loader').show();
	
}

//Hides the spinning loader icon
function hide_loader() {
	
	$('#loader').hide();
	
}

function shorten_url(panel_id) {
  
  url_to_shorten = $('#panel_' + panel_id).find('.url_shortener').val();
  
  $.getJSON("http://tr.im/api/trim_url.json?url=" + url_to_shorten + "&callback=?",
  
    function(data) {
      
      if (data.status.result == "ERROR") {
        
        alert("There was an error shortening your URL.  Please check that it is valid.");
        return;
        
      }
      
      shortened_url = data.url;
      
      $('#panel_' + panel_id).find('.url_shortener').val(shortened_url);
      
    }
    
    );
  
}

//Lets the user know how many more characters are available
function length_notify(panel_id) {
	
	var input_box = $('#panel_' + panel_id).find('.tweet_input');
	
	
	var chars_typed = input_box.val().length;
	
	if (ADD_HASHTAG) {
	  
	  chars_typed += $('#panel_' + panel_id).find('input.add_hashtag').val().length;
	  
	}
	
	if (chars_typed >= 140) {
		
		//input_box.val(input_box.val().substring(0,140));
		//chars_typed = max_length;
		
	}
	
	var char_span = '';
	
	if (chars_typed >= 120) {
		char_span = '<span style="color: red;">';
	} else {
		char_span = '<span>';
	}
	
	if (chars_typed == 0) {
	   $('#panel_' + panel_id).find('.length_notify_box').html('');
	} else {
		$('#panel_' + panel_id).find('.length_notify_box').html(char_span + (140 - chars_typed) + " characters left</span>");
  }
	
}

function open_filtered_panel_dialog() {
  
  hide_open_windows();
  
  
  var code = "";
  
  code += "Choose a name for the panel: <br/>"
  code += '<input type="text" id="filtered_panel_name" value="Filtered panel"/><br/>'
  code += "Choose a panel to filter tweets from:<br/>"
  code += '<select id="choose_filter">'
    for (i in tw_panels) {
      if (tw_panels[i].panel_type == "regular") {
        code += '<option value="' + tw_panels[i].panel_id + '">' + tw_panels[i].panel_id + '</option>'
      }
    }
  code += '</select><br/><br/>'
  code += '<input type="button" value="Make filter" onclick="make_new_filtered_panel($(\'#filtered_panel_name\').val(),$(\'#choose_filter\').val()); hide_open_windows()"/>'
  
  show_notify_window(code);
  
  //make_new_filtered_panel('jnpdx');
  

}

function edit_filter(panel_id) {
  
  var code = '<strong>Edit the filter</strong>';
  
  var pan = get_panel_by_id(panel_id);
  
  code += '<div id="filter_edit_form">'
  
  code += 'Panel name: <input type="text" id="filter_panel_name" value="' + pan.user + '"/><br/>'
  
  if (pan.filter_rules.users != undefined) {
    
    code += "Users to display tweets from (comma separated user names):<br/>";
    
    code += '<textarea id="users_filter">'
    
    for (u in pan.filter_rules.users) {
      
      if (pan.filter_rules.users[u] == true) {
        
        code += u + ','
        
      }
      
    }
    
    code += '</textarea>'
    
  }
  
  pan += '</div>'
  
  code += '<br/><input type="button" value="Save filter" onclick="save_filter(\'' + panel_id + '\')"/>'
  
  show_notify_window(code);
  
}

function save_filter(panel_id) {
  
  
  var pan = get_panel_by_id(panel_id);
  
  pan.user = $('#filter_panel_name').val();
  
  $('#panel_' + panel_id + ' .panel_name').text(pan.user)
  
  if ($('#users_filter').length > 0) {
    
    pan.filter_rules['users'] = new Object();
    
    users_list = $('#users_filter').val();
    
    users_list = users_list.split(',');
    
    for (i in users_list) {
      
      //console.log("user " + users_list[i])
      
      if (i == '') { continue; }
      
      pan.filter_rules.users[users_list[i].replace(/^\s+|\s+$/g,"")] = true
      
    }
    
  }
  
  
  save_panel(panel_id,pan)
  
  reload_filter_panel(panel_id);
  
  hide_notify_window()
  
}
