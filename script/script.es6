import Feature from 'ol/Feature.js';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style.js';
import {OSM, Vector as VectorSource} from 'ol/source.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import {Circle, Geometry, Point, SimpleGeometry} from "ol/geom";
import {useGeographic} from 'ol/proj.js';

window.location.pathname === "/" && (function() {
	const form = document.forms[0];
	const latEl = form["latitude"];
	const lonEl = form["longitude"];
	const accuracyEl = form["accuracy"];
	let map = null;
	let lastKnownPosition = null;
	let view = null;
	let positionFeature = null;
	let accuracyFeature = null;
	let pinFeature = null;

	document.querySelector("#send-notification").addEventListener("click", clickNotificationButton)
	document.querySelector("#start-gps").addEventListener("click", clickGpsButton)

	document.querySelector("#start-gps").click();

	function clickNotificationButton(e) {
		e.preventDefault();
		if(Notification.permission === "granted") {
			sendNotification();
		}
		else {
			Notification.requestPermission().then(permission => {
				if(permission === "granted") {
					sendNotification();
				}
			});
		}
	}

	function clickGpsButton(e) {
		e.preventDefault();
		getPosition();
	}

	function sendNotification() {
		let lat = latEl.value;
		let lon = lonEl.value;
		new Notification(`Your location is: ${lat} : ${lon}`);
	}

	function getPosition() {
		let options = {
			maximumAge: 1000,
			enableHighAccuracy: true,
		};

		navigator.geolocation.getCurrentPosition(updatePosition, error => {
			console.log("Error getting position:", error);
		}, options);
	}

	function updatePosition(position) {
		lastKnownPosition = position;

		if(!map) {
			createMap();
		}
		latEl.value = position.coords.latitude;
		lonEl.value = position.coords.longitude;
		accuracyEl.value = position.coords.accuracy;

		let coords = [position.coords.longitude, position.coords.latitude];
		view.setCenter(coords);
		positionFeature.setGeometry(new Point(coords));
		accuracyFeature.setGeometry(new Circle(coords, position.coords.accuracy / (111.325 * 1000)));
		let featureExtent = accuracyFeature.getGeometry().getExtent();
		view.fit(featureExtent, {size: map.getSize()});

		setTimeout(getPosition, 1000);
	}

	function createMap() {
		useGeographic();
		view = new View({
			center: [lastKnownPosition.coords.latitude, lastKnownPosition.coords.longitude],
			zoom: 2,
			maxZoom: 17
		});

		let mapContainer = document.getElementById("map");
		mapContainer.innerHTML = "";

		map = new Map({
			layers: [
				new TileLayer({
					source: new OSM(),
				}),
			],
			interactions: [],
			target: mapContainer,
			view: view,
		});

		positionFeature = new Feature();
		positionFeature.setStyle(
			new Style({
				image: new CircleStyle({
					radius: 6,
					fill: new Fill({
						color: '#3399CC',
					}),
					stroke: new Stroke({
						color: '#fff',
						width: 2,
					}),
				}),
			})
		);

		accuracyFeature = new Feature();

		let features = [positionFeature, accuracyFeature];

		if(mapContainer.dataset.pin) {
			pinFeature = new Feature();
			features.push(pinFeature);
			pinFeature.setStyle(
				new Style({
					fill: new Fill({
						color: '#ff000033',
					}),
					stroke: new Stroke({
						color: '#ff0000',
						width: 2,
					}),
				})
			);
			let coords = mapContainer.dataset.pin.split(":").map(Number);
			pinFeature.setGeometry(new Circle(coords, 200 / (111325)));
		}

		let vectorLayer = new VectorLayer({
			source: new VectorSource({
				features: features,
			}),
		});
		console.log(features);
		map.addLayer(vectorLayer);
	}
})();
