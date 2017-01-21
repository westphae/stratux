+++
date = "2017-01-18T16:40:25-05:00"
draft = false
title = "My Plan for AHRS Development"
weight = 1
+++

I've been working on AHRS for about 9 months now.
My original approach was to use an Extended Kalman Filter.
This proved to be a bit more difficult than I'd expected!

In order to get something working and build a framework to integrate it into the Stratux code, I instead took an approach I call the "SimpleAHRS" algorithm.
Like @AvSquirrel's "GPS-only" approach, its foundation is an attitude estimate based on GPS.
Then the sensors are used to "tweak" the calculated attitude.
This allows it to respond to changes in attitude in realtime and to account somewhat for uncoordinated maneuvers.
However, it does still have a few deficiencies.
Mainly, it cannot get pitch quite right.
Also, uncoordinated maneuvers that persist for more than a few seconds will begin to display incorrectly.

A true AHRS system should be based on a Kalman filter (or derivative) fusion of sensors:
* Gyros
* Accelerations
* Magnetometer
* GPS

Even better is ADAHARS: Air Data And Heading Reference System.  This would also incorporate:
* Airspeed
* Barometer

The current approach uses GPS, gyro and barometer.
The next iteration will use GPS, gyro, accelerometer, barometer, and possibly magnetometer.

Mathematical details of the algorithms, simulations, etc. are or will be available in the documentation for https://github.com/westphae/goflying.