/******************************** CT PLUGINS CODE ********************************/

//Plugins are not yet functioning

function register_plugin(hook,callback_fn) {
	
	var plug = new CT_Plugin(hook,callback_fn);
	plugin_hooks.push(plug);
	
}

function get_plugins(hook) {
	
	
	
}

function run_plugins(hook,args) {
	
	for(i = 0; i < plugin_hooks.length; i++) {
		
		if (plugin_hooks[i].hook == hook) {
			eval(plugin_hooks.callback_fn);
		}
		
	}
	
}