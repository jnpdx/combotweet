/******************************** CT PLUGINS CODE ********************************/

//Plugins are not yet functioning

function register_plugin(hook,callback_fn) {
	
	var plug = new CT_Plugin(hook,callback_fn);
	plugin_hooks.push(plug);
	
}

function get_plugins(hook) {
	
	
	
}

function run_plugins(hook,args) {
	
	for(var i = 0; i < plugin_hooks.length; i++) {
		
		if (plugin_hooks[i].hook == hook) {
			eval(plugin_hooks.callback_fn);
		}
		
	}
	
}

//translate

function translate_tweet(tweet_id) {
  var the_tweet = $('#' + tweet_id + " .tweet_text")
  var text = the_tweet.html();
  
  console.log('translating ' + text)
  
  google.language.translate(text, "", "en", function(result) {
    console.log('got result')
    if (!result.error) {
      the_tweet.html(result.translation);
    }
  });
  
}