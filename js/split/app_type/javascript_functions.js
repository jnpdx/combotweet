/********************************* JS FUNCTIONS ***********************************/

//Used in XS and PROXY situations now
function js_get_panel(panel_id, t_user, t_pass, gen_info) {
	
	if (t_pass == "_search") {
		
		return js_get_search_panel(panel_id,t_user,t_pass);
		
	}
	
	var bg_img = '';
	var bg_col = '';
	
	if (gen_info != null) {
		
		if (gen_info.profile_background_image_url != undefined) {
			
			bg_img = gen_info.profile_background_image_url;
			
		}
		
		if (gen_info.profile_background_color != undefined) {
			
			bg_col = gen_info.profile_background_color;
			
		}
		
	}
	
	var panel_html = "";
	
	panel_html += '<div class="panel twitter_panel" id="panel_' + panel_id + '">';
	panel_html += '<input type="hidden" class="panel_id" value="' + panel_id + '"/><input type="hidden" class="panel_user_name" value="' + t_user + '"/>';
	panel_html += '<input type="hidden" class="panel_background" value="' + bg_img + '" /><input type="hidden" class="panel_background_color" value="' + bg_col + '" />';
	panel_html += '<input type="hidden" class="panel_type" value="regular_panel"/>';	

	panel_html += '<div class="twitter_inputs"><span class="dm_notify_box"></span><textarea class="tweet_input" name="tweet_input" rows="3" cols="30"></textarea><span class="add_hashtag">Add hashtag: </span><input type="text" class="add_hashtag" value=""/>'
	
	panel_html += '<input type="button" class="tweet_submit" onclick="send_tweet(\'' + panel_id + '\')" value="Update Status"/><span class="length_notify_box" id="chars_left_panel_' + panel_id + '"></span><br class="clear_both"/></div>';
	
	
	panel_html += '<div class="url_shortener_container"><input type="button" value="Shorten" class="url_shortener_submit" onclick="shorten_url(\'' + panel_id + '\')"/>URL Shortener: <input class="url_shortener" type="text" id="panel_' + panel_id + '_url_shortener"/><br class="clear_both" /></div>'
	
	
	panel_html += '<div class="last_update"></div>';
	panel_html += '<div class="tweet_type_menu"><br class="clear_both"/><div class="tweet_type_button" id="panel_' + panel_id + '_regular" onclick="get_tweets(\'' + panel_id + '\',\'regular\',1)">Timeline</div><div class="tweet_type_button" id="panel_' + panel_id + '_replies" onclick="get_tweets(\'' + panel_id + '\',\'replies\',1)">Replies</div><div class="tweet_type_button" id="panel_' + panel_id + '_direct" onclick="get_tweets(\'' + panel_id + '\',\'direct\',1)">Direct messages</div><br class="clear_both" /></div>';

	panel_html += '<div class="tweets"></div>';
	panel_html += '<div class="more_tweets" onclick="get_more_tweets(\'' + panel_id + '\'); return false;">Load more tweets...</div>';

	panel_html += '</div>';
	
	
	panel_html += '';
	
	return panel_html;
		
}

//Used in XS and PROXY situations now
function js_get_search_panel(panel_id,t_user,t_pass) {
	
	var panel_html = "";
	
	
	panel_html += '<div class="panel twitter_panel" id="panel_' + panel_id + '">';
	panel_html += '<input type="hidden" class="panel_id" value="' + panel_id + '"/><input type="hidden" class="panel_user_name" value="' + t_user + '"/><input type="hidden" class="panel_type" value="search_panel"/><input type="hidden" class="panel_background" value="" /><input type="hidden" class="panel_background_color" value="fff" />';
	panel_html += '<div class="twitter_inputs"></div>';
	panel_html += '<div class="tweet_type_menu"></div><div class="tweets"></div>';
	panel_html += '<div class="more_tweets" onclick="get_more_tweets(\'' + panel_id + '\'); return false;">Load more tweets...</div>';
	panel_html += '</div>';
	panel_html += '';
	
	return panel_html;
	
}

function js_get_search_tweets(panel_id,tweet_type,page,since,location,location_search_dist) {
		
	var pan = get_panel_by_id(panel_id);
	
	var search_term = pan.user;
	
	since_req = "&since_id=" + since;
	
	if (since == '-1') {
		
		since_req = '';
		
	}
	
	if (page != 1) {
		
		since_req = '';
		
	}
	
	if (AIR) {
		
		//we have to go through the interface because of XS restrictions
		
		air_get_search_tweets(panel_id,search_term,tweet_type,page,since_req,location,location_search_dist);
		
	} else {
	
		$.ajax( {
			url: 'http://search.twitter.com/search.json',
			dataType: 'json',
			cache: false,
			data: 'q=' + search_term + '&page=' + page + since_req,
			success: function(data) {
				parse_get_tweets_data(panel_id,tweet_type,page,data);
			}
	
		});
	
	}
	
}

function js_get_tweets(panel_id, tweet_type, page, since, location, location_search_dist) {

	//need search code

	var pan = get_panel_by_id(panel_id);
	
	if (tweet_type == 'replies') {
		
		return js_get_search_tweets(panel_id,tweet_type,page,since,location,location_search_dist);
		
	}
	
	if (pan.panel_type == 'search_panel') {
		
		return js_get_search_tweets(panel_id,tweet_type,page,since,location,location_search_dist);
		
	}

	since_req = "&since_id=" + since;
	
	if (since == '-1') {
		
		since_req = '';
		
	}
	
	if (page != 1) {
		
		since_req = '';
		
	}
	
	var auth = pan.auth;
	
	if (tweet_type == 'regular') {
	
		$.ajax( {
			url: 'http://twitter.com/statuses/friends_timeline.json',
			beforeSend: function(req) {
			        req.setRequestHeader('Authorization', auth);
			    }
			,
			dataType: 'json',
			cache: false,
			data: 'page=' + page + since_req,
			success: function(data) {
				parse_get_tweets_data(panel_id,tweet_type,page,data);
			}
		
		});
 	} else if (tweet_type == 'replies') {
	
		$.ajax( {
			url: 'http://twitter.com/statuses/replies.json',
			beforeSend: function(req) {
			        req.setRequestHeader('Authorization', auth);
			    }
			,
			dataType: 'json',
			cache: false,
			data: 'page=' + page + since_req,
			success: function(data) {
				parse_get_tweets_data(panel_id,tweet_type,page,data);
			}
		
		});
	
	} else if (tweet_type == 'direct') {
		
		
		$.ajax( {
			url: 'http://twitter.com/direct_messages.json',
			beforeSend: function(req) {
			        req.setRequestHeader('Authorization', auth);
			    }
			,
			dataType: 'json',
			cache: false,
			data: 'page=' + page + since_req,
			success: function(data) {
				parse_get_tweets_data(panel_id,tweet_type,page,data);
			}
		
		});
		
		
	} else if (tweet_type == 'direct_sent') {
		
		$.ajax( {
			url: 'http://twitter.com/direct_messages/sent.json',
			beforeSend: function(req) {
			        req.setRequestHeader('Authorization', auth);
			    }
			,
			dataType: 'json',
			cache: false,
			data: 'page=' + page + since_req,
			success: function(data) {
				parse_get_tweets_data(panel_id,tweet_type,page,data);
			}
		
		});
		
	}
	
	
}

function js_toggle_favorite(panel_id, tweet_id, new_val) {
	
	var pan = get_panel_by_id(panel_id);
	var auth = pan.auth;
	
	alert('http://twitter.com/favorites/create/' + tweet_id + '.json');
	
	if (new_val) {
		
		$.ajax( {
			url: 'http://twitter.com/favorites/create/' + tweet_id + '.json',
			beforeSend: function(req) {
			        req.setRequestHeader('Authorization', auth);
			    }
			,
			type: "POST",
			dataType: 'json',
			cache: false,
			success: function(data) {
				alert('toggled');
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
				alert("Favorites don't work yet in the AIR version - sorry!");
				
			},

		});
		
	} else {
		
		$.ajax( {
			url: 'http://twitter.com/favorites/destroy/' + tweet_id + '.json',
			beforeSend: function(req) {
			        req.setRequestHeader('Authorization', auth);
			    }
			,
			type: "POST",
			dataType: 'json',
			cache: false,
			success: function(data) {

			}

		});
		
	}
	
}

function js_get_twitter_user_info(user) {
	
	var user_info = '';
	
	$.ajax({
		
		async: false,
		url: 'http://twitter.com/users/show/' + user + '.json',
		dataType: 'json',
		type: "GET",
		success: function(data) {
			
			user_info = data;
			
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			
			user_info = null;
			
		},
		});
	
	return user_info;
	
}

function js_get_user_tweets(user,container) {
	
	
	$.ajax({
		
		url: 'http://twitter.com/statuses/user_timeline/' + user + '.json',
		dataType: 'json',
		type: "GET",
		success: function(data) {
			
			display_user_tweets(data,container);
			
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			
			//user_info = null;
			
		},
		});
	
	
}

function js_check_login(user,pass) {
	
	//alert("checking " + user + ',' + pass);	
	
	var verified = false;
	
	var auth = make_base_auth(user,pass);
	
	$.ajax( {
		async: false,
		url: 'http://twitter.com/account/verify_credentials.json',
		beforeSend: function(req) {
		        req.setRequestHeader('Authorization', auth);
		    }
		,
		dataType: 'json',
		cache: false,
		type: "GET",
		success: function(data) {
			verified = true;
			//alert('verified as true');
		},
		error: function(req, textStatus, errorThrown) {
			verified = false;
			//alert('verified as false: ' + textStatus + JSON.stringify(req));
		}, 

	});
	
	return verified;
	
}

function js_send_tweet(panel_id,tweet,reply_to_id,reply_to_name,direct_message) {
		
	var pan = get_panel_by_id(panel_id);	
	
	var auth = pan.auth;
	
	tweet = escape(tweet);
	
	var reply_req = "&in_reply_to_status_id=" + reply_to_id;
	
	if (reply_to_id == 0) {
		
		reply_req = '';
		
	}
	
	if (!direct_message) {
	
		$.ajax( {
			url: 'http://twitter.com/statuses/update.json',
			beforeSend: function(req) {
			        req.setRequestHeader('Authorization', auth);
			    }
			,
			dataType: 'json',
			cache: false,
			data: 'status=' + tweet + reply_req,
			type: "POST",
			success: function(data) {
				get_tweets(panel_id,'regular',1);
			},
			error: function() {
				
				alert("There was an error sending that tweet!");
				
			},
	
		});
		
	} else {
	
		$.ajax( {
			url: 'http://twitter.com/direct_messages/new.json',
			beforeSend: function(req) {
			        req.setRequestHeader('Authorization', auth);
			    }
			,
			dataType: 'json',
			cache: false,
			data: 'user=' + reply_to_name + '&text=' + tweet,
			type: "POST",
			success: function(data) {
				get_tweets(panel_id,'regular',1);
			}
	
		});
		
	}
	
}

function js_get_user_tweets(user,container) {
	
	$.ajax({
		url: 'http://twitter.com/statuses/user_timeline/' + user + '.json?count=10',
		type: "GET",
		success: function(data) {
			
			display_user_tweets(data,container);
			
		},
		dataType: 'json',
		});
	
	
}

function js_follow_user(panel_id,user_name) {
	
	var pan = get_panel_by_id(panel_id);	
	
	var auth = pan.auth;
	
	$.ajax({
		url: 'http://twitter.com/friendships/create/' + user_name + '.json',
		type: "GET",
		success: function(data) {
			
			alert("You are now following @" + user_name);
			
		},
		error: function() {
			
			alert("There was an error while trying to follow @" + user_name);
			
		},
		dataType: 'json',
		});
	
}

function js_get_shizzow_panel(panel_id,s_user,s_pass) {
	
	var panel_html = "";
	
	
	panel_html += '<div class="panel twitter_panel" id="panel_' + panel_id + '">';
	panel_html += '<input type="hidden" class="panel_id" value="' + panel_id + '"/><input type="hidden" class="panel_user_name" value="' + s_user + '"/><input type="hidden" class="panel_type" value="shizzow_panel"/><input type="hidden" class="panel_background" value="" /><input type="hidden" class="panel_background_color" value="fff" />';
	panel_html += '<div class="twitter_inputs"><textarea class="tweet_input" name="tweet_input" rows="3" cols="30"></textarea><br/>Shout from: <select class="shizzow_favorites"></select><br/><input type="button" class="tweet_submit" onclick="send_shout(\'' + panel_id + '\')" value="Update"/><span class="length_notify_box" id="chars_left_panel_' + panel_id + '"></span><br class="clear_both"/></div>';
	panel_html += '<div class="tweet_type_menu"></div><div class="tweets"></div>';
	panel_html += '<div class="more_tweets" onclick="get_more_tweets(\'' + panel_id + '\'); return false;">Load more shouts...</div>';
	panel_html += '</div>';
	panel_html += '';
	
	return panel_html;
	
}

function js_get_facebook_panel(panel_id) {	
	
	var panel_html = "";
	
	
	panel_html += '<div class="panel facebook_panel" id="panel_' + panel_id + '">';
	panel_html += '<input type="hidden" class="panel_id" value="' + panel_id + '"/><input type="hidden" class="panel_type" value="facebook_panel"/><input type="hidden" class="panel_background" value="" /><input type="hidden" class="panel_background_color" value="fff" />';
	//panel_html += '<div class="twitter_inputs"><textarea class="tweet_input" name="tweet_input" rows="3" cols="30"></textarea><br/><input type="button" class="tweet_submit" onclick="update_facebook_status(\'' + panel_id + '\')" value="Update Status"/><span class="length_notify_box" id="chars_left_panel_' + panel_id + '"></span><br class="clear_both"/></div>';
	panel_html += '<div class="tweet_type_menu"></div><div class="tweets"></div>';
	//panel_html += '<div class="more_tweets" onclick="get_more_tweets(\'' + panel_id + '\'); return false;">Load more shouts...</div>';
	panel_html += '</div>';
	panel_html += '';
	
	return panel_html;
	
}