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
    // console.log("notify");
    // setTimeout(function() {
    //     cordova.plugins.notification.local.schedule({
    //         title: 'This is a test notification',
    //         text: 'It even works if you begin the timer and leave the app!',
    //         foreground: true
    //     });
    // }, 3000);

    // using notifications api
    //Notification.requestPermission();
});

var permissions = cordova.plugins.permissions;
permissions.requestPermission(permissions.ACCESS_FINE_LOCATION);


// Listen to message from child window
window.addEventListener('message', e => {
    var key = e.message ? "message" : "data";
    var data = e[key];
    var origin = e.origin;

    // Need to assess origin rule out cross-site scripting attacks
    if (origin !== "https://localhost")  { /////////////////// replace withe xpected origin point (pwa.g105b.com)
        return;
    }

    console.log(key);
    console.log(data);
    if (data.trigger == "now") {
        cordova.plugins.notification.local.schedule({
            title: data.title,
            text: data.subtitle,
            foreground: true
        });
    } else if (data.trigger == "geofence") {
        cordova.plugins.notification.local.schedule({
            title: data.title,
            trigger: {
                type: 'location',
                center: [data.lat, data.long],
                radius: data.radius,
                notifyOnEntry: true
            }
        });
    }
});

