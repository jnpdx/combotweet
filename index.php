<?php
////////

define( 'VERSION', '0009' );

////////
if ($_SERVER['HTTP_HOST'] != "combotweet.com") {
	
	$GLOBALS['DEV_ENV'] = true;
	
} else {
	
	$GLOBALS['DEV_ENV'] = false;
	
}


if (!isset($_SESSION)) {
	session_start();
	//echo 'starting session';	
}

$a = trim($_SERVER['REQUEST_URI'],'/');

$addr = '';

if ($a != '') {
	
	$addr = array_pop($items = split('/',$a));
	$addr = array_shift($items = split('\?',$addr));
	//echo "$addr";
	
}

$GLOBALS['mobile'] = false;

if ($addr == '') {
	//include 'front/front.php';
	//exit;
	//let's continue ==
	header("Location: ".'http://'.$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI']. "client");
} elseif ($addr == 'm') {
	$GLOBALS['mobile'] = true;
} elseif ($addr == 'about') {
	include 'front/about.php';
	exit;
} elseif ($addr == "oauth_start_login") {
	include "bin/oauth/oauth_functions.php";
	exit;
} elseif ($addr == "oauth_callback") {
	include "bin/oauth/oauth_functions.php";
	exit;
} elseif ($addr == 'client') {
		
	//we'll continue here
	$_SESSION['client_url'] = 'http://'.$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'];
	
	
}

//get any panels referred to in the request

if (isset($_GET['search'])) {
	
	$search_terms_field = $_GET['search'];
	$search_terms = split(',',$search_terms_field);
	
}

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
	"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>

	<script type="text/javascript">
		<?php if (isset($search_terms)): ?>
		var request_panes = new Array();
		<?php foreach($search_terms as $term): ?>
			request_panes.push('<?=$term?>');
		<?php endforeach; ?>
		<?php endif; ?>
	</script>
	<script type="text/javascript">
	var MOBILE = <?php if ($GLOBALS['mobile']) { echo 'true'; } else { echo 'false'; } ?>;
	var user_openid = '<?php if (isset($_SESSION['user_openid'])) { echo $_SESSION['user_openid']; } ?>';
	</script>

	
	<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.2.6/jquery.min.js"></script>
	<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jqueryui/1.5.2/jquery-ui.min.js"></script>

	<script type="text/javascript" src='js/jquery.cookie.js'></script>
	<script type="text/javascript" src="js/shortcut.js"></script>
	<script type="text/javascript" src="js/jquery.scrollTo-1.4.0-min.js"></script>
	
	<script type="text/javascript" src="js/httpauth.js"></script>
	<script type="text/javascript" src="js/jquery.dimensions.pack.js"></script>
	<script src="http://tagal.us/javascripts/tagalus_api_interface.js" type="text/javascript"></script>
	

	<?php if ($_SERVER['HTTP_HOST'] == "combotweet.com"): ?>
		<script type="text/javascript" src="js/compiledcode.js?v=<?=VERSION?>"></script>
	<?php else: ?>
		<script type="text/javascript" src="js/split/data_parsing.js"></script>
		<script type="text/javascript" src="js/split/objects.js"></script>
		<script type="text/javascript" src="js/split/options.js"></script>
		<script type="text/javascript" src="js/split/panel_functions.js"></script>
		<script type="text/javascript" src="js/split/plugins.js"></script>
		<script type="text/javascript" src="js/split/shizzow_functions.js"></script>
		<script type="text/javascript" src="js/split/startup.js"></script>
		<script type="text/javascript" src="js/split/time_sorting.js"></script>
		<script type="text/javascript" src="js/split/twitter_functions.js"></script>
		<script type="text/javascript" src="js/split/ui_navigation.js"></script>
		<script type="text/javascript" src="js/split/ui_navigation.js"></script>
		<script type="text/javascript" src="js/split/variables.js"></script>
		<script type="text/javascript" src="js/split/window_functions.js"></script>
		<script type="text/javascript" src="js/split/save_state.js"></script>
		<script type="text/javascript" src="js/split/app_type/air_functions.js"></script>
		<script type="text/javascript" src="js/split/app_type/javascript_functions.js"></script>
		<script type="text/javascript" src="js/split/app_type/proxy_functions.js"></script>
		<script type="text/javascript" src="js/split/outside_code/date_parsing.js"></script>
		<script type="text/javascript" src="js/split/tagalus_functions.js"></script>
		
		<script src="http://localtag:3000/javascripts/tagalus_api_interface.js" type="text/javascript"></script>
	<?php endif; ?>
	
<title>ComboTweet</title>

<?php if (!$GLOBALS['mobile']): ?>
	<?php if ($_SERVER['HTTP_HOST'] != "combotweet.com"): ?>
		<script type="text/javascript">
		 //<![CDATA[
		
			var VERSION = '<?=VERSION?>';
			document.write('<link href="' + CSS_FILE + '?v=' + VERSION + '" media="screen, projection" rel="stylesheet" type="text/css" />');
			
			//]]>
			
		</script>
	<?php else: ?>
		<!-- <link href="front/bubble_style.css?v=<?=VERSION?>" media="screen, projection" rel="stylesheet" type="text/css" /> -->
		<link href="front/min_style.css?v=<?=VERSION?>" media="screen, projection" rel="stylesheet" type="text/css" />
	<?php endif; ?>	
<?php else: ?>
	<link href="front/mobile_style.css?v=<?=VERSION?>" media="screen, projection" rel="stylesheet" type="text/css"/>
	<meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0; user-scalable=0;"/>
<?php endif; ?>
<link href="http://tagal.us/stylesheets/tagalus_widget.css" media="screen, projection" rel="stylesheet" type="text/css"/>



</head>
<body>
			<div id="header">
				
				<div id="identifier">
					<h1>ComboTweet</h1>
					<span id="header_desc">An AJAX-powered Twitter client that lets you use multiple accounts simultaneously.  <strong><a href="about">Learn more</a>.  <a href="http://blog.combotweet.com/">Blog</a></strong></span>
					<br class="clear_both"/>
				</div>
			
			<div id="header_nav_buttons">
				
			</div>
			
			<div id="nav_buttons_wrapper">

				<img src="images/loader.gif" id="loader" alt="loading..."/>
				
					<div id="global_buttons">
						<img src="images/Plus.png" id="new_panel_button" onclick="show_login_form()" alt="New Panel" title="New panel"/>
				
						<!--<img src="images/Save.png" id="save_state_button" onclick="show_save_state_form()" alt="Save State" title="Save State" /> -->
				
						<img src="images/Redo.png" id="refresh_button" onclick="refresh_tweets()" alt="Refresh" title="Refresh tweets"/>
				
				
						<img src="images/Magnifier.png" id="search_panel_button" onclick="add_search_panel(null)" alt="Search" title="Search"/>
				
						<img src="images/Tools.png" id="settings_panel_button" onclick="show_settings_form()" alt="Settings" title="Settings"/>
				
						<img src="images/Cancel.png" id="logout_button" onclick="logout()" alt="Logout" title="Logout (All users)" />
				
					</div>

					<div id="nav_buttons">

					</div>
					<br class="clear_both" />
			</div>

			
		</div> <!-- end header -->


		<div id="login_form">
			<!--
			<form onsubmit="make_new_panel();return false;" action="" method="post">
			<label>User name:</label><input type="text" id="tw_user"/><br class="clear_both"/>
			<br class="clear_both"/>
			<label>Password:</label><input type="password" id="tw_pass"/><br class="clear_both"/><br class="clear_both"/>
			<label>Type:</label>
			<select id="account_type">
				<option value="twitter">Twitter</option>
				<option value="shizzow">Shizzow</option>
			</select>
			<br class="clear_both"/>
			<label>&nbsp;</label><input id="login_button" type="submit" value="Login"/>
			</form>
			<br/>
			<p>You can also <a href="oauth_start_login">login using OAuth (Beta)</a></p>
		-->
			<a href="oauth_start_login">Log in to another account (OAuth)
			<img src="images/Plus.png" id="add_account_button" alt="Add an Account" title="Add Account"/></a>
			<br/>
			<form method="post" id="save_state" action="bin/openid_tools.php" ><fieldset>
				Save your open panels (using an OpenID):<br/>
			<input type="text" id="openid_identifier" name="openid_identifier" value=""/>
			<input type="image" name="openid_action" src="images/Key.png" id="load_state_button" value="load" onclick="load_state(); return false;" />
			<input type="image" name="openid_action" src="images/Save.png" id="save_state_button" value="login" onclick="save_state_submit(); return false;" style="display: none;"/>
			</fieldset></form>
			<br/>
			
			
			
			<a href="" onclick="$('#old_login_form').show(); return false;" style="font-size: .9em; display: block;">(Show old login form)</a>
			<form id="old_login_form" onsubmit="make_new_panel();return false;" action="" method="post" style="display: none;">
			<label>User name:</label><input type="text" id="tw_user"/><br class="clear_both"/>
			<br class="clear_both"/>
			<label>Password:</label><input type="password" id="tw_pass"/><br class="clear_both"/><br class="clear_both"/>
			<label>Type:</label>
			<select id="account_type">
				<option value="twitter">Twitter</option>
				<option value="shizzow">Shizzow</option>
			</select>
			<br class="clear_both"/>
			<label>&nbsp;</label><input id="login_button" type="submit" value="Login"/>
			</form>
		</div>
		
		<div id="settings_form">
			<form onsubmit="update_settings();return false;" action="" method="post">
				<label>Tabbed browsing:</label><input type="checkbox" id="tabbed_panels"/><br class="clear_both"/>
				<label>Remove old tweets:</label><input type="checkbox" id="remove_old_tweets"/><br class="clear_both"/>
				<label>Append hashtag:</label><input type="checkbox" id="add_hashtag"/><br class="clear_both"/>
				
				<label>Refresh frequency:</label><input type="text" id="refresh_freq"/><br class="clear_both"/>
				<label>Font size (%):</label><input type="text" id="font_size"/><br class="clear_both"/>
				<label>Panel width (px):</label><input type="text" id="panel_width"/><br class="clear_both"/>
				<label>Tagalus API Key <a target="_blank" href="http://blog.tagal.us/api-documentation/">(?)</a>:</label><input type="text" id="tagalus_api_key"/><br class="clear_both"/>
				
				<input id="update_settings_button" type="submit" value="Save" />
			</form>
		</div>
		
		<!--
		<div id="save_state_form">
			<form method="post" id="login_form" action="bin/openid_tools.php" onsubmit="return save_state_submit();"><fieldset>
			<h2>Save state (requires OpenID)</h2>
			<input type="text" id="openid_identifier" name="openid_identifier" value="">
			<input type="submit" name="openid_action" value="login">
			</fieldset></form>
		</div>
		-->

		

	<div id="canvas">

		<div id="startup_box">
			<p><strong>Welcome to ComboTweet!</strong></p>
			<p>ComboTweet is in Beta, and early Beta at that - we're working quickly to add features.  Please tweet at @jnpdx or @combotweet for help, requests, bug reports, etc.  You can also visit the <a href="http://blog.combotweet.com/">ComboTweet blog</a>.  Source code is <a href="http://github.com/jnpdx/combotweet">available on GitHub</a>.</p>
			<p>Click on the <img src="images/Plus.png" alt="Plus"/> icon to open a panel for a new user.  ComboTweet uses OAuth by default, meaning you don't have to give your password to third parties - authentication is done directly with Twitter.</p>
			<p>In the same window, you can (optionally) choose to enter an OpenID to save the state of ComboTweet.  If you choose to do this (click the <img src="images/Key.png" alt="Key"/>), first you will have to verify your OpenID.  After you have verified it, you can choose the <img src="images/Save.png" alt="Save"/> icon to save your open panels.  Next time you log in, you can associate your OpenID (<img src="images/Key.png" alt="Key"/>) and it will reload your open panels.</p>
			<p>To open a search panel instead of a user panel, use the <img src="images/Magnifier.png" alt="Search"/> icon</p>
			<p>To logout of ComboTweet, use the <img src="images/Cancel.png" alt="Close"/> icon - this will close all of your open panels.  Note: this will note delete data associated with your OpenID</p>
		</div>

			<div id="panels">
				
			</div>
	
			<div id="notify_overlay" onclick="hide_notify_window()"></div><div id="notify_window"><img src="images/Cancel.png" id="notify_close_button" onclick="hide_open_windows()" alt="Close" title="Close window" /><div id="notify_content"></div></div>
	
	
</div>


<div id="footer">
	(c) 2009 - John Nastos (@jnpdx)
	<!-- Icons by www.mouserunner.com distributed under Creative Commons -->
</div>

<?php include 'bin/tracking.php' ?>

</body>
</html>