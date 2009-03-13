/************************ PARSE FUNCTIONS **********************************/

//Deprecated
function parse_last_update(panel_id,data) {
	
	$('#panel_' + panel_id).find('.last_update').html(data[0].text);
	
}

//Parse Shizzow data and display it
function parse_get_shouts_data(panel_id,page_num,data) {
	
	shizzow_data = data;
	
	hide_loader();
	
	//$('#panel_' + panel_id).find('.tweets').html(data.results.shouts[0].places_name);
	
	var cur_date = new Date();
	
	data.results.shouts.reverse();
	
	pan = get_panel_by_id(panel_id);
	
	for (i in data.results.shouts) {
		
		var to_add = "";
		
		
		var cur_shout = data.results.shouts[i];
		
		var s_id = cur_shout.shouts_history_id;
		
		if ($('#shout_' + s_id).length != 0) {
		  continue;
		}
		
		cur_shout['id'] = cur_shout.shouts_history_id;
		
		pan.panel_data.push(cur_shout);
		
		to_add += '<div class="tweet shout" id="shout_' + s_id + '">';
		
		to_add += '<div class="avatar_container"><img class="avatar" src="' + data.results.shouts[i].people_images.people_image_48 + '" alt="Avatar"/></div>';
		
		to_add += '<div class="the_tweet">';
		
		var shout_message = '';
		
		if (cur_shout.shouts_messages != null) {
			
			shout_message = cur_shout.shouts_messages[0].message;
			
		}
		
		to_add += '<a href="http://shizzow.com/people/' + cur_shout.people_name + '" target="_blank">' + cur_shout.people_name + '</a> shouted from <a href="" onclick="add_shizzow_place(' + "'" + panel_id + "'," + "'" + cur_shout.places_name + "'," + "'" + cur_shout.places_key + "'" + '); return false;">' + cur_shout.places_name + '</a>';
		
		if (shout_message != '') {
			
			to_add += '<span class="tweet_text">' + shout_message + '</span>';
			
		}
		
		to_add += '<span class="tweet_meta">';
	
		var created_date = new Date();
		
		created_date.setISO8601(cur_shout.arrived);
	
		//to_add += '<span id="tweet_time_' + s_id + '">' + get_time_text(cur_date,created_date) + "</span>";
		to_add += '<span id="tweet_time_' + s_id + '">' + cur_shout.shout_time + "</span>";
		
		to_add += "</div>";
		
		to_add += '<br class="clear_both"/>';
		
		to_add += "</div>";
		
		//alert(to_add);
		
		$('#panel_' + panel_id).find('.tweets').prepend(to_add);
		
		$('#panel_' + panel_id).find('#shout_' + s_id).show();
		
	}
	
	save_panel(panel_id,pan);
	
	
	update_times(panel_id);
	
	//alert(data.results.shouts);
	
	
	
}

//Parse Twitter data and display it
function parse_get_tweets_data(panel_id,type,page_num,data) {
	
		//alert("displaying page " + page_num);
	
		//alert("parsing tweets for panel" + panel_id + "with data " + data);
	
		//alert("parsing tweet type:" + type);
		
		//alert("page: " + page_num)
	
		if (type == 'direct_sent') {
			type = 'direct';
		}
	
		var tweets = $('#panel_' + panel_id).find('.tweets');
		
		var pan = get_panel_by_id(panel_id);
				
		if (pan.panel_data == data) {
			
			//there's nothing new
			update_times(panel_id);
			
			return;
			
		}
		
		if (pan.panel_type == 'shizzow_panel') {
			parse_get_shouts_data(panel_id,page_num,data);
			return;
		}
		
		var cur_date = new Date();
		
		var is_search = false;
		
		if (data.results != undefined) {
			
			is_search = true;
			
		}
		
		if (page_num == 1) {
			
			if (!is_search) {
				
				data.reverse();
				
			} else {
				
				data.results.reverse();
				
			}
			
		}
		
		var num_tweets = data.length;
		
		if (is_search) {
			
			num_tweets = data.results.length;
			
		}
		
		//alert ("tweet type: " + pan.tweet_type);
		
		for (i = 0; i < num_tweets; i++) {
			
			var tweet = null;
			
			if (!is_search) {
				tweet = data[i];
			} else {
				tweet = data.results[i];
			}
			

						
			var already_displayed = false;
		
		
			if (pan.tweet_type == 'replies') {
				//alert("is reply comparing" + tweet.from_user + " to " + pan.user);
				if (('' + tweet.from_user) == (pan.user + '')) {
					already_displayed = true;
				}
			}
		
			for (j = 0; j < pan.panel_data.length; j++) {
			
				if (pan.panel_data[j].text == tweet.text) {  //wouldn't need if I used since in API call
				
					//$('#canvas').append("already here");
				
					already_displayed = true;
				
				}
				
				
			}
			
			if (already_displayed) {
				continue;
			}
			
			if (tweet.id > pan.latest_tweet_id) {
				
				pan.latest_tweet_id = tweet.id;
				
			}
			
			pan.panel_data.push(tweet);
			
			
			if (DESTROY_TWEETS) {
				
				if (pan.panel_data.length > pan.tweet_display_limit) {
					
					var old_tweet = pan.panel_data.shift();
					
					//remove the old tweet from the html as well
					
					$('#panel_' + panel_id + 'tweet_' + old_tweet.id).hide();
					
					$('#panel_' + panel_id + 'tweet_' + old_tweet.id).remove();
					
				}
				
			}
			
			var favorite_class_note = '';
			
			//alert(tweet.favorited);
			
			if (tweet.favorited) {
				
				favorite_class_note = 'favorite_tweet';
				
			}
			
			var tweet_div = '<div class="' + tweet.id + ' tweet ' + favorite_class_note + '" id="panel_' + panel_id + 'tweet_' + tweet.id + '">';
			
			tweet_div += '<div class="tweet_top"></div>';
			tweet_div += '<div class="tweet_left"></div>';		
		
			var profile_image_url = '';
			
			if (!is_search) {
				
				if (type != "direct") {
				
					profile_image_url = tweet.user.profile_image_url;
				
				} else {
					
					if (tweet.sender_screen_name != panel_id) {
					  profile_image_url = tweet.sender.profile_image_url;
					} else {
					  profile_image_url = tweet.recipient.profile_image_url;
					}
					
				}
				
			} else {
				
				profile_image_url = tweet.profile_image_url;
				
			}

			tweet_div += '<div class="avatar_container"><img class="avatar" src="' + profile_image_url + '" alt="Avatar"/></div>';

		
			tweet_div += '<div class="the_tweet">';
		
			tweet_div += '<div class="the_tweet_top"></div>';
			tweet_div += '<div class="the_tweet_left"></div>';
		
			var from_sn = '';
		
			if (!is_search) {
				if (type == 'direct') {
					from_sn = tweet.sender_screen_name;
				} else {
					from_sn = tweet.user.screen_name;
				}
			} else {
				
				from_sn = tweet.from_user;
				
			}
		
			tweet_div += '<input type="hidden" class="tweet_user_name" value="' + from_sn + '"/>';
			tweet_div += '<input type="hidden" class="tweet_id" value="' + tweet.id + '"/>';
			
			
			tweet_div += '<a class="user_name" onclick="return display_twitter_user(\'' + from_sn + '\');" href="">' + from_sn + "</a>: ";
		
		
			var tweet_text = parse_tweet(tweet.text);
		
			tweet_div += '<span class="tweet_text">' + tweet_text + '</span>';
		
			tweet_div += '<span class="tweet_meta">';
		
			var created_date = new Date(tweet.created_at);
		
			tweet_div += '<span id="tweet_time_' + tweet.id + '">' + '<a href="http://twitter.com/' + from_sn + '/status/' + tweet.id + '" target="_blank">' + get_time_text(cur_date,created_date) + "</a></span>";
		
		
			if (tweet.in_reply_to_screen_name != undefined) {
			
				tweet_div += 'In reply to <a href="http://twitter.com/' + tweet.in_reply_to_screen_name + '">' + tweet.in_reply_to_screen_name + '</a> ';
			
			}
		
			if (!is_search) {
				if (type != 'direct') {
					tweet_div += 'from ' + tweet.source;
				} else if (type == 'direct') {
				  tweet_div += 'to ' + tweet.recipient_screen_name;
				}
			}
		
			tweet_div += '</span>';
			
			var display_reply_icon = true;
			
			if (is_search) {
				
				display_reply_icon = false;
				
			}
			
			if (type == 'replies') {
				
				display_reply_icon = true;
				
			}
			
			if (from_sn == ('' + pan.user)) {
				
				display_reply_icon = false;
				
			}
			
			var display_favorite_icon = true;
			
			if (type == "direct") {
				
				display_favorite_icon = false;
				
			}
			
			if (is_search) {
				
				display_favorite_icon = false;
				
			}
			
			tweet_div += '<div class="tweet_buttons">';
			
				if (type != 'direct') {
					if (!is_search) {
						tweet_div += '<div id="retweet_' + tweet.id + '" class="retweet_icon" ';
						tweet_div +=  'onclick="retweet_button(\'' + panel_id + '\',' + tweet.id + ",'" + from_sn + "')\">";
						tweet_div += '<img src="' + URL_BASE + 'images/Recycle.png" alt="Retweet" title="Retweet" /></div>';
					}
				}
			
				if (display_favorite_icon) {
					tweet_div += '<div id="favorite_' + tweet.id + '" class="favorite_icon" ';

					tweet_div +=  'onclick="toggle_favorite(\'' + panel_id + '\',' + tweet.id + ')">';
					tweet_div += '<img src="' + URL_BASE + 'images/star.gif" alt="Favorite" title="Favorite this tweet" /></div>';
				}
				
				if (display_reply_icon) {
					//alert("is reply comparing" + tweet.from_user + " to " + pan.user);
					tweet_div += '<div id="reply_' + tweet.id + '" class="reply_icon" ';
	
					tweet_div +=  'onclick="reply_to_tweet(\'' + panel_id +'\',' + tweet.id + ",'" + from_sn + "')\">";
					tweet_div += '<img src="' + URL_BASE + 'images/reply.gif" alt="Reply to this tweet" /></div>';
				}
			
			tweet_div += '</div>';
			
			tweet_div += '<div class="the_tweet_right"></div>';
			tweet_div += '<div class="the_tweet_bottom"></div>';
			
			tweet_div += '</div>';
			
			

			
			tweet_div += '<br class="clear_both"/>';
			tweet_div += '<div class="tweet_right"></div>';
			tweet_div += '<div class="tweet_bottom"></div>';
			tweet_div += '</div>';
			
			if (page_num == 1) {
				tweets.prepend(tweet_div);
			} else {
				//alert("appending");
				tweets.append(tweet_div);
			}
			
			var reply_pan_id = '' + panel_id;
			var reply_tweet_id = '' + tweet.id;
			var reply_from_sn = '' + from_sn;
			

			
			$('#panel_' + panel_id + 'tweet_' + tweet.id).show();
			
		}
		
		
		hide_loader();
	
		save_panel(panel_id,pan);
		
		update_times(panel_id);
		
		$('.tweet').click(function() {
			
			$('.tweet:eq(' + selected_tweet + ')').removeClass('selected_tweet')
			
			selected_tweet_panel_id = $(this).parent().parent()[0].id
			
			
			//alert('clicked tweet!');
			selected_tweet = $('#' + selected_tweet_panel_id + ' div.tweet').index(this)
			
			
			for (i in tw_panels) {
				
				if (('panel_' + tw_panels[i].panel_id) == selected_tweet_panel_id) {
					
					selected_tweet_panel = i;
					
				}
				
			}
			
			$(this).addClass('selected_tweet')
		
		});
		
		bind_hashtag_links();
		
		update_widths();
		
	
}

//Parses the text of an individual tweet
//Turns user names/urls/hashtags into hyperlinks
function parse_tweet(tweet) {
	
	var new_tweet = tweet;
	
	var url_RE = /(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|]/gi;
	new_tweet =  tweet.replace(url_RE,"<a target=\"_blank\" class=\"tweeted_link\" href=\"$&\" onclick=\"return follow_link('$&')\">$&</a>");
	
	var hashtag_RE = /[#]+[A-Za-z0-9-_]+/gi;
	new_tweet = new_tweet.replace(hashtag_RE,
		function(t) {
				var tag = t.replace("#","")
				return '<a class="hashtag_link" target="_blank" href="http://tagal.us/tag/' + tag + '" onclick="return follow_link(\'http://tagal.us/tag/' + tag + '\');">' + t + '</a>';
				//return t.link("http://tagal.us/tag/"+tag);
		}
		);
	
	var username_RE = /[@]+[A-Za-z0-9-_]+/gi;
	
	new_tweet = new_tweet.replace(username_RE, function(u) {
		
		var username = u.replace("@","");
		return '<a href="http://twitter.com/' + username + '" onclick="return display_twitter_user(\'' + username + '\');">' + u + '</a>';
		//return u.link("http://twitter.com/"+username);
		
	});
	
	
	return new_tweet;
}

//Parse the shizzow favorites data and display it in drop down menu
function parse_shizzow_favorites(panel_id,data) {
	
	//if ($('#panel_' + panel_id).find('.shizzow_favorites').length == 0) {
		
	//	$('#panel_' + panel_id).find('.twitter_inputs').append('<select class="shizzow_favorites"></select>');
		
	//}
	
	shizzow_data = data;
	
	for (i in data.results.places) {
		
		var cur_place = data.results.places[i];
	
		$('#panel_' + panel_id).find('.shizzow_favorites').append('<option value="' + cur_place.places_key + '">' + cur_place.places_name + '</option>');
		
	}
	
}