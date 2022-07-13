# Deliver server-rendered web apps via a native app shell

A bit complex, isn't it?

Documentation is almost always out of date and unreliable, which is why this page was created. If you run these commands on a brand new Linux machine, it all should just work.

```
npm install -g cordova
sudo apt install openjdk-11-jdk openjdk-11-jdk-headless gradle
# https://developer.android.com/studio -> command line tools only
cat << EOF >> ~/.bashrc
export ANDROID_HOME="\$HOME/Code/etc/android"
export ANDROID_SDK_ROOT="\$ANDROID_HOME"
export PATH="\$PATH:\$ANDROID_HOME/cmdline-tools/tools/bin"
export PATH="\$PATH:\$ANDROID_HOME/platform-tools"
export PATH="\$PATH:\$ANDROID_HOME/emulator"
EOF

sdkmanager --list
sdkmanager "build-tools;30.0.3" "platform-tools" "platforms;android-30" "system-images;android-30;default;x86_64"

sudo apt install android-sdk-platform-tools-common
sudo usermod -aG plugdev $LOGNAME

# REBOOT, then you're ready!

# Plug in physical Android device, then:
adb devices
adb uninstall "com.yourpackage"
cordova run android

# For emulation, make sure you have virtualisation enabled in BIOS, then...
avdmanager create avd --name android30 --package "system-images;android-30;default;x86_64"
emulator @android30
cordova run --emulator android
```
This sorts out android. iOS hasn't quite been sorted out yet.

## Localhost compatability
Once you have a local server, you'll need to adjust the android app a bit in order for it correctly `iframe` the localhost site. There are some permission errors when loading cross-origin sites in iframes, and here's how to fix them for localhost.

In `.../shell/platforms/android/app/src/main/res/xml`, add a new file called `network_security_config.xml`. The contents of that should be as follows:
```
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">localhost</domain>
    </domain-config>
</network-security-config>
```
**Note:** replace `localhost` with whatever the site name may be. It is possible that, come deploymnet, this should be replaced with the deployment URL.

And then, in `...shell/platforms/android/app/src/main/AndroidManifest.xml`, add the following to the `<application...` attribute:
`...android:networkSecurityConfig="@xml/network_security_config">`.

# Notifications and Geolocation
Notifications communicate from iframe to parents through `.postMessage()` functionality. Take the following code that might be hosted within the `iframe`-d site:
```
document.getElementById("geofence").addEventListener("click", function() {
	var data = {
		"type": "notification",
		"subtype": "geofence",
		"payload": {
			"title": "You have arrived",
			"subtitle": "Welcome! Click on me to see where to queue and where facilities are located.",
			"boundaries": {
				0: {
					"latitude": 52.92163108039056,
					"longitude": -1.4767838875066355,
					"radius": 0.001, // around 40-50 metres
				},
			}
		},
	}
	parent.postMessage(data, "*");
});
```
This message is seen by the parent with an event listener, listening for the "message" event. The below is a piece of code hosted in the `parent` window that can "hear" this message and deal with the notification accordingly:
```
window.addEventListener('message', e => {
    var key = e.message ? "message" : "data"; // find out if posteMessage is message or data
    var data = e[key];
    var origin = e.origin;

    // Need to assess origin rule out cross-site scripting attacks
    if (origin !== [expected origin point])  {
        return;
    }

    // what to do with different message types
    if (data.type == "notification") {
        if (data.subtype == "geofence") { // create a notification to be triggered when the user enters a physical area
            // [geofence notification code goes here]
        }
    }
});
```
This back and forth is required as JavaScript data cannot be passed directly from frame to parent. The parent (Cordova in this case) is the only place that can create device notifications, so it would not be appropriate to try and create these from the `iframe`-d window.

This structure can support multiple types of notification and more general data transfer. The reader can see more examples of how this structure is used in the [www/js/index.js](hhttps://github.com/BrightFlair/shell/www/js/index.js) file.
