// Wait for the deviceready event before using any of Cordova's device APIs.

// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener('deviceready', onDeviceReady, false);

let bgLocationServices;

function onDeviceReady() {
    // Cordova is now initialized. Have fun!

    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    //navigator.geolocation.watchPosition(checkPos);

    BackgroundGeolocation.configure({
        HighAccuracy: 1,
        DistanceFilter: 1,
        mockLocationsEnabled: true,
        NotificationTitle: "Background tracking",
        NotificationText: "enabled",
        debug: true,
        url: "http://localhost/notification.html",
        postTemplate: {
            lat: '@latitude',
            long: '@longitude',
        }

    });

    BackgroundGeolocation.start();

    BackgroundGeolocation.on('location', function(location) {
        console.log(location);
        // handle your locations here
        // to perform long running operation on iOS
        // you need to create background task
        //BackgroundGeolocation.startTask(function(taskKey) {
          // execute long running task
          // eg. ajax post location
          // IMPORTANT: task has to be ended by endTask
          //BackgroundGeolocation.endTask(taskKey);
        //});
    });

}



function checkPos(pos) {
    const crd = pos.coords;

    var target = {
        "latitude": 52.916451, // roundhouse
        "longitude": -1.461599
    }
    var radius = 0.0005 // 0.0005 around 20 metres or so in the uk

    var distance = getEuclidDistance(crd, target);

    setRoundHouse(distance <= radius);
}

function getEuclidDistance(current, target) {
    let lat_distance  = Math.abs(current.latitude - target.latitude);
    let long_distance = Math.abs(current.longitude - target.longitude);
    let sqr_distance = Math.pow(lat_distance, 2) + Math.pow(long_distance, 2)
    let distance = Math.sqrt(sqr_distance);
    return distance;
}

function notificationDismissed() {
    // nothing yet
}


function setRoundHouse(areWeThere) {
    let form = document.querySelector("body>form");
    if(areWeThere) {
        form.classList.add("fenced");
    }
    else {
        form.classList.remove("fenced");
    }
}

function checkLocations(pos) {
    const crd = pos.coords;

    // we may have a long list of registered location triggers, each of a different type.
    // For now, let's assume there is a single registered location trigger (they only have one concert that day)
    var boundaries = globalThis.data.payload.boundaries;
    const length = Object.keys(boundaries).length;

    let distance;
    for (var i = 0; i < length; i++) {
        // check geofence
        var trigger = boundaries[i];
        distance = getEuclidDistance(crd, trigger);
        if (distance < trigger.radius) {
            cordova.plugins.notification.local.schedule({
                title: globalThis.data.payload.title,
                text: globalThis.data.payload.subtitle,
                foreground: true
            });
        }
    }
}


// Listen to message from child window
window.addEventListener('message', e => {
    var key = e.message ? "message" : "data";
    var data = e[key];
    var origin = e.origin;

    // Need to assess origin rule out cross-site scripting attacks
    if (origin !== "http://localhost:8080")  { /////////////////// replace with expected origin point (pwa.g105b.com)
        return;
    }

    if (data.type == "notification") {
        if (data.subtype == "now") {
            cordova.plugins.notification.local.schedule({
                title: data.title,
                text: data.subtitle,
                foreground: true
            });
        } else if (data.subtype == "geofence") {
            globalThis.data = data;
            // when location updates
                // location check
                    // notification
        } else if (data.subtype == "timed") {
            cordova.plugins.notification.local.schedule({
                title: data.payload.title,
                text: data.payload.subtitle,
                trigger: {at: new Date(
                    data.payload.year,
                    data.payload.month,
                    data.payload.day,
                    data.payload.hour,
                    data.payload.minute
                )}
            });
        }
    } else if (data.type == "debug") {
        if (data.subtype == "geolocation") {
            navigator.geolocation.getCurrentPosition(PositionSuccess, PositionError, {timeout: 5000});
        }
    }
});



