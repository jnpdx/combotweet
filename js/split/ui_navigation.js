

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


//Displays or hides the user/pass form
//Should be "toggle_login_form" for consistency
function show_login_form() {
  $('#openid_identifier').val(user_openid);
  
  $('#old_login_form').hide();
  
  if ($('#login_form:visible').length == 0) {
	  show_overlay();
	} else {
	  hide_overlay();
	}
  
	$('#login_form').css('left',$(window).width() - 420)
	
	$('#login_form').toggle("slide", { direction: "up" }, 400,
	function() {
		
		$('#login_form:visible').find('#tw_user').focus();
		
		
	}
	);
}

function toggle_login_form() {
  
  show_login_form();
  hide_overlay();
  
}

function toggle_search_form() {
  show_overlay();
  $('#search_form').css('left',$(window).width() - 420)
	
  $('#search_form').toggle("slide", { direction: "up" }, 400,
	function() {
		
		if ($('#search_form:visible').length > 0) {
		  $('#search_term').focus();
		} else {
		  hide_overlay();
		}
		
	}
	);
}

function show_settings_form() {
	
	$('#settings_form').css('left',$(window).width() - 600)
	
	if ($('#settings_form:visible').length == 0) {
	  show_overlay();
	} else {
	  hide_overlay();
	}
	
	$('#settings_form').toggle("slide", { direction: "up" }, 400,
	function() {
		$('#tabbed_panels').attr('checked', TABBED_PANELS );
		$('#add_hashtag').attr('checked', ADD_HASHTAG );
		
		$('#refresh_freq').val('' + (UPDATE_FREQ / 1000));
		$('#remove_old_tweets').attr('checked', DESTROY_TWEETS );
		$('#font_size').val('' + FONT_SIZE);
		$('#panel_width').val('' + PANEL_WIDTH);
		$('#css_file_setting').val(CSS_FILE);
		$('#auto_save_checkbox').attr('checked',AUTO_SAVE);
	}
	);
	
	
	
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