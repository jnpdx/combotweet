<?php

require_once "oauth_data.php";
require_once 'twitterOAuth.php';



if (!isset($_SESSION)) {
	session_start();
	//echo 'starting session';
}

if (!isset($_SESSION['oauth'])) {
	
	$_SESSION['oauth'] = array();
}

/* Clear PHP sessions */
if (isset($_REQUEST['clear'])) {/*{{{*/
  session_destroy();
  session_start();
}/*}}}*/

/* Set up placeholder */
$content = NULL;
if (isset($_SESSION['oauth']['oauth_state'])) {
	/* Set state if previous session */
	$state = $_SESSION['oauth']['oauth_state'];
	/* Checks if oauth_token is set from returning from twitter */
	$session_token = $_SESSION['oauth']['oauth_request_token'];
}
/* Checks if oauth_token is set from returning from twitter */
if (isset($_REQUEST['oauth_token'])) {
	$oauth_token = $_REQUEST['oauth_token'];
	/* Set section var */
	//$section = $_REQUEST['section'];
}

/* If oauth_token is missing get it */
if (isset($_REQUEST['oauth_token']) && isset($_SESSION['oauth']['oauth_state'])) {/*{{{*/
	if ($_SESSION['oauth']['oauth_state'] === 'start') {
  	$_SESSION['oauth']['oauth_state'] = $state = 'returned';
	}
}/*}}}*/




/* Create TwitterOAuth object with app key/secret */
$to = new TwitterOAuth($consumer_key, $consumer_secret);
/* Request tokens from twitter */
$tok = $to->getRequestToken();

if ($addr == "oauth_start_login") {
		
	$_SESSION['oauth']['oauth_request_token'] = $token = $tok['oauth_token'];
  $_SESSION['oauth']['oauth_request_token_secret'] = $tok['oauth_token_secret'];
  $_SESSION['oauth']['oauth_state'] = "start";
	
	//print_r($_SESSION['oauth']);
	
	header( 'Location: '.$to->getAuthorizeURL($token) );
	exit;
	
}

switch($state) {
	
	case 'returned':
	
		if ((!isset($_SESSION['oauth']['oauth_access_token'])) && (!isset($_SESSION['oauth']['oauth_access_token_secret']))) {
      /* Create TwitterOAuth object with app key/secret and token key/secret from default phase */
      $to = new TwitterOAuth($consumer_key, $consumer_secret, $_SESSION['oauth']['oauth_request_token'], $_SESSION['oauth']['oauth_request_token_secret']);
      /* Request access tokens from twitter */
      $tok = $to->getAccessToken();

      /* Save the access tokens. Normally these would be saved in a database for future use. */
      $_SESSION['oauth']['oauth_access_token'] = $tok['oauth_token'];
      $_SESSION['oauth']['oauth_access_token_secret'] = $tok['oauth_token_secret'];
    }
	
	
		echo "whoa - it got returned!";
		
		$to = new TwitterOAuth($consumer_key, $consumer_secret, $_SESSION['oauth']['oauth_access_token'], $_SESSION['oauth']['oauth_access_token_secret']);
    /* Run request on twitter API as user. */
    $content = json_decode($to->OAuthRequest('https://twitter.com/account/verify_credentials.json', array(), 'POST'));

		//echo $content;

		//register the panel in the normal way
		require_once dirname(__FILE__) . "/../bin/structs.php";
		require_once dirname(__FILE__) . "/../bin/twitter_tools.php";
		
		$panel_id = $content->name;
		$panel_user = $content->name;
		$panel_pass = '__USING_OAUTH';

		$new_panel = new Panel();
		$new_panel->user = $panel_user;
		$new_panel->pass = $panel_pass;
		$new_panel->id = $panel_id;
		$new_panel->gen_info = json_decode(get_twitter_user_info($panel_user));

		//need to check user credentials

		//$legit_user = check_twitter_user($panel_user,$panel_pass);


			$_SESSION['panels'][$panel_id] = $new_panel;
			
			var_dump($new_panel);

			//display_panel($new_panel);

		
		
		//echo $content;
	
	break;
}


?>