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
  
  entered_open_id = $('#openid_identifier').val();
  
  if ((user_openid == '') && (entered_open_id == '')) {
    
    alert("You must enter an OpenID!");
    return false;
    
  }
  
  if (user_openid != entered_open_id) {
    //we'll have to verify the id
    $("#save_state").submit();
    return false;
    
  }
  
  if (PROXY) {
    proxy_load_state(user_openid);
    
  }
  
  
}

function show_save_state_form() {
  
  $('#save_state_form').css('left',$(window).width() - 400);
	
	$('#save_state_form').toggle("slide", { direction: "up" });
  
}

function save_state_submit() {
  
  save_to_openid();
  
  hide_open_windows();
  
  return false;
}