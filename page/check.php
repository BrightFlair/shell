<?php
use App\DistanceCalculator;
use Gt\Dom\Document;
use Gt\Input\Input;
use Gt\Session\Session;

function do_check(Document $document, Session $session, Input $input):void {
	$fenceLatLon = $session->get("latLon");

	if($fenceLatLon) {
		$checkLatLon = [
			"lat" => $input->getString("latitude"),
			"lon" => $input->getString("longitude"),
		];

		$calc = new DistanceCalculator();
		$distance = $calc->getDistance($fenceLatLon, $checkLatLon);
	}
	else {
		$distance = 100_000;
	}

	$distance = number_format($distance);

	$document->querySelector("form")->remove();
	$document->querySelector("output")->textContent = $distance <= 100
		? "You are within the fence ($distance m)"
		: "You are NOT within a fence ($distance m)";
	$document->querySelector("main>p")->textContent = $session->getId();
}
