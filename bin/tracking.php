<!-- Analytics -->
<div id="stats">
	<?php

	$track_users = true;

	if (isset($_COOKIE['jnNoTrack'])) {
	  if ( $_COOKIE['jnNoTrack'] == 'true' ) {
	    $track_users = false;
	  }
	}
	?>
	
	<?php if ($track_users): ?>
		
		<script type="text/javascript">
		var gaJsHost = (("https:" == document.location.protocol) ? "https://ssl." : "http://www.");
		document.write(unescape("%3Cscript src='" + gaJsHost + "google-analytics.com/ga.js' type='text/javascript'%3E%3C/script%3E"));
		</script>
		<script type="text/javascript">
		try {
		var pageTracker = _gat._getTracker("UA-4159233-5");
		pageTracker._trackPageview();
		} catch(err) {}</script>
		
	<?php else: ?>
	<!-- I'm not tracking your visits... go to /track.php to turn tracking back on -->	
	<?php endif; ?>
	
</div>