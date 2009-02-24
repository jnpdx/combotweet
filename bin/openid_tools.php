<?php



ini_set("include_path",dirname(__FILE__).'/../library/');

include "Zend/OpenId/Consumer.php";
include "Zend/OpenId/Extension/Sreg.php";

$logged_in = do_login();

if ($logged_in == true) {
	
	if (!isset($_SESSION)) {
		session_start();
		//echo 'starting session';	
	}
	
	header("Location: ".$_SESSION['client_url']);
	exit;
	
} else {
	
	echo "Error! ".$logged_in;
	
}

function do_login() {

		$status = "";
		if ( //isset($_POST['openid_action']) &&
		    //$_POST['openid_action'] == "login" &&
		    !empty($_POST['openid_identifier'])) {

				$sreg = new Zend_OpenId_Extension_Sreg(array(
				    'nickname'=>false,
				    'email'=>false,
				    'fullname'=>false), null, 1.1);

		    $consumer = new Zend_OpenId_Consumer();
		    if (!$consumer->login($_POST['openid_identifier'],'',null,$sreg)) {
		        $status = "FAILED";
		    }
		} else if (isset($_GET['openid_mode'])) {
		    if ($_GET['openid_mode'] == "id_res") {
		        $consumer = new Zend_OpenId_Consumer();
		
				$sreg = new Zend_OpenId_Extension_Sreg(array(
				    'nickname'=>false,
				    'email'=>false,
				    'fullname'=>false), null, 1.1);
		
		        if ($consumer->verify($_GET, $id,$sreg)) {
								$_SESSION['logged_in_user'] = true;
		            $status = true;
		
		
								$open_id_addr = $_GET['openid_identity'];
		
								if (strpos($open_id_addr,'https') === 1)
									$open_id_addr = str_replace('https','http',$open_id_addr);
		
								//$_SESSION['user_info'] = array();
		
								//$_SESSION['user_info']['open_id'] = $_GET['openid_identity'];
		
							/*
								$data = $sreg->getProperties();
							    if (isset($data['nickname'])) {
							        $status .= "<br>nickname: " . htmlspecialchars($data['nickname']) . "<br>\n";
									$_SESSION['user_info']['nickname'] = htmlspecialchars($data['nickname']);
							    }
							    if (isset($data['email'])) {
							        $status .= "email: " . htmlspecialchars($data['email']) . "<br>\n";
									$_SESSION['user_info']['email'] = htmlspecialchars($data['email']);
				
							    }
							    if (isset($data['fullname'])) {
							        $status .= "fullname: " . htmlspecialchars($data['fullname']) . "<br>\n";
									$_SESSION['user_info']['fullname'] = htmlspecialchars($data['fullname']);
				
							    }
							*/
		
					
					
							login_user($open_id_addr);
					
		
		        } else {
		            $status = "INVALID " . htmlspecialchars($id);
						}
		    } else if ($_GET['openid_mode'] == "cancel") {
		        $status = "CANCELED";
		    }
		}		
		
		return $status;	
		
}


function login_user($openid) {
	
	require_once 'db/db_functions.php';
	
	
	$_SESSION['user_openid'] = $openid;
	
	$data = retrieve_user_data($openid);
	
	if ($data != '') {
	
		$data = unserialize($data['state']);
		$_SESSION['panels'] = $data['panels'];
		
	}
	
}


?>