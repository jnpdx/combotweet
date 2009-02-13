
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


//Remove a panel
function remove_panel(panel_id) {
	
	$('#panel_' + panel_id).remove();
	
	if (!TABBED_PANELS) {
		$('#panels').width($('#panels').width() - (PANEL_WIDTH - 20))
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
		$('#panels').width($('#panels').width() + (PANEL_WIDTH + 20))
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