if (window.RUNTIME_LOC == undefined) {
	
	var RUNTIME_LOC = 'local/web';
	
}

if (window.MOBILE == undefined) {
	
	var MOBILE = false;
	
}


/******************************** OPTIONS **********************************/

//Whether or not to destroy the oldest tweets when new ones are loaded
var DESTROY_TWEETS = true;
//Number of tweets to display on each panel at one time
var TWEET_DISPLAY_LIMIT = 20;
//Radius for location-based search
var LOCATION_SEARCH_DISTANCE = '5mi';
//Not currently used
var UPDATE_LOCATION = false;
//Frequency of auto-updates
var UPDATE_FREQ = 45000;
//Automatically refresh data?
var AUTO_UPDATE = true;
//URL Base of the client - should work with '' in most cases
var URL_BASE = '';
//Deprecated
var BIND_CLICKS = false;
//If cross-site AJAX is allowed
var XS = false;
//Running in Adobe AIR?
var AIR = false;
//Need a proxy to run?  In browsers, this will be 'true' until XS Ajax is allowed
var PROXY = true;
//Relative URL of the css file for the client
var CSS_FILE = 'front/newui.css';
//Font size in tweets
var FONT_SIZE = 100;
//Tabbed browsing
var TABBED_PANELS = false;


/******************************** END OPTIONS **********************************/
var shizzow_data = null;  //for debugging

if (RUNTIME_LOC == 'air') {
	
	BIND_CLICKS = true;
	URL_BASE = 'http://twitter.tagal.us/';
	XS = true;
	AIR = true;
	PROXY = false;
	
}

if (window.mt_options) {
	
	mt_options();
	
}

/********************************** GLOBALS *************************************/

var selected_tweet = -1;

var selected_tweet_panel = 0;

var tw_panels = new Array();

var front_panel = null;

var user_loc = "";

var plugin_hooks = new Array();

/********************************* STARTUP **************************************/

//jQuery hook for anything that must be run at startup
$(document).ready(function() {

	if (!AIR) {
		
		doc_ready_functions();
	
	}
	
});

//Startup functions
//Loads the session panels, and starts the auto_update routines to refresh tweets
//Adding search panels seems buggy
function doc_ready_functions() {
		
	//$('#nav_buttons').sortable();

	get_settings_in_cookie();

	get_session_panels();
	
	if (window.request_panes != undefined) {
		
		
		//get the panels set in the request uri (search=1,2,3)
		for (i in request_panes) {
			
			add_search_panel(request_panes[i]);
			
		}
		
		request_panes = undefined;
		
	}

	if (AUTO_UPDATE) {
	
		auto_update_tweets();
	
	}
	
	bind_shortcuts();
	
}

function bind_shortcuts() {
	
		shortcut.add("up",function() {
			
			goto_previous_tweet();
			//alert("up")
			
		});
		
		shortcut.add("down",function() {
			
			goto_next_tweet();
			//alert('down')
			
		});
		
		shortcut.add("left",function() {
			
			goto_previous_panel();
			//alert('down')
			return false;
			
		});
		
		shortcut.add("right",function() {
			
			goto_next_panel();
			//alert('down')
			return false;
			
		});
		
	
}

/******** GOTO *******/



function goto_previous_tweet() {
	
		scroll_to_tweet(selected_tweet_panel,selected_tweet - 1);

}

function goto_next_tweet() {
		
	scroll_to_tweet(selected_tweet_panel,selected_tweet + 1);
	
	
}

function goto_previous_panel() {

	scroll_to_tweet(selected_tweet_panel - 1,selected_tweet)
	
}

function goto_next_panel() {
	
	scroll_to_tweet(selected_tweet_panel + 1,selected_tweet)
	
}

function scroll_to_tweet(panel_index, index) {

	//console.log("going to tweet " + index + " on panel " + panel_index)
	

	if (tw_panels.length == 0) {
		
		return;
		
	}

	var panel_name = tw_panels[selected_tweet_panel].panel_id;

	//console.log("removing selected_tweet from " + selected_tweet + " on panel " + panel_name)
	
	//$('#panel_' + panel_name + ' div.tweet:eq(' + selected_tweet + ')').removeClass('selected_tweet')
	
	$('.tweet').removeClass('selected_tweet')
	
	if (panel_index != selected_tweet_panel) {
		
		if ((panel_index > -1) && (panel_index < tw_panels.length)) {
			
			if (index >= tw_panels[panel_index].panel_data.length) {
				
				index = tw_panels[panel_index].panel_data.length - 1;
				
			}
			
			selected_tweet_panel = panel_index;
			
		}
		
	}
	
	if (index == -2) {
		
		if (selected_tweet_panel == 0) {
			//already on the first panel - can't go back any more
			index = -1;
		} else {
			
			selected_tweet_panel = selected_tweet_panel - 1;
			
			panel_name = tw_panels[selected_tweet_panel].panel_id;
			
			index = tw_panels[selected_tweet_panel].panel_data.length - 1;
			
		}
		
	}
	
	if (index >= tw_panels[selected_tweet_panel].panel_data.length) {
		
		if (selected_tweet_panel < (tw_panels.length -1)) {
			
			selected_tweet_panel++;
			
			panel_name = tw_panels[selected_tweet_panel].panel_id;
			
			index = -1;
			
		} else {
			
			index = tw_panels[selected_tweet_panel].panel_data.length - 1;
			
		}
		
	}
	
	if (index != -1) {

		$.scrollTo( $('#panel_' + panel_name + ' div.tweet:eq(' + index + ')'), 400, {
		
			offset: { left: 0, top: -90 }
		
		} );	
	
		$('#panel_' + panel_name + ' div.tweet:eq(' + index + ')').addClass('selected_tweet')
	} else {
		//scroll to the twitter inputs
		
		$.scrollTo( $('#panel_' + panel_name + ''), 400, {
		
			offset: { left: 0, top: -110 }
		
		} );
		
	}
	
	selected_tweet = index;
	
	//console.log("went to tweet " + selected_tweet + " on panel " + selected_tweet_panel)
	
}

 
/********************************** OBJECTS **************************************/

//Object for each Panel
function Data_Panel(pan_id,type,t_user,t_pass,info) {
	
	this.panel_id = pan_id;	
	this.panel_type = type;
	this.user = t_user;
	this.pass = t_pass;
	this.gen_info = info;
	
	this.selected_tweet = null;
	
	this.auth = make_base_auth(t_user,t_pass);
	
	this.latest_tweet_id = '-1';
	
	this.tweet_type = null;
	this.panel_data = new Array();
	
	this.reply_id = -1;
	this.reply_to_name = null;
	
	this.tweet_display_limit = TWEET_DISPLAY_LIMIT;
	
}

//Object for plugin
//Non-functioning so far
function CT_Plugin(hook_handle,callback_fn) {
	
	this.hook = hook_handle;
	this.callback = callback_fn;
	
}

/******************************** GENERAL FUNCTIONS *****************************/

//Looks through tw_panels to find panel with matching id
function get_panel_by_id(panel_id) {
	
	for (pan in tw_panels) {
		
		if (tw_panels[pan].panel_id == panel_id) {
			
			return tw_panels[pan];
			
		}
		
	}
	
	return null;
	
}

//Saves the state of a panel
function save_panel(panel_id,pan) {
	
	for (panel in tw_panels) {
		
		if (panel.panel_id == panel_id) {
			
			panel = pan;
			
		}
		
	}
	
	if (AIR) {
		
		air_save_panels();
		
	}
	
}

//Retrieves panels from previous session
function get_session_panels() {
	
	if (AIR) {
		
		air_get_session_panels();
		
		return;
	}
	
	if (PROXY) {
		
		proxy_get_session_panels();
		
		return;
		
	}
	
}

//Get the tweets/shouts/etc for a given panel
function get_tweets(panel_id,type,page_num) {

	//get the first tweet
	
	
	if (panel_id == null) {
		
		return;
		
	}
	
	
	var pan = get_panel_by_id(panel_id);

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

//Reply
function reply_to_tweet(panel_id,tweet_id,user_name) {
	
	//alert("Replying to tweet id" + tweet_id + ' from ' + user_name);
	
	var pan = get_panel_by_id(panel_id);
	
	pan.reply_id = tweet_id;
	pan.reply_to_name = user_name;
	
	save_panel(pan);
	
	var tweet_input = $('#panel_' + panel_id).find('.tweet_input');
	tweet_input.focus();
	
	$.scrollTo( $('#panel_' + panel_id + ''), 20, {
	
		offset: { left: 0, top: -110 }
	
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

//Updates the timestamp on displayed tweets for a given panel
function update_times(panel_id) {
	
	var pan = get_panel_by_id(panel_id);
	
	cur_date = new Date();
	
	if (pan.panel_data != undefined) {
		for (var t = 0; t < pan.panel_data.length; t++) {
	
			$('#tweet_time_' + pan.panel_data[t].id).html(get_time_text(cur_date,new Date(pan.panel_data[t].created_at)));
	
		}
	}
	
}

//Returns a string representing the age of the tweet. Eg "2 minutes ago", "4 hours ago"
function get_time_text(cur_date,created_date) {
		
	var time_diff = parseInt((cur_date.getTime() - created_date.getTime()) / 1000);
	
	
	if (time_diff <= (60 * 60 * 12))  {//12 hours ago
		
		if (time_diff <= 60) {
			return "Less than a minute ago ";
		} else if (time_diff < 3600) {
			var min_ago = parseInt(time_diff / 60);
			return min_ago + " minutes ago ";
		} else {
			var hrs_ago = parseInt(time_diff / 3600);
			return hrs_ago + " hours ago ";
		}
		
	} else {
		return created_date + " ";
	}
	
}

//NEWUI - Should add header to top instead of a tab
function add_new_nav_button(panel_id) {
	
	
	var panel_name = get_panel_user_name(panel_id);
	
	var close_button_code = '<img src="' + URL_BASE + 'images/Cancel.png" id="remove_panel_' + panel_id + '"  class="close_panel" onclick="remove_panel(\'' + panel_id + '\')" alt="Close Panel" title="Close this panel" />';
	
	var nav_button_code = '<div class="nav_button show_panel_' + panel_id + '" onclick="show_panel(\'' + panel_id + '\')">' + panel_name + close_button_code + '</div>';
	
	$('#header_nav_buttons').append(nav_button_code);
	
	
	$('#panel_' + panel_id).prepend(nav_button_code);
	
	
	if (!AIR) {
		$('#panels').sortable(
			{
				handle: '.nav_button',
				update: function() {
					//save_user_pref('panel_order',$('#nav_buttons').sortable('serialize'));
				},
			} 
			);
	}
	
}

//Create a new panel
function make_new_panel() {
		
	var u = $('#tw_user').val();
	var p = $('#tw_pass').val();
	
	$('#login_form').hide("slide", { direction: "up" }, 600);	
	
	$('#tw_user').val('');
	$('#tw_pass').val('');
	
	if ($('#account_type').val() == "shizzow") {
		make_new_shizzow_panel(u,p);
		return;
	}
	
	var new_id = u;
	
	if (get_panel_by_id(new_id) != null) {
		
		alert("You already have that panel open!");
		return;
		
	}	
	
	//check the login
	var good_login = true;
	
	if (PROXY) {
		
		good_login = proxy_check_login(u,p);
		
	}
	
	if (XS) {
		
		good_login = js_check_login(u,p);
		
	}
	
	if (!good_login) {
		
		alert("That login user/pass didn't work!");
		return;
		
	}
	
	
	//get the info
	
	var panel_info = null;
	
	if (XS) {
		
		panel_info = js_get_twitter_user_info(u);
		
	} else {
		
		panel_info = proxy_get_twitter_user_info(u);
		
	}
	
	
	var new_panel = new Data_Panel(new_id,'regular_panel',u,p,panel_info);
	
	tw_panels.push(new_panel);
	
	if (AIR) {
		
		air_save_panels();
		
	}
	
	//register the panel
	
	if (!AIR) {
		var old_panel_code = proxy_get_panel(new_id,u,p,panel_info);
	}
	
	
	//get the html
	
	var panel_code = js_get_panel(new_id,u,p,panel_info);
		
		
		
	//set up panel
	set_up_panel(new_id,panel_code,u,p);
	
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

//Remove a panel
function remove_panel(panel_id) {
	
	$('#panel_' + panel_id).remove();
	
	if (!TABBED_PANELS) {
		$('#panels').width($('#panels').width() - 520)
	} else {
		$('.show_panel_' + panel_id).remove();
	}
	
	$('#show_panel_' + panel_id).remove();
	
	//remove from tw_panels
	
	for (i = 0; i < tw_panels.length; i++) {
		
		if (tw_panels[i].panel_id == panel_id) {
			
			tw_panels.splice(i,1);
			
		}
		
	}
	
	if (PROXY) {

		proxy_remove_panel(panel_id);

	}	
	
		
	if (AIR) {
		
		air_remove_panel(panel_id);	
	
	}

	//show the first available panel?
	
	front_panel = tw_panels[0].panel_id;
	
	show_panel(front_panel);
	
		
}

//Asks the user to enter a search term
function prompt_search_term() {
	
	var search_prompt = "Enter a search term:";
	
	
	/*
	if (navigator.geolocation) {
		
		search_prompt += ' (use "location 5mi" syntax for location based search)';
		
	}
	*/
	
	var search_term = prompt(search_prompt);
	
	return search_term;
	
}

//Add a search panel
function add_search_panel(search_term) {
	
	if (search_term == null) {
		
		search_term = prompt_search_term();
		
	}
	
	if ((search_term == "") || (search_term == null)) {
		
		return;
		
	}
	
	var panel_id = "Search " + search_term;
	
	//panel_id = panel_id.replace(/ /g,'_');
	var d = new Date();
	
	panel_id = "Search_" + d.getTime();
	
	if (get_panel_by_id(panel_id) != null) {
		
		alert("You already have a panel open like that!");
		return;
		
	}
	
	/*
	if (search_term.indexOf("location") == 0) {
		
		if (search_term.indexOf(" ") != -1) {
			
			LOCATION_SEARCH_DISTANCE = (search_term.split(" "))[1];
			search_term = "location"
			
		}
		
		if (navigator.geolocation) {
			
			navigator.geolocation.getCurrentPosition(function(position) {  
			  		//alert("You seem to be at: " + position.latitude + ',' + position.longitude);  
					user_loc = position.latitude + '%2C' + position.longitude;
					refresh_tweets();
				}  
			);
			
		}
		
	}
	*/
	
	var new_panel = new Data_Panel(panel_id,'search_panel',search_term,'_search',null);
	
	tw_panels.push(new_panel);
	
	if (AIR) {
		
		air_save_panels();
		
	}
		
	var data = js_get_search_panel(panel_id,search_term,'_search'); //get the html
	
	if (PROXY) {
		var old_data = proxy_get_search_panel(panel_id,search_term,'_search');//register the panel
	}
	
	set_up_panel(panel_id, data, search_term,"_search");
	
	return false;
	
}

//Displays a panel, gets the tweets, and adds a nav button
//Called when a panel is being made
function set_up_panel(id, data, t_user, t_pass) {
	
	$('#panels').append(data);

	if (!TABBED_PANELS) {
		$('#panels').width($('#panels').width() + 520)
	}

	add_new_nav_button(id);
	show_panel(id);
	get_tweets(id,'regular',1);
	
}

//Show a panel
function show_panel(panel_id) {
				
	if (panel_id == undefined) {
		
		return;
		
	}	

	
	var pan = get_panel_by_id(panel_id);
	
	if (pan == null) {
		
		return;
		
	}
	
	front_panel = panel_id;
	
	if (TABBED_PANELS) {
		$('.twitter_panel').hide();
		$('div#header_nav_buttons div.nav_button').removeClass('button_highlighted');
		$('div#header_nav_buttons div.show_panel_' + panel_id).addClass('button_highlighted');
	}
	
	$('#panel_' + panel_id).show();

	

	
	
	
	if (pan.tweet_type == null) { pan.tweet_type = 'regular'; save_panel(panel_id,pan); }
	
	$('#panel_' + panel_id + '_' + pan.tweet_type).show();
	
	//$('.tweet_type_button').css("background","#eee");
	//$('.tweet_type_button').css("border","1px solid #aaa");
	//$('.tweet_type_button').removeClass('button_highlighted');
	
	//$('#panel_' + panel_id + "_" + pan.tweet_type).css("background","white");
	//$('#panel_' + panel_id + "_" + pan.tweet_type).css("border-bottom","1px solid white");
	$('#panel_' + panel_id + "_" + pan.tweet_type).addClass('button_highlighted');
	
	
	$('#panel_' + panel_id).find('.tweet_input').keyup(function() {
		
		length_notify(panel_id);
		
	});
	
	if (TABBED_PANELS) {
		var bg_url = $('#panel_' + panel_id).find('.panel_background').val();
	
		if (!MOBILE) {
			//alert("setting background");
			//$('body').css('background',"url('" + bg_url + "') no-repeat fixed");
			//$('body').css('background-color',"#" + $('#panel_' + panel_id).find('.panel_background_color').val());
		}
	}
	
	
}

//Returns a string represting the panel for use in the tabs
//For Twitter panels, this is just the user name
//For search, it is "Search: TERM"
//For Shizzow, "Shizzow: USER"
function get_panel_user_name(panel_id) {
	
	if (panel_id.indexOf('Search_') != -1) {
		
		return "Search: " + $('#panel_' + panel_id).find('.panel_user_name').val();
		
	}
	
	if (panel_id.indexOf('Shizzow_') != -1) {
		
		return "Shizzow: " + $('#panel_' + panel_id).find('.panel_user_name').val();
		
	}
	
	return panel_id;
	
	/*
	
	var n =  $('#panel_' + panel_id).find('.panel_user_name').val();
	
	if (n == "location") {
		
		return "within " + LOCATION_SEARCH_DISTANCE;
		
	}
	
	if ($('#panel_' + panel_id).find('.panel_type').val() == "search_panel") {
		
		return "Search: " + n;
	}
	
	return n;
	
	*/
	
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
			
			if (tw_panels[i].panel_type != "shizzow_panel") {
			
				get_tweets(tw_panels[i].panel_id,tw_panels[i].tweet_type,1);
			
			}
			
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

//Displays or hides the user/pass form
//Should be "toggle_login_form" for consistency
function show_login_form() {
	$('#login_form').css('left',$(window).width() - 420)
	
	$('#login_form').toggle("slide", { direction: "up" }, 400,
	function() {
		
		$('#login_form:visible').find('#tw_user').focus();
		
		
	}
	);
}

function show_settings_form() {
	
	$('#settings_form').css('left',$(window).width() - 600)
	
	$('#settings_form').toggle("slide", { direction: "up" }, 400,
	function() {
		$('#tabbed_panels').attr('checked', TABBED_PANELS );
		$('#refresh_freq').val('' + (UPDATE_FREQ / 1000));
		$('#remove_old_tweets').attr('checked', DESTROY_TWEETS );
		$('#font_size').val('' + FONT_SIZE);
	}
	);
	
}

function update_settings() {
	
	if ( parseInt($('#refresh_freq').val()) != NaN) {
		UPDATE_FREQ = parseInt($('#refresh_freq').val()) * 1000;
	}
	
	DESTROY_TWEETS = $('#remove_old_tweets').attr('checked');
	
	FONT_SIZE = parseInt($('#font_size').val());
	
	$('#panels').css('font-size',FONT_SIZE + '%');
	
	if (TABBED_PANELS != $('#tabbed_panels').attr('checked')) {
		TABBED_PANELS = $('#tabbed_panels').attr('checked');
		refresh_window();
	}
	
	save_settings_in_cookie();
	
	show_settings_form();
	
}

function save_settings_in_cookie() {
	
	var settings = '';
	
	settings += "UPDATE_FREQ=" + UPDATE_FREQ;
	
	settings += '&'
	
	settings += "TABBED_PANELS=" + TABBED_PANELS;
	
	settings += '&'
	
	settings += "FONT_SIZE=" + FONT_SIZE;
	
	settings += '&'
	
	settings += "DESTROY_TWEETS=" + DESTROY_TWEETS;
	
	$.cookie('combotweet_settings',settings)
	
}

function get_settings_in_cookie() {
	
	var settings = $.cookie('combotweet_settings');
	
	if (settings == null) {
		
		return;
		
	}
	
	settings_array = settings.split('&');
	
	for (i in settings_array) {
		
		var vals = settings_array[i].split('=');
		
		if (vals[0] == 'UPDATE_FREQ') {
			UPDATE_FREQ = vals[1];
		} else if (vals[0] == 'FONT_SIZE') {
			FONT_SIZE = vals[1];
		} else if (vals[0] == 'DESTROY_TWEETS') {
			if (vals[1] == 'false') {
				DESTROY_TWEETS = false
			} else {
				DESTROY_TWEETS = true	
			}
		} else if (vals[0] == 'TABBED_PANELS') {	
			if (vals[1] == 'false') {
				TABBED_PANELS = false
			} else {
				TABBED_PANELS = true
				$('#header_nav_buttons').show()	
			}
		}
		
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
	
	$('#panel_' + panel_id).find('.length_notify_box').html(char_span + (140 - chars_typed) + " characters left</span>");

	
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
	
	for (i in data.results.shouts) {
		
		var to_add = "";
		
		
		var cur_shout = data.results.shouts[i];
		
		var s_id = cur_shout.shouts_history_id;
		
		to_add += '<div class="tweet" id="shout_' + s_id + '">';
		
		to_add += '<div class="avatar_container"><img class="avatar" src="' + data.results.shouts[i].people_images.people_image_48 + '" alt="Avatar"/></div>';
		
		to_add += '<div class="the_tweet">';
		
		var shout_message = '';
		
		if (cur_shout.shouts_messages != null) {
			
			shout_message = cur_shout.shouts_messages[0].message;
			
		}
		
		to_add += cur_shout.people_name + " shouted from " + cur_shout.places_name;
		
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
		
		$('#panel_' + panel_id).find('.tweets').append(to_add);
		
		$('#panel_' + panel_id).find('#shout_' + s_id).show();
		
	}
	
	
	
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
					
					profile_image_url = tweet.sender.profile_image_url;
					
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
		
			tweet_div += '<span id="tweet_time_' + tweet.id + '">' + get_time_text(cur_date,created_date) + "</span>";
		
		
			if (tweet.in_reply_to_screen_name != undefined) {
			
				tweet_div += 'In reply to <a href="http://twitter.com/' + tweet.in_reply_to_screen_name + '">' + tweet.in_reply_to_screen_name + '</a> ';
			
			}
		
			if (!is_search) {
				if (type != 'direct') {
					tweet_div += 'from ' + tweet.source;
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
				return '<a target="_blank" href="http://tagal.us/tag/' + tag + '" onclick="return follow_link(\'http://tagal.us/tag/' + tag + '\');">' + t + '</a>';
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

//Shows a notification window
//Right now, this is a lightbox style window w/dropshaddow
function show_notify_window(html) {
	
	$('#notify_overlay').css('opacity','0.5');
	$('#notify_overlay').css('height',$(document).height());
	
	$('#notify_overlay').show();
	
	$('#notify_window').css('left',($(window).width() / 2) - 200);
	$('#notify_window').css('top',$(window).scrollTop() + 50);
	$('#notify_window').css('opacity','1');
	
	
	
	$('#notify_content').html(html);
	
	$('#notify_window').show();
	
}

//Hides the notification window
function hide_notify_window() {
	
	$('#notify_overlay').hide();
	
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

/******************************** CT PLUGINS CODE ********************************/

//Plugins are not yet functioning

function register_plugin(hook,callback_fn) {
	
	var plug = new CT_Plugin(hook,callback_fn);
	plugin_hooks.push(plug);
	
}

function get_plugins(hook) {
	
	
	
}

function run_plugins(hook,args) {
	
	for(i = 0; i < plugin_hooks.length; i++) {
		
		if (plugin_hooks[i].hook == hook) {
			eval(plugin_hooks.callback_fn);
		}
		
	}
	
}


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
			
			
		$('#panels').append(data);
		
		//$('.twitter_panel').hide();  //this hides all of them - should only hide front?	
		
		if (TABBED_PANELS) {
			$('#panels').width(520);
		}
		
		$('#panels').find('.twitter_panel').each(
			function(i) {
				
				if ($(this).is('.proxy_panel')) {
					var panel_id = $(this).find('.panel_id');
					var pan_type = $(this).find('.panel_type').val();
					var pan_user = $(this).find('.panel_user_name').val();
					
					tw_panels[tw_panels.length] = new Data_Panel(panel_id.val(),pan_type,pan_user,'',null);
					add_new_nav_button(panel_id.val());
					get_tweets(panel_id.val(),"regular",1);
					//get_last_update(panel_id.value);
										
					if (!TABBED_PANELS) {
						$('#panels').width($('#panels').width() + 520)
					}
					
					show_panel(panel_id.val())
					
				}
				
			}
			);

		
				
		//now we have to add buttons
		//and get tweets
		
		hide_loader();
		
	},
	"html");
	
	
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

	panel_html += '<div class="twitter_inputs"><span class="dm_notify_box"></span><textarea class="tweet_input" name="tweet_input" rows="3" cols="30"></textarea><input type="button" class="tweet_submit" onclick="send_tweet(\'' + panel_id + '\')" value="Update"/><span class="length_notify_box" id="chars_left_panel_' + panel_id + '"></span><br class="clear_both"/></div>';
	panel_html += '<div class="last_update"></div>';
	panel_html += '<div class="tweet_type_menu"><div class="tweet_type_button" id="panel_' + panel_id + '_regular" onclick="get_tweets(\'' + panel_id + '\',\'regular\',1)">Timeline</div><div class="tweet_type_button" id="panel_' + panel_id + '_replies" onclick="get_tweets(\'' + panel_id + '\',\'replies\',1)">Replies</div><div class="tweet_type_button" id="panel_' + panel_id + '_direct" onclick="get_tweets(\'' + panel_id + '\',\'direct\',1)">Direct messages</div><br class="clear_both" /></div>';

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
	panel_html += '<div class="twitter_inputs"><textarea class="tweet_input" name="tweet_input" rows="3" cols="30"></textarea><br/>Location: <select class="shizzow_favorites"></select><br/><input type="button" class="tweet_submit" onclick="send_shout(\'' + panel_id + '\')" value="Update"/><span class="length_notify_box" id="chars_left_panel_' + panel_id + '"></span><br class="clear_both"/></div>';
	panel_html += '<div class="tweet_type_menu"></div><div class="tweets"></div>';
	panel_html += '<div class="more_tweets" onclick="get_more_tweets(\'' + panel_id + '\'); return false;">Load more tweets...</div>';
	panel_html += '</div>';
	panel_html += '';
	
	return panel_html;
	
}

/***********************************  AIR FUNCTIONS *********************************/

function air_remove_panel(panel_id) {
	
	window.parentSandboxBridge.air_remove_panel();
	
}

function air_save_panels() {
	
	window.parentSandboxBridge.air_save_panels(tw_panels);
	
}

function air_get_session_panels() {
	
	
	var stored_v = window.parentSandboxBridge.air_get_session_panels();
	
	//air.trace(s); // "foo"
	
	//alert("Okay, back here got " + stored_v);
	
	var saved_panels = eval('(' + stored_v + ')');
	
	if (saved_panels == undefined) { return; }
	
	//for(i = 0; i < saved_panels.length; i++) {
	for (i = 0; i < 100; i++) {
		
		//alert(saved_panels['' + i]);
		
		if (saved_panels['' + i] == undefined) { return; }
				
		var pan = saved_panels['' + i];
		
		pan.latest_tweet_id = '-1';
		
		pan.panel_data = new Array();
		
		tw_panels.push(pan);
		
		var pan_html = js_get_panel(pan.panel_id,pan.user,pan.pass,pan.gen_info);
		
		set_up_panel(pan.panel_id, pan_html, pan.user, pan.pass);
		
				
	}
	
}

function air_destroy_db() {
	
			window.parentSandboxBridge.air_destroy_db();

	
}

function air_get_search_tweets(panel_id,search_term, tweet_type,page,since,location,location_search_dist) {
	
	//air_get_search_tweets(panel_id,search_term,page,since_req,location,location_search_dist);
	
	window.parentSandboxBridge.get_search_tweets(panel_id,search_term, tweet_type,page,since,location,location_search_dist,function(p,tweet_type,page,d) {
		parse_get_tweets_data(panel_id,tweet_type,page,d);
		
	});
	
}









/******* FROM http://delete.me.uk/2005/03/iso8601.html ******/

//Used to allow Date to parse ISO 8601
//Shizzow uses this format for their dates
//Doesn't work properly with Time zones, so isn't currently used
Date.prototype.setISO8601 = function (string) {
    var regexp = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})" +
        "(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?" +
        "(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?";
    var d = string.match(new RegExp(regexp));

    var offset = 0;
    var date = new Date(d[1], 0, 1);

    if (d[3]) { date.setMonth(d[3] - 1); }
    if (d[5]) { date.setDate(d[5]); }
    if (d[7]) { date.setHours(d[7]); }
    if (d[8]) { date.setMinutes(d[8]); }
    if (d[10]) { date.setSeconds(d[10]); }
    if (d[12]) { date.setMilliseconds(Number("0." + d[12]) * 1000); }
    if (d[14]) {
        offset = (Number(d[16]) * 60) + Number(d[17]);
        offset *= ((d[15] == '-') ? 1 : -1);
    }

    offset -= date.getTimezoneOffset();
    time = (Number(date) + (offset * 60 * 1000));
    this.setTime(Number(time));
}



