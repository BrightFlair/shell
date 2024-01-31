<?php
namespace App;

class DistanceCalculator {
	public function getDistance(mixed $latLonA, array $latLonB):float {
		$theta = $latLonA['lon'] - $latLonB['lon'];
		$dist = sin(deg2rad($latLonA['lat'])) * sin(deg2rad($latLonB['lat']))
			+ cos(deg2rad($latLonA['lat'])) * cos(deg2rad($latLonB['lat'])) * cos(deg2rad($theta));
		$dist = acos($dist);
		$dist = rad2deg($dist);
		return $dist * 90_000;
	}
}
