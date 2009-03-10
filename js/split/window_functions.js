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
	
	var win_left = ($(window).width() / 2) - 200;
	var win_top = $(window).scrollTop() + 50;
	
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
	
	if (PROXY) {
		user_info = proxy_get_twitter_user_info(user);
	}
	
	if (XS) {
		user_info = js_get_twitter_user_info(user);
	}
	
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
	var tweets_html = '<ul>';



	for (i = 0; i < data.length; i ++) {
	
		tweets_html += '<li>' + parse_tweet(data[i].text) + '</li>';
	
	}

	tweets_html += "</ul>"

	container.append(tweets_html);
}

//Displays a window asking which acct to use to follow a user
function follow_user_window(user_name) {
	
	var user_panels = new Array();
	
	for (i in tw_panels) {
		
		if (tw_panels[i].panel_type != "search_panel") {
			
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

//Lets the user know how many more characters are available
function length_notify(panel_id) {
	
	var input_box = $('#panel_' + panel_id).find('.tweet_input');
	
	
	var chars_typed = input_box.val().length;
	
	if (ADD_HASHTAG) {
	  
	  chars_typed += $('#panel_' + panel_id).find('input.add_hashtag').val().length;
	  
	}
	
	if (chars_typed >= 140) {
		
		input_box.val(input_box.val().substring(0,140));
		chars_typed = max_length;
		
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