<?php

require_once 'display_functions.php';
require_once 'twitter_tools.php';
require 'shizzow_tools.php';
require_once 'structs.php';

require_once 'oauth/twitterOAuth.php';

if (!isset($_SESSION)) {
	session_start();
	//echo 'starting session';
}

if (!isset($_SESSION['panels']))	
	$_SESSION['panels'] = array();
	
if (!isset($_SESSION['user_prefs']))	
	$_SESSION['user_prefs'] = array();

$func = $_REQUEST['func'];



if ($func == 'get_panel') {
	
	$panel_id = $_REQUEST['panel_id'];
	$panel_user = $_REQUEST['user'];
	$panel_pass = $_REQUEST['pass'];
	
	$new_panel = new Panel();
	$new_panel->user = $panel_user;
	$new_panel->pass = $panel_pass;
	$new_panel->id = $panel_id;
	$new_panel->gen_info = json_decode(get_twitter_user_info($panel_user));
	
	//need to check user credentials
	
	$legit_user = check_twitter_user($panel_user,$panel_pass);
	
	if ($legit_user) {
		
		$_SESSION['panels'][$panel_id] = $new_panel;
			
		display_panel($new_panel);
	} else {
		
		echo "ERROR=Bad Login";
		
	}

} elseif ($func == 'get_shizzow_panel') {

	$panel_id = $_REQUEST['panel_id'];
	$panel_user = $_REQUEST['user'];
	$panel_pass = $_REQUEST['pass'];
	
	$new_panel = new Panel();
	$new_panel->user = $panel_user;
	$new_panel->pass = $panel_pass;
	$new_panel->id = $panel_id;
	$new_panel->panel_type = 'shizzow_panel';
	
	$_SESSION['panels'][$panel_id] = $new_panel;
	
	
	echo "REG_SHIZZOW_PANEL";

} elseif ($func == 'check_login') {
	
	header("Content-type: text/javascript");
	
	echo check_twitter_user($_REQUEST['user'],$_REQUEST['pass']);

} elseif ($func == 'get_twitter_user_info') {
	
	$user = $_REQUEST['user'];
	
	header("Content-type: text/javascript");
	
	
	echo get_twitter_user_info($user);
	

} elseif ($func == 'get_search_panel') {

	$panel_id = $_REQUEST['panel_id'];
	$panel_user = $_REQUEST['search_term'];
	$panel_pass = '_search';
	
	$new_panel = new Panel();
	$new_panel->user = $panel_user;
	$new_panel->pass = $panel_pass;
	$new_panel->id = $panel_id;
	$new_panel->panel_type = 'search';
	
	$_SESSION['panels'][$panel_id] = $new_panel;
	
	display_search_panel($new_panel);
	
} elseif ($func == 'get_tweets') {
	$panel_id = $_REQUEST['panel'];
	$page = $_REQUEST['page'];
	$location = $_REQUEST['location'];
	$location_dist = $_REQUEST['location_search_dist'];
	
	$since = $_REQUEST['since'];
	
	$tweet_type = $_REQUEST['tweet_type'];
	
	$tw_user = $_SESSION['panels'][$panel_id]->user;
	$tw_pass = $_SESSION['panels'][$panel_id]->pass;
	$panel_type = $_SESSION['panels'][$panel_id]->panel_type;
	
	header("Content-type: text/javascript");
	
	if ($panel_type == "search") {
		$tweets = get_search_tweets($tw_user,$location,$location_dist,$page,$since);
	} elseif ($panel_type == 'regular') {
		
		//if ($tweet_type != 'replies') {
			$tweets = get_tweets($tw_user,$tw_pass,$tweet_type,$page,$since);
		//} else {
			
			//$tweets = get_search_tweets($tw_user,$location,$location_dist,$page,$since);
			
		//}
		
	} elseif ($panel_type == 'shizzow_panel') {
		
		$tweets = get_shizzow_shouts($tw_user,$tw_pass);
		
	}

	
	echo $tweets;

} elseif($func == 'send_tweet') {

	$panel_id = $_REQUEST['panel'];
	
	$tw_user = $_SESSION['panels'][$panel_id]->user;
	$tw_pass = $_SESSION['panels'][$panel_id]->pass;
	
	$reply_to = $_REQUEST['reply_to'];
	$reply_to_name = $_REQUEST['reply_to_name'];
	
	$dm = $_REQUEST['direct_message'];
	
	$tweet = stripslashes($_REQUEST['tweet_data']);
	
	header("Content-type: text/javascript");
	
	if ($dm == "false") {
		$rsp = send_tweet($tw_user,$tw_pass,$tweet,$reply_to);
	
		echo $rsp;	
	} else {
		//send a direct message
		$rsp = send_dm($tw_user,$tw_pass,$tweet,$reply_to_name);
		echo $rsp;
	}
	
		
} elseif($func == 'get_last_update') {
	
	$panel_id = $_REQUEST['panel'];
	
	$tw_user = $_SESSION['panels'][$panel_id]->user;
	$tw_pass = $_SESSION['panels'][$panel_id]->pass;
	
	header("Content-type: text/javascript");
	
	echo get_last_update($tw_user,$tw_pass);

} elseif($func == 'get_user_tweets') {

	$user = $_REQUEST['user'];
	header("Content-type: text/javascript");
	echo get_user_tweets($user);

} elseif($func == 'toggle_favorite') {
	
	$panel_id = $_REQUEST['panel'];
	
	$tw_user = $_SESSION['panels'][$panel_id]->user;
	$tw_pass = $_SESSION['panels'][$panel_id]->pass;
	
	$fav_id = $_REQUEST['tweet_id'];
	$fav = $_REQUEST['favorite'];
	
	header("Content-type: text/javascript");
	
	echo toggle_favorite($tw_user,$tw_pass,$fav_id,$fav);
	
} elseif ($func == 'follow_user') {
	
	$panel_id = $_REQUEST['panel'];
	
	$tw_user = $_SESSION['panels'][$panel_id]->user;
	$tw_pass = $_SESSION['panels'][$panel_id]->pass;
	
	$to_follow = $_REQUEST['user'];

	header("Content-type: text/javascript");
	
	echo follow_user($tw_user,$tw_pass,$to_follow);

} elseif ($func == 'unfollow_user') {

		$panel_id = $_REQUEST['panel'];

		$tw_user = $_SESSION['panels'][$panel_id]->user;
		$tw_pass = $_SESSION['panels'][$panel_id]->pass;

		$to_follow = $_REQUEST['user'];

		header("Content-type: text/javascript");

		echo unfollow_user($tw_user,$tw_pass,$to_follow);

} elseif($func == 'get_session_panels') {
	
	if (!isset($_SESSION['user_info']['panel_order']))
		$_SESSION['user_info']['panel_order'] = "";
	
	$panel_order = $_SESSION['user_info']['panel_order'];
	
	$panels = array();
	
	if ($panel_order != "") {
		
		
	}
	
	header("Content-type: text/javascript");
	
	$json_panels = array();
	
	foreach($_SESSION['panels'] as $key => $p) {
		
		/*
		if ($p->panel_type == 'search') {
			
			display_search_panel($p);
			
		} elseif ($p->panel_type == 'regular') {
			
			display_panel($p);
			
		}
		*/
		
		$panel = array();
		
		$panel['panel_id'] = $p->id;
		$panel['panel_type'] = $p->panel_type;
		$panel['panel_user'] = $p->user;
		$panel['gen_info'] = $p->gen_info;
		
		$json_panels[] = $panel;
		
	}
	
	if (!isset($_SESSION['panels_data'])) {
		$_SESSION['panels_data'] = "";
	}
	
	echo json_encode(array('panels' => $json_panels, 'panels_data' => stripslashes($_SESSION['panels_data'])));

} elseif ($func == "remove_panel") {
	
	$panel_id = $_REQUEST['panel'];
	
	unset($_SESSION['panels'][$panel_id]);
	
	header("Content-type: text/javascript");
	
	echo json_encode("Removed panel ".$panel_id);

} elseif ($func == 'save_pref') {

	$pref_name = $_POST['pref_name'];
	$pref_value = $_POST['pref_value'];	
	
	save_user_pref($pref_name,$pref_value);
	
} elseif ($func == 'get_shizzow_favorites') {
	
		$panel_id = $_REQUEST['panel'];
		$tw_user = $_SESSION['panels'][$panel_id]->user;
		$tw_pass = $_SESSION['panels'][$panel_id]->pass;
		
		header("Content-type: text/javascript");
		
		echo get_shizzow_favorites($tw_user,$tw_pass);

} elseif ($func == "proxy_send_shout") {

	$panel_id = $_REQUEST['panel'];
	$tw_user = $_SESSION['panels'][$panel_id]->user;
	$tw_pass = $_SESSION['panels'][$panel_id]->pass;
	
	$shout = $_REQUEST['shout_text'];
	$location = $_REQUEST['loc'];
	
	header("Content-type: text/javascript");
	
	echo send_shout($tw_user,$tw_pass,$shout,$location);

} elseif ($func == 'load_state') {

	require_once 'db/db_functions.php';
	
	$data = retrieve_user_data("test_user");
	
	header("Content-type: text/javascript");
	
	
	if ($data == null) {
		
		echo json_encode('NO_SAVED_STATE');
		
	} else {
	
		$data = unserialize($data['state']);
		$_SESSION['panels'] = $data['panels'];
		$_SESSION['panels_data'] = $data['panels_data'];
		
		echo json_encode("LOADED_SAVED_STATE");
	
	}

} elseif($func == 'save_state') {
	
	//save the session data to the user's openid in the db
	
	require_once 'db/db_functions.php';
	
	$_SESSION['panels_data'] = $_REQUEST['panels_data'];
		
	save_user($_SESSION['user_openid'],serialize($_SESSION));
	
	//save_user("test_user","test_data");
	
	header("Content-type: text/javascript");
	
	echo json_encode("SAVED_USER");


} elseif($func == 'logout') {
	
	unset($_SESSION);
	session_destroy();
	echo "Loggged out";
	
}


function save_user_pref($pref_name,$pref_value) {
	
	$_SESSION['user_prefs'][$pref_name] = $pref_value;
	
}


?>