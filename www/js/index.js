// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    // Cordova is now initialized. Have fun!

    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    

}

function notificationDismissed() {
    // nothing yet
}



document.getElementById("debug1").addEventListener("click", function() {
    navigator.geolocation.getCurrentPosition(PositionSuccess, PositionError, {timeout: 5000});
});

function PositionSuccess(position) {
    console.log(position);
}

function PositionError(error) {
    console.log(error);
}

// var permissions = cordova.plugins.permissions;
// permissions.requestPermission(permissions.ACCESS_FINE_LOCATION);


// Listen to message from child window
window.addEventListener('message', e => {
    var key = e.message ? "message" : "data";
    var data = e[key];
    var origin = e.origin;

    // Need to assess origin rule out cross-site scripting attacks
    if (origin !== "http://localhost:8080")  { /////////////////// replace with expected origin point (pwa.g105b.com)
        return;
    }

    console.log(key);
    console.log(data);
    if (data.type == "notification") {
        if (data.subtype == "now") {
            cordova.plugins.notification.local.schedule({
                title: data.title,
                text: data.subtitle,
                foreground: true
            });
        } else if (data.subtype == "geofence") {
            cordova.plugins.notification.local.schedule({
                title: data.title,
                trigger: {
                    type: 'location',
                    center: [data.lat, data.long],
                    radius: data.radius,
                    notifyOnEntry: true
                }
            });
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

