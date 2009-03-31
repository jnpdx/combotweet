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
//auto save to openid?
var AUTO_SAVE = true;
//Frequency to auto save
var AUTO_SAVE_FREQ = 60000;
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
var CSS_FILE = 'dark.css';
//Font size in tweets
var FONT_SIZE = 100;
//Tabbed browsing
var TABBED_PANELS = false;
//Panel width
var PANEL_WIDTH = 500;
//Add a hashtag automatically
var ADD_HASHTAG = false;
//Display URL shortener
var SHOW_URL_SHORTNER = false;

/******************************** END OPTIONS **********************************/

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

//CSS FILE STUFF

get_css()

function get_css() {
  var cookie_css = readCookie('combotweet_css')

  if (cookie_css != null) {
    CSS_FILE = cookie_css
  }
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}


function update_settings() {
	
	var need_refresh = false;
	
	if ( parseInt($('#refresh_freq').val()) != NaN) {
		UPDATE_FREQ = parseInt($('#refresh_freq').val()) * 1000;
	}
	
	SHOW_URL_SHORTENER = $('#show_url_shortener').attr('checked');
	
	if (SHOW_URL_SHORTENER == false) {
	  $('.url_shortener_container').hide();
	  //alert("nope")
	} else {
	  
	  $('.add_hashtag').css('display','normal')
	  $('.url_shortener_container').show();
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
		need_refresh = true
	}
	
	AUTO_SAVE = $('auto_save_checkbox').attr('checked');
	
	auto_save();
	
	if (CSS_FILE != $('#css_file_setting').val()) {
	  CSS_FILE = $('#css_file_setting').val()
	  need_refresh = true
	}
	
	save_settings_in_cookie();
	
	
	if (need_refresh) {
	  refresh_window();
	}
	
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
	
	settings += "AUTO_SAVE=" + AUTO_SAVE;
	
	settings += '&'
	
	settings += "ADD_HASHTAG=" + ADD_HASHTAG;
	
	settings += '&'
	
		
	$.cookie('combotweet_settings',settings,{expires: 365})
	$.cookie('combotweet_css',CSS_FILE,{expires: 365})
	
}

function get_settings_in_cookie() {
	
	var settings = $.cookie('combotweet_settings');
	
	if (settings == null) {
		
		return;
		
	}
	
	var settings_array = settings.split('&');
	
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
		} else if (vals[0] == 'AUTO_SAVE') {
			if (vals[1] == 'false') {
				AUTO_SAVE = false
			} else {
				AUTO_SAVE = true	
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

