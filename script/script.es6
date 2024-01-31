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
	let mapContainer = document.getElementById("map");
	let map = null;
	let lastKnownPosition = null;
	let view = null;
	let positionFeature = null;
	let accuracyFeature = null;
	let pinFeature = null;
	const parser = new DOMParser();

	document.querySelector("#send-notification").addEventListener("click", clickNotificationButton);
	document.querySelector("#start-gps").addEventListener("click", clickGpsButton);
	document.querySelector("[name=do][value=check]").addEventListener("click", clickCheckButton);

	document.querySelector("#start-gps").click();

	if(mapContainer.dataset.pin) {
		setTimeout(checkFence, 1000);
	}

	function checkFence() {
		let formData = new FormData(form);
		formData.set("do", "check");
		let url = new URL(location);
		url.pathname = "/check/";
		url.search = (new URLSearchParams(formData)).toString();
		fetch(url, {
			credentials: "same-origin"
		}).then(response => response.text())
		.then(html => {
			let newDocument = parser.parseFromString(html, "text/html");
			let message = newDocument.querySelector("output").textContent;
			if(message.includes("NOT")) {
				sendNotification(message);
			}
			else {
				setTimeout(checkFence, 1000);
			}
		});
	}

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

	function clickCheckButton(e) {
		e.preventDefault();
		let url = new URL(location);
		url.pathname = "/check/";
		let formData = new FormData(form);
		formData.set("do", "check");
		url.search = (new URLSearchParams(formData)).toString();
		fetch(url, {
			credentials: "same-origin"
		}).then(response => response.text()).then(html => {
			let newDocument = parser.parseFromString(html, "text/html");
			let outputEl = newDocument.querySelector("output");
			alert(outputEl.innerText);
		})
	}

	function sendNotification(message = null) {
		let lat = latEl.value;
		let lon = lonEl.value;
		if(!message) {
			message = `Your location is: ${lat} : ${lon}`;
		}
		new Notification(message);
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

window.location.pathname === "/check/" && (function() {
	document.getElementById("load-location").addEventListener("click", clickLoadLocationButton);

	function clickLoadLocationButton(e) {
		e.preventDefault();
		let options = {
			maximumAge: 1000,
			enableHighAccuracy: true,
		};

		navigator.geolocation.getCurrentPosition(updatePosition, error => {
			console.log("Error getting position:", error);
		}, options);
	}

	function updatePosition(position) {
		let form = document.forms[0];
		form["latitude"].value = position.coords.latitude;
		form["longitude"].value = position.coords.longitude;
	}
})();
