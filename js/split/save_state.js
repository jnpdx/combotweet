//Functions for saving the state to OpenID

function save_to_openid() {
  
  
  if (user_openid == '') {
    //ask the user for an openid, and check them in
    alert("You haven't entered an OpenID to save to!");
    return false;
  }
  
  //send a save request to the server
  if (PROXY) {
    proxy_save_state(user_openid);
  }
  
  
}

function load_state() {
  
  if (user_openid == '') {
    
    user_openid = prompt("OpenID?");
    
  }
  
  if (PROXY) {
    proxy_load_state(user_openid);
    
  }
  
  
}

function show_save_state_form() {
  
  $('#openid_identifier').val(user_openid);
  
  $('#save_state_form').css('left',$(window).width() - 400);
	
	$('#save_state_form').toggle("slide", { direction: "up" });
  
}

function save_state_submit() {
  entered_open_id = $('#openid_identifier').val();
  
  if (entered_open_id != user_openid) {
    //they've entered a new value - let's check it
    $("#save_state").submit(); 
    return true;
    
  }
  
  save_to_openid();
  
  
  return false;
}