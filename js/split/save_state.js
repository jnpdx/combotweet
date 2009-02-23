//Functions for saving the state to OpenID

function save_to_openid() {
  
  
  if (user_openid = '') {
    //ask the user for an openid, and check them in
    
    
    
    
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