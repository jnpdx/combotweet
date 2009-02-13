//Updates the timestamp on displayed tweets for a given panel
function update_times(panel_id) {
	
	var pan = get_panel_by_id(panel_id);
	
	cur_date = new Date();
	
	if (pan.panel_data != undefined) {
		for (var t = 0; t < pan.panel_data.length; t++) {
	
			$('#tweet_time_' + pan.panel_data[t].id).html(get_time_text(cur_date,new Date(pan.panel_data[t].created_at)));
	
		}
	}
	
}

//Returns a string representing the age of the tweet. Eg "2 minutes ago", "4 hours ago"
function get_time_text(cur_date,created_date) {
		
	var time_diff = parseInt((cur_date.getTime() - created_date.getTime()) / 1000);
	
	
	if (time_diff <= (60 * 60 * 12))  {//12 hours ago
		
		if (time_diff <= 60) {
			return "Less than a minute ago ";
		} else if (time_diff < 3600) {
			var min_ago = parseInt(time_diff / 60);
			return min_ago + " minutes ago ";
		} else {
			var hrs_ago = parseInt(time_diff / 3600);
			return hrs_ago + " hours ago ";
		}
		
	} else {
		return created_date + " ";
	}
	
}