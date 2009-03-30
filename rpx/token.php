<?php
//Where the user comes back to from RPX

if (!isset($_SESSION)) {
	session_start();
	//echo 'starting session';	
}

require_once 'rpx_api_key.php';

$post_data = array('token' => $_GET['token'],
	           'apiKey' => RPX_API_KEY,
                   'format' => 'json'); 

// make the api call using libcurl
$curl = curl_init();
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_URL, 'https://rpxnow.com/api/v2/auth_info');
curl_setopt($curl, CURLOPT_POST, true);
curl_setopt($curl, CURLOPT_POSTFIELDS, $post_data);
curl_setopt($curl, CURLOPT_HEADER, false);
curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
$raw_json = curl_exec($curl);
curl_close($curl);

// parse the json response into an associative array
$auth_info = json_decode($raw_json, true);

// process the auth_info response
if ($auth_info['stat'] == 'ok') {
  
  $profile = $auth_info['profile'];
  $identifier = $profile['identifier'];

	login_user($identifier);
	
	$_SESSION['logged_in_user'] = true;

	$_SESSION['flash_message'] = "You are now logged in.  REMEMBER: Click the save icon to save your open panels.";

} else {
	
	//failed
	
	$_SESSION['flash_message'] = "There was an error logging you in.";
	
	
}


header("Location: ".$_SESSION['client_url']);

function login_user($openid) {
	
	require_once '../bin/db/db_functions.php';
	
	
	$_SESSION['user_openid'] = $openid;
	
	$data = retrieve_user_data($openid);
	
	if ($data != '') {
	
		$data = unserialize($data['state']);
		$_SESSION['panels'] = $data['panels'];
		
	}
	
}

?>