<?php


class Panel {
	
	public $user, $pass, $id, $gen_info,$panel_type;
	public $oauth;
	
	public function __construct() {
		$this->panel_type = "regular";
	}
	
}


?>