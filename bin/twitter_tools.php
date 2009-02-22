<?php



function get_tweets($user,$pass,$tweet_type,$page,$since) {
	
	$since_req = "&since_id=$since";
	
	if ($since == '-1') {
		
		$since_req = '';
		
	}
	
	if ($page != 1) {
		
		$since_req = '';
		
	}
	
	
	$url = 'http://twitter.com/statuses/friends_timeline.json';
	
	
	
	if ($tweet_type == 'regular') {
		$url = 'http://twitter.com/statuses/friends_timeline.json';
	} elseif ($tweet_type == 'replies') {
		$url = 'http://twitter.com/statuses/replies.json';
	} elseif($tweet_type == 'direct') {
		//have to use a get request - won't work yet
		return get_direct_messages($user,$pass,$page);
	} elseif($tweet_type == 'direct_sent') {
		return get_sent_direct_messages($user,$pass,$page);
	}
	
	if ($pass == "__USING_OAUTH") {
		$to =  $_SESSION['panels'][$user]->oauth;
		
		$content = $to->OAuthRequest($url, array(), 'POST');
		
		return $content;
		
	} else {
		$curl_handle = curl_init();
		curl_setopt($curl_handle,CURLOPT_REFERER,"http://tagal.us/");
		curl_setopt($curl_handle, CURLOPT_URL, "$url");
		curl_setopt($curl_handle, CURLOPT_CONNECTTIMEOUT, 2);
		curl_setopt($curl_handle, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($curl_handle, CURLOPT_POST, 1);
		curl_setopt($curl_handle, CURLOPT_POSTFIELDS, "page=$page$since_req");
		curl_setopt($curl_handle, CURLOPT_USERPWD, "$user:$pass");
		$buffer = curl_exec($curl_handle);
		$info = curl_getinfo($curl_handle);
	
		return $buffer;
	}
	
}

function get_direct_messages($user,$pass,$page) {
	
	$url = "http://twitter.com/direct_messages.json?page=$page";
	
	if ($pass == "__USING_OAUTH") {
		$to =  $_SESSION['panels'][$user]->oauth;
		
		$content = $to->OAuthRequest($url, array(), 'GET');
		
		return $content;
		
	} else {
	
		$curl_handle = curl_init();
		curl_setopt($curl_handle,CURLOPT_REFERER,"http://tagal.us/");
		curl_setopt($curl_handle, CURLOPT_URL, "$url");
		curl_setopt($curl_handle, CURLOPT_CONNECTTIMEOUT, 2);
		curl_setopt($curl_handle, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($curl_handle, CURLOPT_USERPWD, "$user:$pass");
		$buffer = curl_exec($curl_handle);
		$info = curl_getinfo($curl_handle);
	
		return $buffer;
	
	}
}

function get_sent_direct_messages($user,$pass,$page) {
	
	$url = "http://twitter.com/direct_messages/sent.json?page=$page";
	
	if ($pass == "__USING_OAUTH") {
		$to =  $_SESSION['panels'][$user]->oauth;
		
		$content = $to->OAuthRequest($url, array(), 'GET');
		
		return $content;
		
	} else {
	
		$curl_handle = curl_init();
		curl_setopt($curl_handle,CURLOPT_REFERER,"http://tagal.us/");
		curl_setopt($curl_handle, CURLOPT_URL, "$url");
		curl_setopt($curl_handle, CURLOPT_CONNECTTIMEOUT, 2);
		curl_setopt($curl_handle, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($curl_handle, CURLOPT_USERPWD, "$user:$pass");
		$buffer = curl_exec($curl_handle);
		$info = curl_getinfo($curl_handle);
	
		return $buffer;
		
	}
	
}

function toggle_favorite($user,$pass,$id,$fav) {
	
	if ($fav == 'true') {
		
		$url = "http://twitter.com/favorites/create/$id.json";
		
		if ($pass == "__USING_OAUTH") {
			$to =  $_SESSION['panels'][$user]->oauth;

			$content = $to->OAuthRequest($url, array(), 'POST');

			return $content;

		} else {
		
			$curl_handle = curl_init();
			curl_setopt($curl_handle,CURLOPT_REFERER,"http://tagal.us/");
			curl_setopt($curl_handle, CURLOPT_URL, "$url");
			curl_setopt($curl_handle, CURLOPT_CONNECTTIMEOUT, 2);
			curl_setopt($curl_handle, CURLOPT_RETURNTRANSFER, 1);
			curl_setopt($curl_handle, CURLOPT_POST, 1);
			curl_setopt($curl_handle, CURLOPT_POSTFIELDS, "");
			curl_setopt($curl_handle, CURLOPT_USERPWD, "$user:$pass");
			$buffer = curl_exec($curl_handle);
			$info = curl_getinfo($curl_handle);

			return $buffer;
			
		}
		
	} else {
		
		$url = "http://twitter.com/favorites/destroy/$id.json";
		
		if ($pass == "__USING_OAUTH") {
			$to =  $_SESSION['panels'][$user]->oauth;

			$content = $to->OAuthRequest($url, array(), 'POST');

			return $content;

		} else {
		
			$curl_handle = curl_init();
			curl_setopt($curl_handle,CURLOPT_REFERER,"http://tagal.us/");
			curl_setopt($curl_handle, CURLOPT_URL, "$url");
			curl_setopt($curl_handle, CURLOPT_CONNECTTIMEOUT, 2);
			curl_setopt($curl_handle, CURLOPT_RETURNTRANSFER, 1);
			curl_setopt($curl_handle, CURLOPT_POST, 1);
			curl_setopt($curl_handle, CURLOPT_POSTFIELDS, "");
			curl_setopt($curl_handle, CURLOPT_USERPWD, "$user:$pass");
			$buffer = curl_exec($curl_handle);
			$info = curl_getinfo($curl_handle);

			return $buffer;
			
		}
		
	}
	
}

function follow_user($user,$pass,$to_follow) {
	
	$url = "http://twitter.com/friendships/create/$to_follow.json";
	
	if ($pass == "__USING_OAUTH") {
		$to =  $_SESSION['panels'][$user]->oauth;
		
		$content = $to->OAuthRequest($url, array(), 'POST');
		
		return $content;
		
	} else {
	
		$curl_handle = curl_init();
		curl_setopt($curl_handle,CURLOPT_REFERER,"http://tagal.us/");
		curl_setopt($curl_handle, CURLOPT_URL, "$url");
		curl_setopt($curl_handle, CURLOPT_CONNECTTIMEOUT, 2);
		curl_setopt($curl_handle, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($curl_handle, CURLOPT_POST, 1);
		curl_setopt($curl_handle, CURLOPT_POSTFIELDS, "");
		curl_setopt($curl_handle, CURLOPT_USERPWD, "$user:$pass");
		$buffer = curl_exec($curl_handle);
		$info = curl_getinfo($curl_handle);

	}

	return $buffer;
	
}

function get_twitter_user_info($user) {
	
	return file_get_contents("http://twitter.com/users/show/$user.json");
	
}

function get_user_tweets($user) {
	
	return file_get_contents("http://twitter.com/statuses/user_timeline/$user.json?count=10");
	
}

function check_twitter_user($user,$pass) {
	
		$url = 'http://twitter.com/account/verify_credentials.json';
		$curl_handle = curl_init();
		curl_setopt($curl_handle,CURLOPT_REFERER,"http://tagal.us/");
		curl_setopt($curl_handle, CURLOPT_URL, "$url");
		curl_setopt($curl_handle, CURLOPT_CONNECTTIMEOUT, 2);
		curl_setopt($curl_handle, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($curl_handle, CURLOPT_POST, 1);
		curl_setopt($curl_handle, CURLOPT_POSTFIELDS, "");
		curl_setopt($curl_handle, CURLOPT_USERPWD, "$user:$pass");
		$buffer = curl_exec($curl_handle);
		$info = curl_getinfo($curl_handle);

		if (curl_errno($curl_handle)) {
			//echo curl_error($curl_handle);
		}

		curl_close($curl_handle);


		if ($info['http_code'] != 200) {

			//echo $info['http_code']; echo $buffer;
			return false;

		}

		return true;

}

function send_dm($user,$pass,$tweet,$reply_to) {
	
	$url = 'http://twitter.com/direct_messages/new.json';
	
	$tweet = urlencode($tweet);
	
	if ($pass == "__USING_OAUTH") {
		$to =  $_SESSION['panels'][$user]->oauth;
		
		$content = $to->OAuthRequest($url, array( 'text' => $tweet, 'user' => $reply_to), 'POST');
		
		return $content;
		
	} else {
	
		$curl_handle = curl_init();
		curl_setopt($curl_handle, CURLOPT_URL, "$url");
		curl_setopt($curl_handle,CURLOPT_REFERER,"http://tagal.us/");
		curl_setopt($curl_handle, CURLOPT_CONNECTTIMEOUT, 2);
		curl_setopt($curl_handle, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($curl_handle, CURLOPT_POST, 1);
		curl_setopt($curl_handle, CURLOPT_POSTFIELDS,"text=$tweet&user=$reply_to");
		curl_setopt($curl_handle, CURLOPT_USERPWD, "$user:$pass");
		$buffer = curl_exec($curl_handle);
		$info = curl_getinfo($curl_handle);
	
		return $buffer;
		
	}
	
	
}

function send_tweet($user,$pass,$tweet,$reply_to) {
	
	$url = 'http://twitter.com/statuses/update.json';
	
	
	$post_fields =  "source=combotweet&status=$tweet";
	
	if ($reply_to != "0") {
		
		$post_fields .= "&in_reply_to_status_id=$reply_to";
		
	}
	
	if ($pass == "__USING_OAUTH") {
		$to =  $_SESSION['panels'][$user]->oauth;
		
		$post_fields_array = array();
		
		$post_fields_array['status'] = $tweet;
		
		if ($reply_to != "0") {
			
			$post_fields_array['in_reply_to_status_id'] = $reply_to;
			
		}
		
		$content = $to->OAuthRequest($url, $post_fields_array, 'POST');
		
		return $content;
		
	} else {
		
		$tweet = urlencode($tweet);
		
	
		$curl_handle = curl_init();
		curl_setopt($curl_handle, CURLOPT_URL, "$url");
		curl_setopt($curl_handle,CURLOPT_REFERER,"http://tagal.us/");
		curl_setopt($curl_handle, CURLOPT_CONNECTTIMEOUT, 2);
		curl_setopt($curl_handle, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($curl_handle, CURLOPT_POST, 1);
	

	
		curl_setopt($curl_handle, CURLOPT_POSTFIELDS,$post_fields);
		curl_setopt($curl_handle, CURLOPT_USERPWD, "$user:$pass");
		$buffer = curl_exec($curl_handle);
		$info = curl_getinfo($curl_handle);
	
		return $buffer;
		
	}
	
	
}

function get_last_update($user,$pass) {
	
	$url = 'http://twitter.com/statuses/user_timeline.json';
	
	if ($pass == "__USING_OAUTH") {
		$to =  $_SESSION['panels'][$user]->oauth;
		
		$content = $to->OAuthRequest($url, array(), 'POST');
		
		return $content;
		
	} else {
	
		$curl_handle = curl_init();
		curl_setopt($curl_handle, CURLOPT_URL, "$url");
		curl_setopt($curl_handle,CURLOPT_REFERER,"http://tagal.us/");
		curl_setopt($curl_handle, CURLOPT_CONNECTTIMEOUT, 2);
		curl_setopt($curl_handle, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($curl_handle, CURLOPT_POST, 1);
		curl_setopt($curl_handle, CURLOPT_POSTFIELDS, "count=1");
		curl_setopt($curl_handle, CURLOPT_USERPWD, "$user:$pass");
		$buffer = curl_exec($curl_handle);
		$info = curl_getinfo($curl_handle);
	
		return $buffer;	
	
	}
	
}

function get_search_tweets($tweet_type,$location,$location_dist, $page,$since) {
	
		$since_req = "&since_id=$since";
		
		if ($since == '-1') {
			
			$since_req = '';
			
		}
		
		
		if ($page != 1) {

			$since_req = '';

		}

		if (($tweet_type == 'location')) {
			
			if ($location == '') {
				
				return '';
				
			}
						
			$loc = $location . "%2C" . $location_dist;
			//echo "http://search.twitter.com/search.json?geocode=$loc&page=$page";
			return file_get_contents("http://search.twitter.com/search.json?geocode=$loc&page=$page$since_req");
		}
		
		$tweet_type = urlencode($tweet_type);
		
		return file_get_contents("http://search.twitter.com/search.json?rpp=20&q=$tweet_type&page=$page$since_req");
		
}


?>