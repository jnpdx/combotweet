<?php


function get_shizzow_shouts($user,$pass) {
	
	$url = "https://v0.api.shizzow.com/shouts?who=listening&limit=20";

	    $curl = curl_init($url);
	    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
	    curl_setopt($curl, CURLOPT_CUSTOMREQUEST, 'GET');
	    curl_setopt($curl, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
	    curl_setopt($curl, CURLOPT_USERPWD, "$user:$pass");
	    $curl_response = curl_exec($curl);
	    curl_close($curl);

	    return $curl_response;
	
}

function get_shizzow_favorites($user,$pass) {
	
	$url = "https://v0.api.shizzow.com/people/$user/places/?favorites=true&limit=50";

	    $curl = curl_init($url);
	    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
	    curl_setopt($curl, CURLOPT_CUSTOMREQUEST, 'GET');
	    curl_setopt($curl, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
	    curl_setopt($curl, CURLOPT_USERPWD, "$user:$pass");
	    $curl_response = curl_exec($curl);
	    curl_close($curl);

	    return $curl_response;
	
}

function send_shout($user,$pass,$shout,$location) {
	
	$url = "https://v0.api.shizzow.com/places/$location/shout";

	    $curl = curl_init($url);
	    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
	    curl_setopt($curl, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
	    curl_setopt($curl, CURLOPT_USERPWD, "$user:$pass");

	    clearstatcache();
	    $putString = "shouts_message=$shout";
	    $putData = tmpfile();
	    fwrite($putData, $putString);
	    fseek($putData, 0);
	    curl_setopt($curl, CURLOPT_PUT, true);
	    curl_setopt($curl, CURLOPT_INFILE, $putData);
	    curl_setopt($curl, CURLOPT_INFILESIZE, strlen($putString));

		$curl_response = curl_exec($curl);
	    curl_close($curl);

	    return $curl_response;
		
}




?>