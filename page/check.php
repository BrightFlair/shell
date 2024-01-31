<?php
use App\DistanceCalculator;
use Gt\Dom\Document;
use Gt\Input\Input;
use Gt\Session\Session;

function do_check(Document $document, Session $session, Input $input):void {
	$fenceLatLon = $session->get("latLon");

	$within = true;
	if($fenceLatLon) {
		$checkLatLon = [
			"lat" => $input->getString("latitude"),
			"lon" => $input->getString("longitude"),
		];

		$calc = new DistanceCalculator();
		if($calc->getDistance($fenceLatLon, $checkLatLon) > 200) {
			$within = false;
		}
	}
	else {
		$within = false;
	}

	$document->querySelector("form")->remove();
	$document->querySelector("output")->textContent = $within
		? "You are within the fence"
		: "You are NOT within a fence";
	$document->querySelector("main>p")->textContent = $session->getId();
}
