if (window.RUNTIME_LOC == undefined) {
	
	var RUNTIME_LOC = 'local/web';
	
}

if (window.MOBILE == undefined) {
	
	var MOBILE = false;
	
}

if (window.user_openid == undefined) {
	
	//var user_openid = '';
	
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
//Panel width
var PANEL_WIDTH = 500;
//Add a hashtag automatically
var ADD_HASHTAG = false;

/******************************** END OPTIONS **********************************/

var shizzow_data = null;  //for debugging

if (RUNTIME_LOC == 'air') {
	
	BIND_CLICKS = true;
	URL_BASE = 'http://combotweet.com/';
	XS = true;
	AIR = true;
	PROXY = false;
	
}

if (window.mt_options) {
	
	mt_options();
	
}


function update_settings() {
	
	if ( parseInt($('#refresh_freq').val()) != NaN) {
		UPDATE_FREQ = parseInt($('#refresh_freq').val()) * 1000;
	}
	
	DESTROY_TWEETS = $('#remove_old_tweets').attr('checked');
	
	ADD_HASHTAG = $('#add_hashtag').attr('checked');
	
	if (ADD_HASHTAG) {
	  
	  $('.add_hashtag').css('display','normal')
	  $('.add_hashtag').show()
	  
	} else {
	  
	  $('.add_hashtag').css('display','hidden')
	  $('.add_hashtag').hide()
	  
	}
	
	
	FONT_SIZE = parseInt($('#font_size').val());
	
	$('#panels').css('font-size',FONT_SIZE + '%');
	
	PANEL_WIDTH = parseInt($('#panel_width').val())
	
	if (PANEL_WIDTH < 400) {
		
		PANEL_WIDTH = 400;
		
	}
	
	update_widths();
	
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
	
	settings += '&'
	
	settings += "PANEL_WIDTH=" + PANEL_WIDTH;
	
	settings += '&'
	
	settings += "ADD_HASHTAG=" + ADD_HASHTAG;
	
	settings += '&'
		
	$.cookie('combotweet_settings',settings,{expires: 365})
	
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
			UPDATE_FREQ = parseInt(vals[1]);
		} else if (vals[0] == 'FONT_SIZE') {
			FONT_SIZE = parseInt(vals[1]);
			$('#panels').css('font-size','' + FONT_SIZE + '%')
		} else if (vals[0] == 'PANEL_WIDTH') {
			PANEL_WIDTH = parseInt(vals[1])
			update_widths();
		} else if (vals[0] == 'DESTROY_TWEETS') {
			if (vals[1] == 'false') {
				DESTROY_TWEETS = false
			} else {
				DESTROY_TWEETS = true	
			}
		} else if (vals[0] == 'ADD_HASHTAG') {
			if (vals[1] == 'false') {
				ADD_HASHTAG = false
			} else {
				ADD_HASHTAG = true	
			}
			$('.add_hashtag').css('display','normal')
		} else if (vals[0] == 'TABBED_PANELS') {	
			if (vals[1] == 'false') {
				TABBED_PANELS = false
			} else {
				TABBED_PANELS = true
				$('#header_nav_buttons').css('display','normal')
				$('#header_nav_buttons').show()	
			}
		}
		
	}
	
}

