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
