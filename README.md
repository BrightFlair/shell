# shell

A bit complex, isn't it?

Documentation is almost always out of date and unreliable, which is why this document exists. This *should* provide the reader with a more reliable way of getting Cordova set up to build and run android (and soon iOS) apps.

(This guide)[https://cordova.apache.org/docs/en/latest/guide/platforms/android/index.html#requirements-and-support] is quite appropriate to follow up to the *Project Configuration* section.

After completing that part of the guide, you will need to install android pakages. Full setup has been completed on Linux with only the following SDK-related packes installed:
- build-tools 30.0.3
- platform 29
- platform 30
- platform 31

ANDROID_HOME and ANDROID_SDK_ROOT were set to the same location, as there was no `.../Android/Sdk` folder on the Linux install.

On Windows, `ANDROID_SDK_ROOT` was set to `C:\Users\[username]\AppData\Local\Android\Sdk` which is the default install location. No `ANDROID_HOME` was set. The following SDK-related packages were installed:
- build-tools;28.0.3
- build-tools;29.0.3
- build-tools;30.0.0
- build-tools;30.0.3
- build-tools;33.0.0
- platform-tools (version 33.0.2)
- platforms;android-28
- platforms;android-29
- platforms;android-30
- platforms;android-32
- sources;android-29
- system-images;android-29google_apis;x86

You may not need all of these, you may only need two specific packages - one from `build-tools` and one from `platforms`, but the Linux list is a better indication of what you need installed.

TODO: remove suspected unnecessary packages from the windows platform and stop when it doesn't work. Identify from the big windows list what is *actually* needed.

You should then be able to run `cordova add android`, `cordova build android`, and then `cordova run android`. You will need an android device connected with debugging authorisation in order to use the `run` command, or you can set up an emulator with Android Studio. Getting an emulator set up with Android Studio is not complicated and there are many thorough guides for it. Make sure the emulator is running and then us `cordova run android --emulator` to use it. 

There may be some permission errors on Linux. Error codes are fairly self-descriptive but searching for the `plugdev` and the `udev` keywords should yeild some answers. You may need to log out/reboot.

At this point, your app should be showing on your android device.