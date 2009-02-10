<?php
////////

define( 'VERSION', '0009' );

////////

$a = trim($_SERVER['REQUEST_URI'],'/');

$addr = '';

if ($a != '') {
	
	$addr = array_pop($items = split('/',$a));
	
}

$GLOBALS['mobile'] = false;

if ($addr == '') {
	include 'front/front.php';
	exit;
} elseif ($addr == 'm') {
	$GLOBALS['mobile'] = true;
} elseif ($addr == 'about') {
	include 'front/about.php';
	exit;
} elseif ($addr == 'client') {
	
	//we'll continue here
	
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
	</script>

	
	<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.2.6/jquery.min.js"></script>
	<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jqueryui/1.5.2/jquery-ui.min.js"></script>

	<script type="text/javascript" src='js/jquery.cookie.js'></script>
	<script type="text/javascript" src="js/shortcut.js"></script>
	<script type="text/javascript" src="js/jquery.scrollTo-1.4.0-min.js"></script>
	
	<script type="text/javascript" src="js/httpauth.js"></script>
	<script type="text/javascript" src="js/jquery.dimensions.pack.js"></script>

	<?php if ($_SERVER['HTTP_HOST'] == "combotweet.local:8888"): ?>
	<script type="text/javascript" src="js/core2.js?v=<?=VERSION?>"></script>
	<?php else: ?>
	<!-- <script type="text/javascript" src="js/m.js?v=<?=VERSION?>"></script> -->
	<script type="text/javascript" src="js/core2.js?v=<?=VERSION?>"></script>
	<?php endif; ?>
	
<title>ComboTweet</title>

<?php if (!$GLOBALS['mobile']): ?>
	<?php if ($_SERVER['HTTP_HOST'] != "twitter.tagal.us"): ?>
		<script type="text/javascript">
			var VERSION = '<?=VERSION?>';
			document.write('<link href="' + CSS_FILE + '?v=' + VERSION + '" media="screen, projection" rel="stylesheet" type="text/css" />');
		</script>
	<?php else: ?>
		<!-- <link href="front/bubble_style.css?v=<?=VERSION?>" media="screen, projection" rel="stylesheet" type="text/css" /> -->
		<link href="front/min_style.css?v=<?=VERSION?>" media="screen, projection" rel="stylesheet" type="text/css" />
	<?php endif; ?>	
<?php else: ?>
	<link href="front/mobile_style.css?v=<?=VERSION?>" media="screen, projection" rel="stylesheet" type="text/css"/>
	<meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0; user-scalable=0;"/>
<?php endif; ?>


</head>
<body>
			<div id="header">
				
				<div id="identifier">
					<h1>ComboTweet</h1>
					<span id="header_desc">An AJAX-powered Twitter client that lets you use multiple accounts simultaneously.  <strong><a href="about">Learn more</a></strong></span>
					<br class="clear_both"/>
				</div>
			
			<div id="header_nav_buttons">
				
			</div>
			
			<div id="nav_buttons_wrapper">

				<img src="images/loader.gif" id="loader" alt="loading..."/>
				
					<div id="global_buttons">
						<img src="images/Plus.png" id="new_panel_button" onclick="show_login_form()" alt="New Panel" title="New panel"/>
				
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
		</div>
		
		<div id="settings_form">
			<form onsubmit="update_settings();return false;" action="" method="post">
				<label>Tabbed browsing:</label><input type="checkbox" id="tabbed_panels"/><br class="clear_both"/>
				<label>Refresh frequency:</label><input type="text" id="refresh_freq"/><br class="clear_both"/>
				<label>Remove old tweets:</label><input type="checkbox" id="remove_old_tweets"/><br class="clear_both"/>
				<label>Font size (%):</label><input type="text" id="font_size"/><br class="clear_both"/>
				<input id="update_settings_button" type="submit" value="Save" />
			</form>
		</div>

	<div id="canvas">

			<div id="panels">

			</div>
	
			<div id="notify_overlay" onclick="hide_notify_window()"></div><div id="notify_window"><img src="images/Cancel.png" id="notify_close_button" onclick="hide_notify_window()" alt="Close" title="Close window" /><div id="notify_content"></div></div>
	
	
</div>


<div id="footer">
	(c) 2009 - John Nastos
	<!-- Icons by www.mouserunner.com distributed under Creative Commons -->
</div>

<?php include 'bin/tracking.php' ?>

</body>
</html>