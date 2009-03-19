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

function fb_login() {
  toggle_login_form();
  FACEBOOK_API.requireLogin(function(exception){ 
	    window.fb_uid = FACEBOOK_API.get_session().uid;
	    make_new_facebook_panel();
	  });
	  
  
}

function fb_get_statuses(panel_id) {
  
  //alert("made it");
  
    
  //alert("made it2");
  	
  FACEBOOK_API.requireLogin(function(exception){ 
		//console.log("Exception: " + exception)

		FACEBOOK_API.fql_query ("select uid,name,pic_small, status FROM user WHERE (uid in (select uid2 from friend where uid1 = " + fb_uid + ")) order by status.time DESC LIMIT 20", function(data) {
			to_add = '';
	
			console.log(data)
	
			for (i in data) {
				//to_ret += '<img src="' + data[i].pic_small + '"/>' + data[i].name + ": " + data[i].status.message + "<br/>";
				var cur_status = data[i];
				
				if ($('#status_' + cur_status.status.time).length != 0) {
				  continue;
				}
				
				if (cur_status.status.message == '') {
				  continue;
				}
				
				//alert(cur_status);
				
			  to_add += '<div class="tweet fb_status" id="status_' + cur_status.status.time + '">';

    		to_add += '<div class="avatar_container"><img class="avatar" src="' + cur_status.pic_small + '" alt="Avatar"/></div>';

    		to_add += '<div class="the_tweet">';
    		
    		to_add += cur_status.name + ": " + cur_status.status.message;
    		
    		to_add += '</div>';
    		
    		to_add += '<br class="clear_both"/>'
    		
    		to_add += '</div>';
			}
	
			$('#panel_' + panel_id).find('.tweets').append( to_add );
	
	    $('#panel_' + panel_id).find('.tweet').show();
	
		})

  });
	
  
  
}

function init_facebook() {

    FB_RequireFeatures(["Api","XFBML"], function(){ 
    		FB.Facebook.init(FACEBOOK_API_KEY, FB_channel_path); 
		
		
    		window.FACEBOOK_API = FB.Facebook.apiClient; 

		  /*
    		
		    */
		
    	});
    	
}