// Wait for the deviceready event before using any of Cordova's device APIs.

// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    // Cordova is now initialized. Have fun!

    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    //navigator.geolocation.watchPosition(checkPos); // this begins the Roundhouse location functionality


    // Configure plugin parameters
    BackgroundGeolocation.configure({
        HighAccuracy: 1, // bool
        DistanceFilter: 1, // how large is the location "deadzone"
        stationaryRadius: 1, // What counts as stationary?
        NotificationTitle: "Background tracking", // Notification that shows while tracking is enabled
        NotificationText: "enabled",
        debug: true,
    });

    // When a location change is detected (with respect to DistanceFilter and stationaryRadius)
    BackgroundGeolocation.on('location', function(location) {
        console.log(location); // TODO: remove this - it is for debug purposes
        checkLocations(location); // check update location against stored trigger locations


        // to perform long running operation on iOS with this plugn...
        // ...you need to create background task
        //BackgroundGeolocation.startTask(function(taskKey) {
          // execute long running task
          // eg. ajax post location
          // IMPORTANT: task has to be ended by endTask
          //BackgroundGeolocation.endTask(taskKey);
        //});
    });

}

// checks if pos is outside the Roundhouse and calls visual feedback function
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

// returns distance between two coordinates in degrees
function getEuclidDistance(current, target) {
    let lat_distance  = Math.abs(current.latitude - target.latitude);
    let long_distance = Math.abs(current.longitude - target.longitude);
    let sqr_distance = Math.pow(lat_distance, 2) + Math.pow(long_distance, 2)
    let distance = Math.sqrt(sqr_distance);
    return distance;
}

// Demonstrates locally-managed foreground geolocation feedback
function setRoundHouse(areWeThere) {
    let form = document.querySelector("body>form");
    if(areWeThere) {
        form.classList.add("fenced");
    }
    else {
        form.classList.remove("fenced");
    }
}

function checkLocations(position) {
    // we may have a long list of registered location triggers, each of a different type.
    var boundaries = globalThis.data.payload.boundaries; // retreieve all trigger boundaries
    const length = Object.keys(boundaries).length; // get total amount of boundaries

    let distance;
    for (var i = 0; i < length; i++) { // for each trigger boundary...
        // check geofence
        distance = getEuclidDistance(position, boundaries[i]);
        if (distance < boundaries[i].radius) { // if inside radius
            cordova.plugins.notification.local.schedule({ // create notification
                title: globalThis.data.payload.title,
                text: globalThis.data.payload.subtitle,
                foreground: true
            });
            break;
        }
    }
}


// Listen to message from child window
window.addEventListener('message', e => {
    var key = e.message ? "message" : "data"; // find out if posteMessage is message or data
    var data = e[key];
    var origin = e.origin;

    // Need to assess origin rule out cross-site scripting attacks
    if (origin !== "http://localhost:8080")  { // TODO: replace with expected origin point (pwa.g105b.com)
        return;
    }

    // what to do with different message types
    if (data.type == "notification") {
        if (data.subtype == "now") { // Create a notification right now
            cordova.plugins.notification.local.schedule({
                title: data.payload.title,
                text: data.payload.subtitle,
                foreground: true
            });
        } else if (data.subtype == "geofence") { // create a notification to be triggered when the user enters a physical area
            globalThis.data = data; // save notification data in globally accessible place
            BackgroundGeolocation.start(); // begin location checking
            // when location updates
                // location check
                    // notification
        } else if (data.subtype == "timed") { // schedule a notification for a spcific time
            cordova.plugins.notification.local.schedule({
                title: data.payload.title,
                text: data.payload.subtitle,
                trigger: {at: new Date(
                    data.payload.year,
                    data.payload.month,
                    data.payload.day,
                    data.payload.hour,
                    data.payload.minute,
                    //data.payload.second
                )}
            });
        }
    } else if (data.type == "debug") { // debugging features
        if (data.subtype == "geolocation") {
            //navigator.geolocation.getCurrentPosition(PositionSuccess, PositionError, {timeout: 5000});
        }
    }
});



