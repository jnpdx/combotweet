<?php

require_once 'db_login.php';

load_combotweet_db();

function load_combotweet_db() {
	global $combotweet_db, $db_user, $db_pass, $db_host, $db_name;
	$combotweet_db = mysql_connect($db_host, $db_user, $db_pass);
	$db_selected = mysql_select_db($db_name,$combotweet_db);
	
	if (!$db_selected) {
    	die ('Can\'t use db : ' . mysql_error());
	}
	
}

function retrieve_user_data($identity_url) {
	
	global $combotweet_db;
	
	
	$query = "SELECT * FROM users WHERE identity_url = '$identity_url'";
	
	$result = mysql_query($query,$combotweet_db);
	
	$row = mysql_fetch_assoc($result);
	
	if ($row == null) {
		
		$query = "INSERT INTO users (identity_url,state) values ('$identity_url','')";
		
		$result = mysql_query($query,$combotweet_db);
		
		return '';
		
		
	}
	
	return $row;
	
}


function save_user($identity_url,$data) {
	
	global $combotweet_db;
	
	$data = mysql_real_escape_string($data);
	
	$query = "SELECT * FROM users WHERE identity_url = '$identity_url'";
	
	$result = mysql_query($query,$combotweet_db);
	
	$row = mysql_fetch_assoc($result);
	
	//echo "Row: ".$row;
	
	if ($row == null) {
		
		$query = "INSERT INTO users (identity_url,state) values ('$identity_url','$data')";
		
	} else {
		
		$query = "UPDATE users SET state='$data' WHERE identity_url='$identity_url'";
		
	}
	
	//echo "Query: $query";
	
	$result = mysql_query($query,$combotweet_db);
	
}


?>