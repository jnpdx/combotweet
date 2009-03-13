/********************************* STARTUP **************************************/

//jQuery hook for anything that must be run at startup
$(document).ready(function() {

	if (!AIR) {
		
		doc_ready_functions();
	
	}
	
});

function hide_flash_message() {
  
  $('#flash_message').fadeOut('slow')
  
}

//Startup functions
//Loads the session panels, and starts the auto_update routines to refresh tweets
//Adding search panels seems buggy
function doc_ready_functions() {
		
	//$('#nav_buttons').sortable();

	get_settings_in_cookie();

	get_session_panels();
	
	if (user_openid != '') {
	  
	  $('#save_state_button').show();
	  $('#load_state_button').hide();
	  $('#openid_identifier').attr('disabled','true');
	  
	}
	
	setTimeout("hide_flash_message()",5000);
	
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