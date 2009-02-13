<?php


function display_panel($panel) {
	
	
	?>
	<div class="panel twitter_panel proxy_panel" id="panel_<?=$panel->id?>">
		<input type="hidden" class="panel_id" value="<?=$panel->id?>"/>
		<input type="hidden" class="panel_user_name" value="<?=$panel->user?>"/>
		<input type="hidden" class="panel_background" value="<?=$panel->gen_info->profile_background_image_url?>" />
		<input type="hidden" class="panel_background_color" value="<?=$panel->gen_info->profile_background_color?>" />
		<input type="hidden" class="panel_type" value="regular_panel"/>
		
		<div class="twitter_inputs">
			<span class="dm_notify_box"></span>
			<textarea class="tweet_input" name="tweet_input" rows="3" cols="30"></textarea>
			<span class="add_hashtag">Add hashtag: </span><input type="text" class="add_hashtag" value=""/>
			<input type="button" class="tweet_submit" onclick="send_tweet('<?=$panel->id?>')" value="Update"/>
			<span class="length_notify_box" id="chars_left_panel_<?=$panel->id?>"></span>
			<br class="clear_both"/>
		</div>
		<div class="last_update"></div>
		<div class="tweet_type_menu">
			<br class="clear_both"/>
			<div class="tweet_type_button" id="panel_<?=$panel->id?>_regular" onclick="get_tweets('<?=$panel->id?>','regular',1)">Timeline</div>
			<div class="tweet_type_button" id="panel_<?=$panel->id?>_replies" onclick="get_tweets('<?=$panel->id?>','replies',1)">Replies</div>
			<div class="tweet_type_button" id="panel_<?=$panel->id?>_direct" onclick="get_tweets('<?=$panel->id?>','direct',1)">Direct messages</div>
			<br class="clear_both" />
		</div>
		<div class="tweets">
			
		</div>
		<div class="more_tweets" onclick="get_more_tweets('<?=$panel->id?>'); return false;">Load more tweets...</div>
		
	</div>
	<?
	
	
}

function display_search_panel($panel) {
	
	?>
	
	<div class="panel twitter_panel proxy_panel" id="panel_<?=$panel->id?>">
		<input type="hidden" class="panel_id" value="<?=$panel->id?>"/>
		<input type="hidden" class="panel_user_name" value="<?=$panel->user?>"/>
		<input type="hidden" class="panel_type" value="search_panel"/>
		<input type="hidden" class="panel_background" value="" />
		<input type="hidden" class="panel_background_color" value="fff" />
		<div class="twitter_inputs">
		</div>
		<div class="tweet_type_menu">

		</div>
		<div class="tweets">
			
		</div>
		<div class="more_tweets" onclick="get_more_tweets('<?=$panel->id?>'); return false;">Load more tweets...</div>
	</div>
	
	<?
	
}



?>