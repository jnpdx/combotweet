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

