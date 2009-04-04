<?php
////////

define( 'VERSION', '0015' );

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

$rpx_token = 'http://'.$_SERVER['HTTP_HOST'].'/rpx/token.php';

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
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:fb="http://www.facebook.com/2008/fbml">
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

	
	<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js"></script>
	<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jqueryui/1.7.1/jquery-ui.min.js"></script>

	<script type="text/javascript" src="http://www.google.com/jsapi"></script>
	<script type="text/javascript">
	  google.load("language", "1");
	</script>

	<script type="text/javascript" src='js/json2.js'></script>

	<script type="text/javascript" src='js/jquery.cookie.js'></script>
	<script type="text/javascript" src="js/shortcut.js"></script>
	<script type="text/javascript" src="js/jquery.scrollTo-1.4.0-min.js"></script>
	
	<script type="text/javascript" src="js/httpauth.js"></script>
	<script type="text/javascript" src="js/jquery.dimensions.pack.js"></script>
	<script src="http://tagal.us/javascripts/tagalus_api_interface.js" type="text/javascript"></script>
	

	<?php if (strpos($_SERVER['HTTP_HOST'],"combotweet.com") !== FALSE): ?>
		<script type="text/javascript" src="js/compiledcode.js?v=<?=VERSION?>"></script>
	<?php else: ?>
		<script type="text/javascript" src="js/split/data_parsing.js?v=<?=time();?>"></script>
		<script type="text/javascript" src="js/split/objects.js?v=<?=time();?>"></script>
		<script type="text/javascript" src="js/split/options.js?v=<?=time();?>"></script>
		<script type="text/javascript" src="js/split/panel_functions.js?v=<?=time();?>"></script>
		<script type="text/javascript" src="js/split/plugins.js?v=<?=time();?>"></script>
		<script type="text/javascript" src="js/split/shizzow_functions.js?v=<?=time();?>"></script>
		<script type="text/javascript" src="js/split/startup.js?v=<?=time();?>"></script>
		<script type="text/javascript" src="js/split/time_sorting.js?v=<?=time();?>"></script>
		<script type="text/javascript" src="js/split/twitter_functions.js?v=<?=time();?>"></script>
		<script type="text/javascript" src="js/split/ui_navigation.js?v=<?=time();?>"></script>
		<script type="text/javascript" src="js/split/ui_navigation.js?v=<?=time();?>"></script>
		<script type="text/javascript" src="js/split/variables.js?v=<?=time();?>"></script>
		<script type="text/javascript" src="js/split/window_functions.js?v=<?=time();?>"></script>
		<script type="text/javascript" src="js/split/save_state.js?v=<?=time();?>"></script>
		<script type="text/javascript" src="js/split/app_type/air_functions.js?v=<?=time();?>"></script>
		<script type="text/javascript" src="js/split/app_type/javascript_functions.js?v=<?=time();?>"></script>
		<script type="text/javascript" src="js/split/app_type/proxy_functions.js?v=<?=time();?>"></script>
		<script type="text/javascript" src="js/split/outside_code/date_parsing.js?v=<?=time();?>"></script>
		<script type="text/javascript" src="js/split/tagalus_functions.js?v=<?=time();?>"></script>
		<script type="text/javascript" src="js/split/facebook_functions.js?v=<?=time();?>"></script>
	<?php endif; ?>
	
<title>ComboTweet</title>

<?php if (!$GLOBALS['mobile']): ?>
	<?php //if ($_SERVER['HTTP_HOST'] != "combotweet.com"): ?>
		<script type="text/javascript">
		 //<![CDATA[
		
			var VERSION = '<?=VERSION?>';
			document.write('<link href="front/' + CSS_FILE + '?v=' + VERSION + '" media="screen, projection" rel="stylesheet" type="text/css" />');
			
			//]]>
			
		</script>
	<?php //else: ?>
		<!-- <link href="front/bubble_style.css?v=<?=VERSION?>" media="screen, projection" rel="stylesheet" type="text/css" /> -->
		<!-- <link href="front/min_style.css?v=<?=VERSION?>" media="screen, projection" rel="stylesheet" type="text/css" /> -->
	<?php //endif; ?>	
<?php else: ?>
	<link href="front/mobile_style.css?v=<?=VERSION?>" media="screen, projection" rel="stylesheet" type="text/css"/>
	<meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0; user-scalable=0;"/>
<?php endif; ?>
<link href="http://tagal.us/stylesheets/tagalus_widget.css" media="screen, projection" rel="stylesheet" type="text/css"/>



</head>
<body>
	<!-- <script src="http://static.ak.connect.facebook.com/js/api_lib/v0.4/FeatureLoader.js.php" type="text/javascript"></script> -->
	
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
				
						<img src="images/Save.png" id="save_state_button" onclick="save_to_openid(true); return false;" alt="Save State" title="Save State" /> 
				
						<img src="images/Redo.png" id="refresh_button" onclick="refresh_tweets()" alt="Refresh" title="Refresh tweets"/>
				
				
						<img src="images/Magnifier.png" id="search_panel_button" onclick="toggle_search_form()" alt="Search" title="Search"/>
				
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
			<a href="oauth_start_login"><img src="images/Plus.png" id="add_account_button" alt="Add an Account" title="Add Account"/> Log in to another account (OAuth)
			</a>
			<br/>
			<div class="login_hr">&nbsp;</div>
			<!-->
			<form method="post" id="save_state" action="bin/openid_tools.php" ><fieldset>
				Save your open panels (using an OpenID):<br/>
			<input type="text" id="openid_identifier" name="openid_identifier" value=""/>
			<input type="image" name="openid_action" src="images/Key.png" id="load_state_button" value="load" onclick="load_state(); return false;" />
			<input type="image" name="openid_action" src="images/Save.png" id="save_state_button" value="login" onclick="save_state_submit(); return false;" style="display: none;"/>
			</fieldset></form>
			-->
			
			<a class="rpxnow" onclick="return false;"
			   href="https://combotweet.rpxnow.com/openid/v2/signin?token_url=<?=$rpx_token?>">
			<img src="images/Key.png" id="load_state_button" alt="Load" />
			  Sign In (to be able to save open panels)</a>
				<?php if (isset($_SESSION['user_openid'])): ?>
				<br/>(You are currently signed in as <?=$_SESSION['user_openid']?>)
				<?php endif; ?>
			
			
			
			<br/>
			
			<div class="login_hr">&nbsp;</div>
			
			<!-- 
			Open a Facebook panel: <fb:login-button onlogin="fb_login();"></fb:login-button>
			
			<div class="login_hr">&nbsp;</div>
			-->
			
			
			<a href="" onclick="open_filtered_panel_dialog(); return false;"><img src="images/Plus.png" class="ui_icon" id="add_filtered_panel_button" alt="Add a filtered panel" /> Create a filtered panel</a>
			
			<div class="login_hr">&nbsp;</div>
			
			
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
		
		<div id="search_form">
			<form id="search_form_form" action="" onsubmit="">
			<input type="text" id="search_term" value="" />&nbsp;<input type="submit" value="Search" onclick="add_search_panel($('#search_term').val()); hide_open_windows(); return false;"/>
			</form>
		</div>
		
		<div id="settings_form">
			<form onsubmit="update_settings();return false;" action="" method="post">
				<label>Tabbed browsing:</label><input type="checkbox" id="tabbed_panels"/><br class="clear_both"/>
				<label>Remove old tweets:</label><input type="checkbox" id="remove_old_tweets"/><br class="clear_both"/>
				<label>Append hashtag:</label><input type="checkbox" id="add_hashtag"/><br class="clear_both"/>
				<label>URL Shortener:</label><input type="checkbox" id="show_url_shortener"/><br class="clear_both"/>
				
				<label>Auto-save panels:</label><input type="checkbox" id="auto_save_checkbox"/><br class="clear_both"/>
				<label>Refresh frequency:</label><input type="text" id="refresh_freq"/><br class="clear_both"/>
				<label>Font size (%):</label><input type="text" id="font_size"/><br class="clear_both"/>
				<label>Panel width (px):</label><input type="text" id="panel_width"/><br class="clear_both"/>
				<label>Theme: </label>
				<select id="css_file_setting">
					<option value="newui.css">Light</option>
					<option value="dark.css">Dark</option>
				</select>
				<br class="clear_both"/>
				
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

		
		<?php 
			if (isset($_SESSION['flash_message']))  { 
				
				?>
				<div id="flash_message">
					<?=$_SESSION['flash_message'];?>
					<img id="close_flash_message" class="close_panel" title="Close this message" alt="Close Message" onclick="hide_flash_message()" src="images/Cancel.png"/>
				</div>
				<?php
					unset($_SESSION['flash_message']);
		 	} else {
				//echo "Welcome!";
			}
		?>
		
		<div class="startup_box">
			<span id="save_warning">Remember: If you would like to save your open panels, click the <img src="images/Plus.png" alt="Plus"/> and then choose "Sign in".  If you've saved panels from a previous session, signing in will load your saved state.</span><br/><span style="color: #a33">Also remember to save the state of your panels before closing this page (click the <img src="images/Save.png" alt="Save"/> in the top right once you've logged in).</span>  Unless you turn the option off, changes will be periodically auto-saved for you as well.
		</div>
		<div class="startup_box">
			
			<p><strong>Welcome to ComboTweet!</strong></p>
			<p>ComboTweet is in Beta, and early Beta at that - we're working quickly to add features.  Please tweet at @jnpdx or @combotweet for help, requests, bug reports, etc.  You can also visit the <a href="http://blog.combotweet.com/">ComboTweet blog</a>.  Source code is <a href="http://github.com/jnpdx/combotweet">available on GitHub</a>.</p>
			<p>Click on the <img src="images/Plus.png" alt="Plus"/> icon to open a panel for a new user.  ComboTweet uses OAuth by default, meaning you don't have to give your password to third parties - authentication is done directly with Twitter.</p>
			<p>To open a search panel instead of a user panel, use the <img src="images/Magnifier.png" alt="Search"/> icon.</p>
			<p>To open a filtered panel (if you only want to see tweets from certain users), click the <img src="images/Plus.png" alt="Plus"/> and then choose "Create a filtered panel"</p>
			<p>To logout of ComboTweet, use the <img src="images/Cancel.png" alt="Close"/> icon - this will close all of your open panels.  Note: this will not delete data associated with your OpenID</p>
		</div>

			<div id="panels">
				
			</div>
	
			<div id="combotweet_alert_box"><img src="images/Cancel.png" id="alert_close_button" onclick="hide_alert()" alt="Close" title="Close window" /><p>test alert</p><br class="clear_both"/></div>
	
			<div id="notify_overlay" onclick="hide_open_windows()"></div><div id="notify_window"><img src="images/Cancel.png" id="notify_close_button" onclick="hide_open_windows()" alt="Close" title="Close window" /><div id="notify_content"></div></div>
	
	
</div>


<div id="footer">
	(c) 2009 - John Nastos (@jnpdx)
	<!-- Icons by www.mouserunner.com distributed under Creative Commons -->
</div>

<?php include 'bin/tracking.php' ?>

<script src="https://rpxnow.com/openid/v2/widget"
        type="text/javascript"></script>
<script type="text/javascript">
  RPXNOW.token_url = "<?=$rpx_token?>";
  RPXNOW.realm = "combotweet";
  RPXNOW.overlay = true;
  RPXNOW.language_preference = 'en';
</script>


</body>
</html>