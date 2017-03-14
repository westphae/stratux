+++
date = "2017-02-18T21:19:59-05:00"
title = "Release Notes"
draft = false

+++

## Issues
For issues, see the GitHub [issues](https://github.com/westphae/stratux/issues) page.

{{< note title="FIRST THING TO DO IF YOU HAVE AN ISSUE WITH AN UPGRADE" >}}
As the AHRS software is in beta, the web UI undergoes a lot of changes with every release.
If something seems wrong when you first connect after upgrading, **the first thing to do is a hard refresh of the webpage.**
There is a button on the Developer page to do this if you don't know how to do it in your browser.
{{</note>}}


## ahrs0.4
### Mar 13, 2017
The fourth beta release, [ahrs0.4](https://github.com/westphae/stratux/releases/download/ahrs0.4/stratux-ahrs0.4-adfa54813a.img.zip), is available on the https://github.com/westphae/stratux releases page.
An [update.sh](https://github.com/westphae/stratux/releases/download/ahrs0.4/update-stratux-ahrs0.4-ef8064c09f.sh) file is also available.
This release uses the "SimpleAHRS" algorithm.

Changes:

1. Sensor orientation now completes when sensors are mounted in any orientation.
Previously when sensors were mounted "upside down" relative to my prototype board the orientation was rejected.
2. Only one cage process at a time is allowed.
Previously if a user pressed "Cage" a second time while the algorithm was still calibrating from the first press,
a second calibration would take place immediately, making it seem like it would never complete.
3. AHRS status lights were added to show whether the AHRS algorithm is using GPS, Attitude sensors (MPU9250), and/or
Altitude sensors (BMP280), and whether it is currently Calibrating and/or Logging (which can eat up disk space quickly).
It is especially important for the user to be able to see the calibration process occurring, so that it is apparent why the AI isn't responding.
4. A G Meter is shown on the GPS/AHRS page.
5. Magnetic Heading, Turn Rate, Slip/Skid Angle, and G Load are shown in text on the GPS/AHRS page.
Magnetic Heading will not be useful until the magnetometer is calibrated.
I may add an auto-calibration routine to a future release so that it will self-calibrate over the course of several flights, and/or add a manual calibration routine.
6. The slip/skid rectangle on the attitude indicator works now.
For now, it will only indicate correctly if the sensor is level in coordinated flight.
In the future, auto-calibration will do this for you automatically.
7. A few labels were changed in the UI to make meanings clearer to the casual user.
8. Deeper changes were made to the MPU9250 driver to improve its efficiency.
One of these changes involved removing a rudimentary accelerometer calibration.
As a result, **when on the desktop, the AHRS will not quite indicate level--it will indicate the actual orientation of the sensor.**
Even fairly rigidly mounted boards may indicate a degree or two of pitch or bank when sitting on a level desk.
For now, you can regard this as an assist in manually leveling your stratux on your glareshield.
An upcoming release will include a proper calibration, which is necessary to provide better pitch estimation.

## ahrs0.3
### Mar 6, 2017
The third beta release, [ahrs0.3](https://github.com/westphae/stratux/releases/download/ahrs0.3/stratux-ahrs0.3-e78146ab99.img.zip), is available on the https://github.com/westphae/stratux releases page.
This release uses the "SimpleAHRS" algorithm.

Changes:

1. Fixed a tendency to display an overbank, especially at higher bank angles.  This was caused by smoothing the turn rate rather than smoothing the roll.  Turn rate noise is highly non-normal, so the fat tails led to a skewed ewma.
2. Various UI changes:
  * Separate switches to turn on/off the IMU (attitude) and BMP (altitude) sensors.  This is mostly useful for pressurized aircraft.
  * A switch to turn off csv logging of the AHRS data.
  * The orientation dialog was unusable on small (phone) screens since it overflowed, so most of the text was moved to the help page.
3. Better initialization routines, so that glareshield vibration or turbulence won't prevent initialization.
4. Refactoring of various interfaces within the Go code.

## ahrs0.2
### Feb 22, 2017
The second beta release, [ahrs0.2](https://github.com/westphae/stratux/releases/download/ahrs0.2/stratux-ahrs0.2-34396a36e5.img.zip), is available on the https://github.com/westphae/stratux releases page.
This release uses the "SimpleAHRS" algorithm.

Changes:

1. Fixed an issue where if the Sensors switch were on and no BMP280 were attached, gen_gdl90 would panic.
2. Fixed a panic in network.go due to concurrent reading/writing of a map.


## ahrs0.1
### Feb 17, 2017
The initial beta release, [ahrs0.1](https://github.com/westphae/stratux/releases/download/ahrs0.1/stratux-ahrs0.1-2ba3f136bb.img.zip), is available on the https://github.com/westphae/stratux releases page.
This release uses the "SimpleAHRS" algorithm.
In essence, it calculates the turn rate based on GPS, then applies corrections using the MPU-9250 gyro sensors.
This allows it to respond to attitude changes much more quickly than GPS alone can, and also to indicate uncoordinated maneuvers.
The algorithm doesn't use a Kalman filter.
