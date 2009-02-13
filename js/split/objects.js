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