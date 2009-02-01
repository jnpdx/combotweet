if (RUNTIME_LOC == undefined) {
	
	var RUNTIME_LOC = 'local/web';
	
}

var tw_panels = new Array();

var bad_login = false;

var panel_data = new Array();

var latest_tweet_ids = new Array();

var panel_types = new Array();

var panel_tweet_types = new Array();

var panel_reply_ids = new Array();

var panel_reply_names = new Array();

var front_panel = null;

var user_loc = "";



/******************************** OPTIONS **********************************/


var DESTROY_TWEETS = true;
var TWEET_DISPLAY_LIMIT = 30;
var LOCATION_SEARCH_DISTANCE = '5mi';
var UPDATE_LOCATION = false;
var UPDATE_FREQ = 45000;  //in miliseconds
var AUTO_UPDATE = true;
var URL_BASE = '';
var BIND_CLICKS = false;
var XS = false; //cross site ajax
var AIR = false;


/******************************** END OPTIONS **********************************/


if (RUNTIME_LOC == 'air') {
	
	BIND_CLICKS = true;
	URL_BASE = 'http://twitter.tagal.us/';
	XS = true;
	AIR = true;
	
}


/********************************* STARTUP **************************************/

$(document).ready(function() {

	$('#nav_buttons').sortable();


	get_session_panels();
	
	if (AUTO_UPDATE) {
		
		auto_update_tweets();
		
	}
	

});



function Twitter_Panel(id,t_user,t_pass,load_panel,info) {
	
	this.gen_info = info;
	
	this.user = t_user;
	this.pass = t_pass;
	this.panel_id = id;
		
	tw_panels.push(this);
	
	if (AIR) {
	
		save_panels();
	
	}
	
	if (t_pass == '_search') {  // if it's a search panel
		
		if (!XS) {
		
			$.post(URL_BASE + 'bin/ajax.php', {
				func: "get_search_panel",
				panel_id: this.panel_id,
				search_term: t_user,
			}, function(data,textStatus) {
			
				$('#panels').append(data);
				add_new_nav_button(id);
				get_tweets(id,'regular',1);
			
			
			},"html");
					
		} else {
			
			js_get_search_panel(panel_id,t_user,t_pass);
			
		}
		
		return;
	}
	
	
	//regular panel
	
	bad_login = false;
	
	
	if (!XS) {
		
		$.post(URL_BASE + 'bin/ajax.php', {
			func: "get_panel",
			panel_id: this.panel_id,
			user: t_user,
			pass: t_pass,
		}, function(data,textStatus) {
	
			if (data.indexOf("ERROR=Bad Login") != -1) {
			
				alert("That login name/password didn't seem to work - please try again");
				tw_panels.pop();
				bad_login = true;
			
			} else {
				
				set_up_panel(id,data, t_user, t_pass);
				
			}
		},
		"html");
		
	} else {
		
		if (this.gen_info == null) {
			this.gen_info = js_get_twitter_user_info(t_user);
			save_panels();
		}
		js_get_panel(this.panel_id,t_user,t_pass,this.gen_info,load_panel);
		
	}
		
	
}


function get_session_panels() {
	
	if (AIR) {

		get_panels();
		
		return;
	}
	
	show_loader();
	
	$.post(URL_BASE + 'bin/ajax.php', {
		func: "get_session_panels",
	}, function(data) {
			
		$('#panels').append(data);
		
		$('.twitter_panel').hide();
		
		$('#panels').find('.panel_id').each(
			function(i) {
				
				tw_panels[tw_panels.length] = "SESSION_PANEL";
				add_new_nav_button(this.value);
				get_tweets(this.value,"regular",1);
				get_last_update(this.value);
				
			}
			);
			
		var last_panel = $('.twitter_panel:first').find('.panel_id').val();
		show_panel(last_panel);
		$('.nav_button:first').css('background','white');
		$('.nav_button:first').css('border-bottom','1px solid white');
				
		//now we have to add buttons
		//and get tweets
		
		hide_loader();
		
	},
	"html");
	
}


function set_up_panel(id, data, t_user, t_pass) {
	
	$('#panels').append(data);

	//bind click listeners
	if (BIND_CLICKS) {
		$('#panel_' + id).find('.more_tweets').click(function() { get_more_tweets(id) });
		$('#panel_' + id).find('.tweet_submit').click(function() { send_tweet(id) });

		if (t_pass != '_search') {


				$('#panel_' + id + '_regular').click(function() { get_tweets(id,'regular',1); });
				$('#panel_' + id + '_direct').click(function() { get_tweets(id,'direct',1); });
				$('#panel_' + id + '_replies').click(function() { get_tweets(id,'replies',1); });


		}

	}



	add_new_nav_button(id);
	show_panel(id);
	get_tweets(id,'regular',1);
	
}

function get_last_update(panel_id) {
	
	if ($('#panel_' + panel_id).find('.panel_type').val() == "search_panel") {
		
		return "";
		
	}
	
	if (!XS) {
		$.post(URL_BASE + 'bin/ajax.php', {
			func: "get_last_update",
			panel: panel_id,
		}, function(data) {
			parse_last_update(panel_id,data);
		}, 'json');
	} else {
		js_get_last_update(panel_id);
	}
	
	
}

function get_tweets(panel_id,type,page_num) {

	//get the first tweet
	
	if (panel_id == null) {
		
		return;
		
	}
	
	if (latest_tweet_ids[panel_id] == undefined) {
		
		latest_tweet_ids[panel_id] = -1;
		
	}

	show_loader();

	var tweets = $('#panel_' + panel_id).find('.tweets');
	

	if (type == undefined) {
		
		type = 'regular';
		
	}
	
	
	
	if (type != 'direct') {
		
		tweets.find('.dm_notify_box').hide();
		
	} else {
		
		tweets.find('.dm_notify_box').show();
		
	}
	
	
	
	var init_load = false;
	
	if (panel_data[panel_id] == undefined) {
		
		panel_data[panel_id] = new Array();
		init_load = true;
		
	}
	
	if (panel_tweet_types[panel_id] == undefined) {
		
		panel_tweet_types[panel_id] = type;
		
	}
	
	if (panel_tweet_types[panel_id] != type) {
		
		tweets.html("");
		panel_tweet_types[panel_id] = type;
		panel_data[panel_id] = new Array();
		latest_tweet_ids[panel_id] = -1;
		
	}

	if (!XS) {
		$.post(URL_BASE + 'bin/ajax.php', {
			func: "get_tweets",
			panel: panel_id,
			tweet_type: type,
			page: page_num,
			since: latest_tweet_ids[panel_id],
			location: user_loc,
			location_search_dist: LOCATION_SEARCH_DISTANCE,
		}, function(data) {
			parse_get_tweets_data(panel_id,type,page_num,data);
		},
		"json");
	} else {
		js_get_tweets(panel_id, type, page_num, latest_tweet_ids[panel_id], user_loc, LOCATION_SEARCH_DISTANCE);
	}
	
	cur_date = new Date();
	
	if (panel_data[panel_id] != undefined) {
		for (var t = 0; t < panel_data[panel_id].length; t++) {
	
			$('#tweet_time_' + panel_data[panel_id][t].id).html(get_time_text(cur_date,new Date(panel_data[panel_id][t].created_at)));
	
		}
	}
	
	
}



function get_more_tweets(panel_id) {
	
	
	//determine what page to get
	
	//up the limit
	if (DESTROY_TWEETS) {
		
		TWEET_DISPLAY_LIMIT += 20;
		
	}
	
	var num_tweets = panel_data[panel_id].length;
	
	
	if ((num_tweets % 20) != 0) {
		
		num_tweets++;
		
	}
	
	var page_num = Math.ceil(num_tweets / 20) + 1;
	
	var tweet_type = 'regular';
	
	if (panel_tweet_types[panel_id] != undefined) {
		
		tweet_type = panel_tweet_types[panel_id];
		
	}
	
	get_tweets(panel_id,tweet_type,page_num);
	
}

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

function parse_tweet(tweet) {
	
	var new_tweet = tweet;
	
	var url_RE = /https?:\/\/([-\w\.]+)+(:\d+)?(\/([\w/_\.]*(\?\S+)?)?)?/gi;
	new_tweet =  tweet.replace(url_RE,"<a target=\"_blank\" class=\"tweeted_link\" href=\"$&\">$&</a>");
	
	var hashtag_RE = /[#]+[A-Za-z0-9-_]+/gi;
	new_tweet = new_tweet.replace(hashtag_RE,
		function(t) {
				var tag = t.replace("#","")
				return t.link("http://tagal.us/tag/"+tag);
		}
		);
	
	var username_RE = /[@]+[A-Za-z0-9-_]+/gi;
	
	new_tweet = new_tweet.replace(username_RE, function(u) {
		
		var username = u.replace("@","");
		return u.link("http://twitter.com/"+username);
		
	});
	
	
	return new_tweet;
}

function get_panel_tweet_type(panel_id) {
	
	if (panel_tweet_types[panel_id] == undefined) {
		
		panel_tweet_types[panel_id] = 'regular';
		
	}
	
	return panel_tweet_types[panel_id];
	
}

function reply_to_tweet(panel_id,tweet_id,user_name) {
	
	panel_reply_ids[panel_id] = tweet_id;
	panel_reply_names[panel_id] = user_name;
	
	var tweet_input = $('#panel_' + panel_id).find('.tweet_input');
	tweet_input.focus();
	
	
	if (get_panel_tweet_type(panel_id) == 'direct') {
		
		panel_reply_ids[panel_id];
		$('#panel_' + panel_id).find('.dm_notify_box').html("Direct message to @" + user_name);
		
	} else {
	
		tweet_input.val("@" + user_name + " ");
	
	}
}

function send_tweet(panel_id) {
	
	var tweet = $('#panel_' + panel_id).find('.tweet_input').val();
	
	if (panel_reply_ids[panel_id] == undefined) {
		
		panel_reply_ids[panel_id] = 0;
		
	}
	
	if (panel_reply_names[panel_id] != undefined) {
		
		if (tweet.indexOf('@' + panel_reply_names[panel_id]) == -1) {
			
			panel_reply_ids[panel_id] = 0;
			
		}
		
	} else {
		
		panel_reply_names[panel_id] = "";
		
	}
		
	var reply_to_id = panel_reply_ids[panel_id];
	
	if (tweet.length > 140) {
		
		alert ("Too many characters: " + tweet.length);
		return;
		
	}
	
	$('#panel_' + panel_id).find('.tweet_input').val('');
	
	$('#panel_' + panel_id).find('.length_notify_box').html('');
	
	$('#panel_' + panel_id).find('.last_update').val(tweet);
	
	//alert(tweet);
	
	var dm = false;
	
	if (get_panel_tweet_type(panel_id) == 'direct') {
		
		dm = true;
		
	}
	
	if (!XS) {
	
			$.post(URL_BASE + 'bin/ajax.php', {
				func: "send_tweet",
				panel: panel_id,
				tweet_data: tweet,
				reply_to: reply_to_id,
				reply_to_name: panel_reply_names[panel_id],
				direct_message: dm,
			}, function(data) {
				get_tweets(panel_id,'regular',1);
			},
			'json');
			
	} else {
		
		js_send_tweet(panel_id,tweet,reply_to_id,panel_reply_names[panel_id],dm);
		
	}
	
	
}

function refresh_tweets() {
	
	$('#panels').find('.panel_id').each(
		function(i) {
			
			
			get_tweets(this.value,'regular',1);
			
		}
		);
	
}

function show_login_form() {
	
	$('#login_form').toggle("slide", { direction: "up" }, 400,
	function() {
		
		$('#login_form:visible').find('#tw_user').focus();
		
		
	}
	);
}

function add_search_panel() {
	
	var search_prompt = "Enter a search term:";
	
	if (navigator.geolocation) {
		
		search_prompt += ' (use "location 5mi" syntax for location based search)';
		
	}
	
	var search_term = prompt(search_prompt);
	
	if ((search_term == "") || (search_term == null)) {
		
		return;
		
	}
	
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
	
	var make_new_panel = new Twitter_Panel(tw_panels.length,search_term,"_search",true,null);
	
	
	
	return false;
	
}

function remove_panel(panel_id) {
	
	$('#panel_' + panel_id).remove();
	$('#show_panel_' + panel_id).remove();
	
	if (!XS) {
		$.post(URL_BASE + 'bin/ajax.php', {
			func: "remove_panel",
			panel: panel_id,
		}, function(data) {
		
		},
		'json');
	} else {
		
		if (AIR) {
			
			for (i = 0; i < tw_panels.length; i++) {
				
				if (tw_panels[i].id == panel_id) {
					
					tw_panels.splice(i,1);
					save_panels();
					
				}
				
			}
			
		}
		
	}
	
	//show the last available panel?
	
	show_panel($('.twitter_panel:last').find('.panel_id').val());
	
}

function make_new_panel() {
	
	var u = $('#tw_user').val();
	var p = $('#tw_pass').val();
	
	$('#login_form').hide("slide", { direction: "up" }, 600);
	
	$('#tw_user').val('');
	$('#tw_pass').val('');
	
	var new_id = tw_panels.length;
	
	var make_new_panel = new Twitter_Panel(new_id,u,p,true,null);
	
	if (bad_login == true) {
	
		alert ("Bad login info");
	
	} else {
			
		//tw_panels[tw_panels.length] = make_new_panel;		
		
	}
		
}

function show_panel(panel_id) {
	
	front_panel = panel_id;
	
	$('.twitter_panel').hide();
	
	if (!MOBILE) {
		$('#panel_' + panel_id).show();
	} else {
		$('#panel_' + panel_id).show();
		
		
	}
	$('.nav_button').css('background','#eee');
	$('.nav_button').css('border','1px solid #aaa');
	
	$('#show_panel_' + panel_id).css('background','white');
	$('#show_panel_' + panel_id).css('border-bottom','1px solid white');
	
	if (panel_tweet_types[panel_id] == undefined) { panel_tweet_types[panel_id] = 'regular'; }
	
	$('.tweet_type_button').css("background","#eee");
	$('.tweet_type_button').css("border","1px solid #aaa");
	
	$('#panel_' + panel_id + "_" + panel_tweet_types[panel_id]).css("background","white");
	$('#panel_' + panel_id + "_" + panel_tweet_types[panel_id]).css("border-bottom","1px solid white");
	
	
	$('#panel_' + panel_id).find('.tweet_input').keyup(function() {
		
		//alert("keyup");
		length_notify(panel_id);
		
	});
	
	var bg_url = $('#panel_' + panel_id).find('.panel_background').val();
	
	if (!MOBILE) {
		$('body').css('background',"url('" + bg_url + "') no-repeat fixed");
	
		$('body').css('background-color',"#" + $('#panel_' + panel_id).find('.panel_background_color').val());
	}
}

function add_new_nav_button(panel_id) {
	
	var panel_name = get_panel_user_name(panel_id);
	
	var close_button_code = '<img src="' + URL_BASE + 'images/Cancel.png" id="remove_panel_' + panel_id + '"  class="close_panel" onclick="remove_panel(' + panel_id + ')" alt="Close Panel" title="Close this panel" />';
	
	$('#nav_buttons').append('<div class="nav_button" id="show_panel_' + panel_id + '" onclick="show_panel(' + panel_id + ')">' + panel_name + close_button_code + '</div>');
	
	//add click listeners
	if (BIND_CLICKS) {
		$('#show_panel_' + panel_id).click(
			function() {
			
				show_panel('' + panel_id);
			
			}
			);
		
		$('#remove_panel_' + panel_id).click(
				function() {

					remove_panel('' + panel_id);

				}
				);
	}
	
	$('#nav_buttons').sortable(
		{
			update: function() {
				save_user_pref('panel_order',$('#nav_buttons').sortable('serialize'));
			},
		} 
		);
	
	
}

function save_user_pref(pref_name_var,pref_value_var) {
	
	$.post("bin/ajax.php",{
				func: 'save_pref',
				pref_name: pref_name_var,
				pref_value: pref_value_var,
			}, function (data) {
				//alert("saved value");
			},'html');
			
			
}

function get_panel_user_name(panel_id) {
	
	var n =  $('#panel_' + panel_id).find('.panel_user_name').val();
	
	if (n == "location") {
		
		return "within " + LOCATION_SEARCH_DISTANCE;
		
	}
	
	if ($('#panel_' + panel_id).find('.panel_type').val() == "search_panel") {
		
		return "Search: " + n;
	}
	
	return n;
	
}



function show_loader() {
	
	$('#loader').show();
	
}

function hide_loader() {
	
	$('#loader').hide();
	
}

function auto_update_tweets() {
	
		if (AIR) {
			
			setTimeout(function() { auto_update_tweets() },UPDATE_FREQ);
			
		} else {
	
			setTimeout("auto_update_tweets()",UPDATE_FREQ);

		}
		
		get_tweets(front_panel,panel_tweet_types[front_panel],1);
	
}

function logout() {
	
	if (AIR) {
		
		destroy_db();
		
	}
	
	$.post(URL_BASE + 'bin/ajax.php', {
		func: "logout",
	}, function(data) {
		var href = window.location.href;
		window.location.href = href;
	},"html");
	
}

function length_notify(panel_id) {
	
	var input_box = $('#panel_' + panel_id).find('.tweet_input');
	
	
	var chars_typed = input_box.val().length;
	
	
	if (chars_typed >= 140) {
		
		input_box.val(input_box.val().substring(0,140));
		chars_typed = max_length;
		
	}
	
	$('#panel_' + panel_id).find('.length_notify_box').html((140 - chars_typed) + " characters left");

	
}


/************************ PARSE FUNCTIONS **********************************/

function parse_last_update(panel_id,data) {
	
	$('#panel_' + panel_id).find('.last_update').html(data[0].text);
	
}

function parse_get_tweets_data(panel_id,type,page_num,data) {
	
		var tweets = $('#panel_' + panel_id).find('.tweets');
		
		
		if (panel_data[panel_id] == data) {
			
			//there's nothing new
			return;
			
		}
		
		//$('#panel_' + panel_id).append(data);
				
		//$('#panel_' + panel_id).find('.tweets').html("Displaying "+ type + " tweets<br/>");
		//tweets.html("");
		
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
		
		for (i = 0; i < num_tweets; i++) {
			
			var tweet = null;
			
			if (!is_search) {
				tweet = data[i];
			} else {
				tweet = data.results[i];
			}
			
			var tweet_div = '<div class="tweet" id="panel_' + panel_id + 'tweet_' + tweet.id + '">';
			
			var already_displayed = false;
		
			for (j = 0; j < panel_data[panel_id].length; j++) {
			
				if (panel_data[panel_id][j].text == tweet.text) {  //wouldn't need if I used since in API call
				
					//$('#canvas').append("already here");
				
					already_displayed = true;
				
				}
			
			}
			
			if (already_displayed) {
				continue;
			}
			
			if (tweet.id > latest_tweet_ids[panel_id]) {
				
				latest_tweet_ids[panel_id] = tweet.id;
				
			}
			
			panel_data[panel_id].push(tweet);
			
			
			if (DESTROY_TWEETS) {
				
				if (panel_data[panel_id].length > TWEET_DISPLAY_LIMIT) {
					
					var old_tweet = panel_data[panel_id].shift();
					
					//remove the old tweet from the html as well
					
					$('#panel_' + panel_id + 'tweet_' + old_tweet.id).hide();
					
					$('#panel_' + panel_id + 'tweet_' + old_tweet.id).remove();
					
				}
				
			}
			
			
			
			var tweet_div = '<div class="tweet" id="panel_' + panel_id + 'tweet_' + tweet.id + '">';
		
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
		
			tweet_div += '<a class="user_name" href="http://twitter.com/' + from_sn + '">' + from_sn + "</a>: ";
		
		
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
			
			tweet_div += '<div id="reply_' + tweet.id + '" class="reply_icon" ';
		
				tweet_div +=  'onclick="reply_to_tweet(' + panel_id +',' + tweet.id + ",'" + from_sn + "')\">";
				tweet_div += 'Reply</div>';
		
			tweet_div += '</div>';
		
			tweet_div += '<br class="clear_both"/></div>';
			
			if (page_num == 1) {
				tweets.prepend(tweet_div);
			} else {
				tweets.append(tweet_div);
			}
			
			//bind the reply button
			if (BIND_CLICKS) {
				$('#reply_' + tweet.id).click(function() { reply_to_tweet(panel_id,tweet.id,from_sn) } );
			}
			
			$('#panel_' + panel_id + 'tweet_' + tweet.id).show();
			
			
		}
		
		$('.tweet_type_button').css("background","#eee");
		$('.tweet_type_button').css("border","1px solid #aaa");
		
		
		$('#panel_' + panel_id + '_' + type).css("background","white");
		$('#panel_' + panel_id + '_' + type).css("border-bottom","1px solid white");
		
		if (AIR) {
			
			//assign the links

			
			$('#panel_' + panel_id + ' a').click(function() {
				
				var href = this.href;
				air.navigateToURL(new air.URLRequest(href));
				return false;
				
			});
			
		}
		
		hide_loader();
	
	
}



/******************************************** JS Substitute for AJAX.php *********************************/


function js_get_tweets(panel_id, tweet_type, page, since, location, location_search_dist) {

	//need search code

	since_req = "&since_id=" + since;
	
	if (since == '-1') {
		
		since_req = '';
		
	}
	
	if (page != 1) {
		
		since_req = '';
		
	}
	
	var auth = make_base_auth(tw_panels[panel_id].user,tw_panels[panel_id].pass);
	
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
		
		
	}
	
	
}

function js_get_last_update(panel_id) {
	
	var auth = make_base_auth(tw_panels[panel_id].user,tw_panels[panel_id].pass);
	
	
	$.ajax( {
		url: 'http://twitter.com/statuses/user_timeline.json',
		beforeSend: function(req) {
		        req.setRequestHeader('Authorization', auth);
		    }
		,
		dataType: 'json',
		cache: false,
		data: 'count=1',
		success: function(data) {
			parse_last_update(panel_id,data);
		}
	
	});
	
}

function js_send_tweet(panel_id,tweet,reply_to_id,reply_to_name,direct_message) {
		
	var auth = make_base_auth(tw_panels[panel_id].user,tw_panels[panel_id].pass);
	
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
			}
	
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
	
	return true;
	
}

function js_get_panel(panel_id, t_user, t_pass, gen_info, load_panel) {
	
	if (t_pass == "_search") {
		
		return js_get_search_panel(panel_id,t_user,t_pass);
		
	}
	
	if (load_panel) {
		if (!js_check_login(t_user,t_pass)) {
		
			alert("I'm sorry - that looks like a bad user/pass combination.  Please try again?");
			tw_panels.pop();
			return;
		
		}
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
	
	panel_html += '<div class="twitter_panel" id="panel_' + panel_id + '">';
	panel_html += '<input type="hidden" class="panel_id" value="' + panel_id + '"/><input type="hidden" class="panel_user_name" value="' + t_user + '"/>';
	panel_html += '<input type="hidden" class="panel_background" value="' + bg_img + '" /><input type="hidden" class="panel_background_color" value="' + bg_col + '" />';
	panel_html += '<input type="hidden" class="panel_type" value="regular_panel"/>';	

	panel_html += '<div class="twitter_inputs"><span class="dm_notify_box"></span><textarea class="tweet_input" name="tweet_input" rows="3" cols="30"></textarea><input type="button" class="tweet_submit" onclick="send_tweet(' + panel_id + ')" value="Update"/><span class="length_notify_box" id="chars_left_panel_' + panel_id + '"></span><br class="clear_both"/></div>';
	panel_html += '<div class="last_update"></div>';
	panel_html += '<div class="tweet_type_menu"><div class="tweet_type_button" id="panel_' + panel_id + '_regular" onclick="get_tweets(' + panel_id + ',\'regular\',1)">Timeline</div><div class="tweet_type_button" id="panel_' + panel_id + '_replies" onclick="get_tweets(' + panel_id + ',\'replies\',1)">Replies</div><div class="tweet_type_button" id="panel_' + panel_id + '_direct" onclick="get_tweets(' + panel_id + ',\'direct\',1)">Direct messages</div><br class="clear_both" /></div>';

	panel_html += '<div class="tweets"></div>';
	panel_html += '<div class="more_tweets" onclick="get_more_tweets(' + panel_id + '); return false;">Load more tweets...</div>';

	panel_html += '</div>';
	
	
	panel_html += '';
		
	set_up_panel(panel_id,panel_html, t_user, t_pass);
	
}

function js_get_search_panel(panel_id,t_user,t_pass) {
	
	var panel_html = "";
	
	
	panel_html += '<div class="twitter_panel" id="panel_' + panel_id + '">';
	panel_html += '<input type="hidden" class="panel_id" value="' + panel_id + '"/><input type="hidden" class="panel_user_name" value="' + t_user + '"/><input type="hidden" class="panel_type" value="search_panel"/><input type="hidden" class="panel_background" value="" /><input type="hidden" class="panel_background_color" value="fff" />';
	panel_html += '<div class="twitter_inputs"></div>';
	panel_html += '<div class="tweet_type_menu"></div><div class="tweets"></div>';
	panel_html += '<div class="more_tweets" onclick="get_more_tweets(' + panel_id + '); return false;">Load more tweets...</div>';
	panel_html += '</div>';
	panel_html += '';
	
	set_up_panel(panel_d,panel_html, t_user, t_pass);
	
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


/********************************** AIR **********************************************************/



if (AIR) {

/* 
conn = new air.SQLConnection();

var dbFile = air.File.applicationStorageDirectory.resolvePath("DBSample.db");
conn.open(dbFile);

createStmt = new air.SQLStatement();

createStmt.sqlConnection = conn;


init_db();

function init_db() {
	var sql = "";
	sql += "CREATE TABLE IF NOT EXISTS mt_data ( ";
	sql += "`key` VARCHAR( 24 ) NOT NULL ,";
	sql += "`data` TEXT NOT NULL ,";
	sql += "PRIMARY KEY ( `key` )";
	sql += "); INSERT OR IGNORE INTO mt_data (key,data) VALUES ('panel_data','')";
	createStmt.text = sql;
	createStmt.execute();
}

*/

function save_panels() {
	
	var panels_ser = JSON.stringify(tw_panels);
	
	//alert(panels_ser);
	
	/*
	insertStmt = new air.SQLStatement();
	insertStmt.sqlConnection = conn;
	var sql = "";
	sql += "UPDATE mt_data SET ";
	sql += "data='" + panels_ser + "' WHERE key = 'panel_data'";
	insertStmt.text = sql;
	
	try
	{
	    insertStmt.execute();
	}
	catch (error)
	{

	    air.trace("INSERT error:", error);
	    air.trace("error.message:", error.message);
	    air.trace("error.details:", error.details);

	    return;
	}
	*/
	
	var bytes = new air.ByteArray(); 
	bytes.writeUTFBytes(panels_ser); 
	air.EncryptedLocalStore.setItem("panel_data", bytes);
	
	
}

function get_panels() {
		
	var storedValue = air.EncryptedLocalStore.getItem("panel_data"); 
	
	if (storedValue == null) {
		
		return;
		
	}
	
	var s = storedValue.readUTFBytes(storedValue.length);
	
	//air.trace(s); // "foo"
	
	var saved_panels = eval('(' + s + ')');
	
	for(i = 0; i < saved_panels.length; i++) {
				
		var pan = saved_panels[i];
		
		//alert (JSON.stringify(pan));
		
		new_panel = new Twitter_Panel(pan.panel_id,'' + pan.user, '' + pan.pass,false,pan.gen_info);
		
				
	}
	
	/*
	
	selectStmt = new air.SQLStatement();
	selectStmt.sqlConnection = conn;
	var sql = "SELECT data FROM mt_data WHERE key = 'panel_data'";
	selectStmt.text = sql;

	try
	{
	    selectStmt.execute();
	}
	catch (error)
	{

	    air.trace("SELECT error:", error);
	    air.trace("error.message:", error.message);
	    air.trace("error.details:", error.details);

	    return;
	}
	
	
	var result = selectStmt.getResult();
	
	var row = result.data[0];
	
	alert(row.data);
	*/
	
}



function destroy_db() {
	
	if (AIR) {
		
		var bytes = new air.ByteArray(); 
		air.EncryptedLocalStore.setItem("panel_data", bytes);
		
	}
	
}













}

/********************************** HTTP AUTH stuff **************************************************/

function make_base_auth(user, password) {
  var tok = user + ':' + password;
  var hash = Base64.encode(tok);
  return "Basic " + hash;
}

var Base64 = {

    // private property
    _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    // public method for encoding
    encode : function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        input = Base64._utf8_encode(input);

        while (i < input.length) {

            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output +
            this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
            this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

        }

        return output;
    },

    // public method for decoding
    decode : function (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {

            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }

        }

        output = Base64._utf8_decode(output);

        return output;

    },

    // private method for UTF-8 encoding
    _utf8_encode : function (string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    },

    // private method for UTF-8 decoding
    _utf8_decode : function (utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;

        while ( i < utftext.length ) {

            c = utftext.charCodeAt(i);

            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i+1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i+1);
                c3 = utftext.charCodeAt(i+2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }

        }

        return string;
    }

}



