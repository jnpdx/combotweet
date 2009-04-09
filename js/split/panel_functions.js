
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
	
	var nav_button_code = '<div class="nav_button show_panel_' + panel_id + '" onclick="show_panel(\'' + panel_id + '\')">' + '<span class="panel_name">' + panel_name + '</span>' + close_button_code + '</div>';
	
	$('#header_nav_buttons').append(nav_button_code);
	
	
	$('#panel_' + panel_id).prepend(nav_button_code);
	
	
	if (!AIR) {
	  $('#panels').sortable('destroy')
		$('#panels').sortable(
			{
				handle: '.nav_button',
				start: function(ev,ui) {
				  $('.tweet').hide();
				},
				stop: function(ev,ui) {
				  $('.tweet').show();
				},
				update: function() {
					update_panel_order();
				},
			} 
			);
	}
	
}

function update_panel_order() {
  var displayed_order = $('#panels').sortable('toArray');
  var new_panel_array = new Array();
  for (i in displayed_order) {
    var cur_panel = get_panel_by_id(displayed_order[i].substring(6))
    new_panel_array.push(cur_panel)
  }
  tw_panels = new_panel_array;
  auto_save();
}

//Create a new panel
function make_new_panel() {
		
	var u = $('#tw_user').val();
	var p = $('#tw_pass').val();
	
	toggle_login_form();	
	
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
	
	
	var new_panel = new Data_Panel(new_id,'regular',u,p,panel_info);
	
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
	
	auto_save();
	
}


//Remove a panel
function remove_panel(panel_id) {
	
	var pan = get_panel_by_id(panel_id)
	
	if (pan.parent_panel != null) {
	  var parent_pan = get_panel_by_id(pan.parent_panel)
	  
	  if (parent_pan != null) {
	  
  	  for (i in parent_pan.derivative_panels) {
  	    if (parent_pan.derivative_panels[i] == panel_id) {
	      
  	      parent_pan.derivative_panels.splice(i,1)
	      
  	    }
  	  }
	  
	    save_panel(parent_pan.panel_id,parent_pan)
  	  
	  }
	  
	}
	
	$('#panel_' + panel_id).remove();
	
	if (!TABBED_PANELS) {
		$('#panels').width($('#panels').width() - (PANEL_WIDTH - 20))
	} else {
		$('.show_panel_' + panel_id).remove();
	}
	
	$('#show_panel_' + panel_id).remove();
	
	//remove from tw_panels
	
	for (var i = 0; i < tw_panels.length; i++) {
		
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
	
	//var panel_id = "Search " + search_term;
	
	//panel_id = panel_id.replace(/ /g,'_');
	var d = new Date();
	
	var panel_id = "Search_" + d.getTime();
	
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
	
	
	auto_save();
	
	return false;
	
}


//Displays a panel, gets the tweets, and adds a nav button
//Called when a panel is being made
function set_up_panel(id, data, t_user, t_pass) {
	
	$('.startup_box').hide();
	
	$('#panels').append(data);

	if (!TABBED_PANELS) {
		$('#panels').width($('#panels').width() + (PANEL_WIDTH + 20))
	}

	add_new_nav_button(id);
	show_panel(id);	
	js_get_friends_followers(id);
	
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

	if (!TABBED_PANELS) {
    var tweet_input = $('#panel_' + panel_id).find('.nav_button');
  	tweet_input.focus();
	
  	$.scrollTo( tweet_input, 20, {
	
  		offset: { left: -20, top: -130 },
  		axis: 'xy',
	
  	} );
	}
	
	
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
	

	
	if (panel_id.indexOf("Facebook_") != -1) {
	  
	  return "Facebook";
	  
	}
	
	if (panel_id.indexOf("Search_") != -1) {
	  
	  return "Search: " + get_panel_by_id(panel_id).user
	  
	}
	
	if (panel_id.indexOf("Shizzow") != -1) {
	  
	  return "Shizzow: " + get_panel_by_id(panel_id).user
	  
	}
	
	return "Twitter: " + get_panel_by_id(panel_id).user;
	

	
}

function make_droppables() {
  $('.twitter_panel').droppable( 'destroy' );
  for (i in tw_panels) {
    if (tw_panels[i].panel_type == 'filtered_panel') {
      panel_id = tw_panels[i].panel_id
    } else {
      continue
    }
    //console.log("Making " + panel_id + " droppable")
    $('#panel_' + panel_id ).droppable({
	  
  	   accept: ".avatar",
  	   drop: function(ev, ui) {


           //console.log(ev)
           var theId = ev.target.id.substring(7);
           
           //alert(JSON.stringify(ev.target))
           
           var drop_panel_id = this.id.substring(6);
           
           //alert(drop_panel_id)

           //console.log(theId + ' on panel ' + drop_panel_id);

           pan = get_panel_by_id(drop_panel_id)
         
           if (pan.filter_rules['users'] == undefined) {
             pan.filter_rules['users'] = new Object();
           }
         
           pan.filter_rules.users[theId.toLowerCase()] = true

          save_panel(pan.panel_id,pan)
         
          reload_filter_panel(panel_id)
      }
	  
  	  });
	}
}

function make_new_filtered_panel(panel_name,from_panel) {
  
  var from_panel = get_panel_by_id(from_panel);
  
  if (from_panel == null) {
    alert("Couldn't find panel");
    return;
  }
  
  var d = new Date();
	
	panel_id = "Filtered_" + d.getTime();
	
	panel_data = js_get_filtered_panel(panel_id)
	
	
	var new_panel = new Data_Panel(panel_id,'filtered_panel',panel_name + " > from panel " + from_panel.user,'_filtered',null);
	
	new_panel.parent_panel = from_panel.panel_id;
	
	//temp
	new_panel.filter_rules = new Object();
	new_panel.filter_rules['users'] = new Object();
	//new_panel.filter_rules.users['ahockley'] = true;
	//new_panel.filter_rules.users['test_dummy'] = true;
	
	tw_panels.push(new_panel);
	
	from_panel.derivative_panels.push(panel_id);
	
	set_up_panel(panel_id, panel_data, '',"_filtered");
	
	parse_filtered_tweets(from_panel.panel_id,2,from_panel.panel_data);
	
	make_droppables();
	
	return false;
	
}

function reload_filter_panel(panel_id) {
  
  var pan = get_panel_by_id(panel_id)
  
  pan.panel_data = new Array();
  
  save_panel(panel_id,pan)
  
  var from_panel = get_panel_by_id(pan.parent_panel)
  
  $('#panel_' + panel_id).find('.tweets').html('');
  
  parse_filtered_tweets(from_panel.panel_id,2,from_panel.panel_data);
  
  auto_save();
  
}