<?php
////////

define( 'VERSION', '0008' );

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

	<script type="text/javascript" src="js/httpauth.js"></script>
	<script type="text/javascript" src="js/jquery.dimensions.pack.js"></script>
	<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.2.6/jquery.min.js"></script>
	<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jqueryui/1.5.2/jquery-ui.min.js"></script>

	<?php if ($_SERVER['HTTP_HOST'] == "mtxs.local:8888"): ?>
	<script type="text/javascript" src="js/core.js?v=<?=VERSION?>"></script>
	<?php else: ?>
	<script type="text/javascript" src="js/m.js?v=<?=VERSION?>"></script>
	<?php endif; ?>
	
<title>ComboTweet</title>

<?php if (!$GLOBALS['mobile']): ?>
	<?php if ($_SERVER['HTTP_HOST'] != "twitter.tagal.us"): ?>
		<script type="text/javascript">
			var VERSION = <?=VERSION?>;
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

<div id="canvas">
	<img id="canvas_bg" src="images/bird_bg.png" alt="" style="display: none;"/>
	
		
			<div id="header">
				<h1>ComboTweet</h1>
				<span id="header_desc">An AJAX-powered Twitter client that lets you use multiple accounts simultaneously.<br/>  <strong><a href="about">Learn more</a></strong></span>
			</div>
			<img src="images/loader.gif" id="loader" alt="loading..."/>
			<div id="nav_buttons_wrapper">

			<div id="global_buttons">
				<img src="images/Cancel.png" id="logout_button" onclick="logout()" alt="Logout" title="Logout (All users)" />
				<img src="images/Magnifier.png" id="search_panel_button" onclick="add_search_panel(null)" alt="Search" title="Search"/>
				<img src="images/Redo.png" id="refresh_button" onclick="refresh_tweets()" alt="Refresh" title="Refresh tweets"/>
				<img src="images/Plus.png" id="new_panel_button" onclick="show_login_form()" alt="New Panel" title="New panel"/>
			</div>

			<div id="nav_buttons">

			</div>
			<br class="clear_both" />
			</div>

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