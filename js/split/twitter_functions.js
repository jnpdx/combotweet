//Get the tweets/shouts/etc for a given panel
function get_tweets(panel_id,type,page_num) {

	//get the first tweet
	
	
	if (panel_id == null) {
		
		return;
		
	}

	
	var pan = get_panel_by_id(panel_id);

	if (pan.panel_type == 'filtered_panel') {
	  
	  return;
	  
	}

  if (pan.panel_type == 'facebook_panel') {
    fb_get_statuses(panel_id);
    return;
  }
  
  if (pan.panel_type == 'search_panel') {
    js_get_search_tweets_through_json(panel_id,page_num);
    return;
  }

	show_loader();

	var tweets = $('#panel_' + panel_id).find('.tweets');

	if (type == undefined) {
		
		type = 'regular';
		
	}
	
	if (type != 'direct') {
		
		$('#panel_' + panel_id).find('.dm_notify_box').hide();
		
	} else {
		
		$('#panel_' + panel_id).find('.dm_notify_box').show();
		
	}	
	
	var init_load = false;
	
	if (pan.panel_data == null) {
		
		pan.panel_data = new Array();
		init_load = true;
		
	}
	
	if (pan.tweet_type == null) {
		
		pan.tweet_type = type;
		
	}
	
	if (pan.tweet_type != type) {
		
		
		
		tweets.html("");
		pan.tweet_type = type;
		pan.panel_data = new Array();
		pan.latest_tweet_id = -1;
		
		if ((pan.tweet_type == "direct") || (pan.tweet_type == "direct_sent")) {
			
			if ($('.direct_options').length == 0) {
				$('#panel_' + panel_id).find('.tweet_type_menu').append('<div class="direct_options"><a href="" onclick="get_tweets(\'' + panel_id + '\',\'direct\',1); return false;">Inbox</a><a href="" onclick="get_tweets(\'' + panel_id + '\',\'direct_sent\',1); return false;">Outbox</a><br class="clear_both"></div>');
			}
			
		} else {

			$('.direct_options').remove();
			
		}
		
	}

	save_panel(panel_id,pan);

	if (PROXY) {
		
		proxy_get_tweets(panel_id,type,page_num,pan.latest_tweet_id,user_loc,LOCATION_SEARCH_DISTANCE);
		
	}


	if (XS) {

		js_get_tweets(panel_id, type, page_num, pan.latest_tweet_id, user_loc, LOCATION_SEARCH_DISTANCE);

	}
	
	if (type == "direct_sent") {
		
		type = "direct";
		
	}
	
	$("#panel_" + panel_id).find('.tweet_type_button').removeClass('button_highlighted');
	$("#panel_" + panel_id).find('#panel_' + panel_id + '_' + type).addClass('button_highlighted');
	

	
	
}

//Same as get_tweets, but retrieves older data instead of newer
function get_more_tweets(panel_id) {
	
	var pan = get_panel_by_id(panel_id);
	
	//determine what page to get
	
	//up the limit
	if (DESTROY_TWEETS) {
		
		pan.tweet_display_limit += 20;
		save_panel(pan);
		
	}
	
	var num_tweets = pan.panel_data.length;
	
	
	if ((num_tweets % 20) != 0) {
		
		num_tweets++;
		
	}
	
	var page_num = Math.ceil(num_tweets / 20) + 1;
	
	var tweet_type = 'regular';
	
	if (pan.tweet_type != null) {
		
		tweet_type = pan.tweet_type;
		
	}
	
	get_tweets(panel_id,tweet_type,page_num);
	
}

//Send a tweet
function send_tweet(panel_id) {
	
	var tweet = $('#panel_' + panel_id).find('.tweet_input').val();
	
	if (ADD_HASHTAG) {
	  	  
	  var hashtag = $('#panel_' + panel_id).find('input.add_hashtag').val();
	  
	  if (hashtag != "") {
	  
      if (hashtag.charAt(0) != '#') {
    
        hashtag = '#' + hashtag;
    
      }
  
      tweet += " " + hashtag;
      
    }
	  
	}
	
	var pan = get_panel_by_id(panel_id);
	

	
	if (pan.reply_to_name != null) {
		
		if (tweet.indexOf('@' + pan.reply_to_name) == -1) {
			
			pan.reply_id = -1;
			
		}
		
	} else {
		
		pan.reply_to_name = null;
		
	}
	
	save_panel(pan);
		
	var reply_to_id = pan.reply_to_id;
	
	if (tweet.length > 140) {
		
		alert ("Too many characters: " + tweet.length);
		return;
		
	}
	
	$('#panel_' + panel_id).find('.tweet_input').val('');
	
	$('#panel_' + panel_id).find('.length_notify_box').html('');
	
	$('#panel_' + panel_id).find('.last_update').val(tweet);
	
	//alert(tweet);
	
	var dm = false;
	
	if (pan.tweet_type == 'direct') {
		
		dm = true;
		$('#panel_' + panel_id).find('.dm_notify_box').html('')
		
	}
	
	if (PROXY) {
		
		proxy_send_tweet(panel_id,tweet,reply_to_id,pan.reply_to_name,dm);
		
	}
	

	if (XS) {
		
		js_send_tweet(panel_id,tweet,reply_to_id,pan.reply_to_name,dm);
		
	}
	
	pan.reply_to_id = -1;
	pan.reply_to_name = null;
	
	save_panel(pan);
	
	
}

//Reply
function reply_to_tweet(panel_id,tweet_id,user_name) {
	
	//alert("Replying to tweet id" + tweet_id + ' from ' + user_name);
	
	var pan = get_panel_by_id(panel_id);
	
	pan.reply_id = tweet_id;
	pan.reply_to_name = user_name;
	
	save_panel(pan);
	
	var tweet_input = $('#panel_' + panel_id).find('.tweet_input');
	tweet_input.focus();
	
	$.scrollTo( tweet_input, 20, {
	
		offset: { left: -20, top: -130 },
		axis: 'xy',
	
	} );
	
	
	if (pan.tweet_type == 'direct') {
		
		$('#panel_' + panel_id).find('.dm_notify_box').html("Direct message to @" + user_name);
		
	} else {
	
		tweet_input.val("@" + user_name + " ");
	
	}
}

//Deprecated?
function reply_button(panel_id,obj) {
	
	var tweet_id = $(obj).parent('.the_tweet').find('.tweet_id').val();
	var user_name = $(obj).parent('.the_tweet').find('.tweet_user_name').val();
	
	reply_to_tweet(panel_id,tweet_id,user_name);
	
}

//Called when the retweet button is clicked
function retweet_button(panel_id,tweet_id,user_name) {
		

	var tweet_to_rt = $('#panel_' + panel_id + 'tweet_' + tweet_id).find('.tweet_text').text();
	
	var rt_text = "RT @" + user_name + ": " + tweet_to_rt;
	
	if (rt_text.length > 140) {
		
		rt_text = rt_text.substring(0,137) + "..";
		
	}
	
	$('#panel_' + panel_id).find('.tweet_input').val(rt_text);
	
}

//Turn on or off a favorite
function toggle_favorite(panel_id,tweet_id) {
	
	//alert('favoriting ' + tweet_id + 'on panel ' + panel_id);
	
	var is_fav = $('#panel_' + panel_id + 'tweet_' + tweet_id).hasClass('favorite_tweet');
	
	if (is_fav) {
		
		$('#panel_' + panel_id + 'tweet_' + tweet_id).removeClass('favorite_tweet');
		
	} else {
		
		$('#panel_' + panel_id + 'tweet_' + tweet_id).addClass('favorite_tweet');
		
	}
	
	if (PROXY) {
		
		proxy_toggle_favorite(panel_id,tweet_id,!is_fav);
		
	}
	
	if (XS) {
		
		js_toggle_favorite(panel_id,tweet_id,!is_fav);
		
	}
	
}

//Toggle button
function toggle_favorite_button(panel_id,obj) {
	
	var tweet_id = $(obj).parent('.the_tweet').find('.tweet_id').val();
	toggle_favorite(panel_id,tweet_id);
	
}


//Function to automatically refresh tweets
function auto_update_tweets() {
	
		//alert('auto');
	
		if (AIR) {
			
			setTimeout(function() { auto_update_tweets() },UPDATE_FREQ);
			
		} else {
	
			setTimeout("auto_update_tweets()",UPDATE_FREQ);

		}
		
		
		/*
		if (front_panel != null) {
			get_tweets(front_panel,get_panel_by_id(front_panel).tweet_type,1);
		}
		*/
		
		
		for(i in tw_panels) {
			
			//if (tw_panels[i].panel_type != "shizzow_panel") {
			
				get_tweets(tw_panels[i].panel_id,tw_panels[i].tweet_type,1);
			
			//}
			
		}
		
		
	
}

//Manually refresh tweets - Called by the refresh button
function refresh_tweets() {
	
	$('#panels').find('.panel_id').each(
		function(i) {
			
			
			get_tweets(this.value,'regular',1);
			
		}
		);
	
}


//Gets the tweets from a user
//Used when displaying user info
function get_user_tweets(notify_window_link,user) {
	
	$('.get_user_tweets').hide();
	//$(notify_window_link).parent().append('tweets');
	
	if (XS) {
		
		js_get_user_tweets(user,$(notify_window_link).parent());
		
	}
	
	if (PROXY) {
		
		proxy_get_user_tweets(user,$(notify_window_link).parent());
		
	}
	
}

//Follow a Twitter user
function follow_user(panel_id,user_name) {
	
	if (PROXY) {
		
		proxy_follow_user(panel_id,user_name);
		
	}
	
	if (XS) {
		
		js_follow_user(panel_id,user_name);
		
	}
	
}