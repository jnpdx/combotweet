<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
	"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
	
<title>About ComboTweet</title>
<?php if ($_SERVER['HTTP_HOST'] != "twitter.tagal.us"): ?>
<link href="../front/style.css" media="screen, projection" rel="stylesheet" type="text/css" />
<?php else: ?>
<link href="../front/min_style.css" media="screen, projection" rel="stylesheet" type="text/css" />	
<?php endif; ?>	
</head>
<body>
	
<div id="canvas">
	
	
	<div id="about">
		
		<?php include 'about_data.html' ?>
		
	</div>
	
</div>
	

<?php include 'bin/tracking.php' ?>
</body>
</head>
</html>