<?php
use Gt\DomTemplate\Binder;
use Gt\Input\Input;
use Gt\Session\Session;

function go(Binder $binder, Session $session):void {
	$binder->bindKeyValue("userId", $session->getId());
	if($latLon = $session->get("latLon")) {
		$binder->bindKeyValue("pinLonLat", implode(":", [
			$latLon["lon"],
			$latLon["lat"],
		]));
	}
}

function do_set_pin(Input $input, Session $session):void {
	$session->set("latLon", [
		"lat" => $input->getString("latitude"),
		"lon" => $input->getString("longitude"),
	]);
}

function do_clear_pin(Session $session):void {
	$session->remove("latLon");
}
