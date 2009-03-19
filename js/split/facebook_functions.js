//facebook integration

//alert('hi')

FACEBOOK_API_KEY = '71e3796c250559a26a8771161e3f12de'; 
FB_channel_path = 'fb/xd_receiver.htm';

function make_new_facebook_panel() {
	
	
	//u = u.substring(8);
	
	var d = new Date();
	
	var new_id = "Facebook_" + d.getTime();
	
	if (get_panel_by_id(new_id) != null) {
		
		alert("You already have a panel open like that!");
		return;
		
	}
	
	//if (PROXY) {
	//	var old_data = proxy_get_shizzow_panel(new_id,u,p);//register the panel
	//}
	
	var panel_info = '';
	
	var new_panel = new Data_Panel(new_id,'facebook_panel','__fb','__fb',panel_info);
	
	new_panel.tweet_type = "fb_status";
	
	tw_panels.push(new_panel);
		
	var panel_code = js_get_facebook_panel(new_id);
	
	set_up_panel(new_id,panel_code,'__fb','__fb');
	
}

function fb_get_statuses(panel_id) {
  
  alert("made it");
  
  FACEBOOK_API.requireLogin(function(exception){ 
    
    alert("made it2");
  	
		console.log("Exception: " + exception)
		window.uid = FACEBOOK_API.get_session().uid;

		FACEBOOK_API.fql_query ("select uid,name,pic_small, status FROM user WHERE (uid in (select uid2 from friend where uid1 = " + uid + ")) order by status.time DESC LIMIT 20", function(data) {
			to_ret = '';
	
			console.log(data)
	
			for (i in data) {
				to_ret += '<img src="' + data[i].pic_small + '"/>' + data[i].name + ": " + data[i].status.message + "<br/>";
			}
	
			$('#panel_' + panel_id).find('.tweets').append( to_ret );
	
		})


	} );
	
  
  
}

function init_facebook() {

    FB_RequireFeatures(["Api","XFBML"], function(){ 
    		FB.Facebook.init(FACEBOOK_API_KEY, FB_channel_path); 
		
		
    		window.FACEBOOK_API = FB.Facebook.apiClient; 

		  /*
    		
		    */
		
    	});
    	
}