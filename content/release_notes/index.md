+++
date = "2017-02-18T21:19:59-05:00"
title = "Release Notes"
draft = false

+++

## Issues
For issues, see the GitHub [issues](https://github.com/westphae/stratux/issues) page.


## ahrs0.2
### Feb 22, 2017
The second beta release, [ahrs0.2](https://github.com/westphae/stratux/releases/download/ahrs0.2/stratux-ahrs0.2-34396a36e5.img.zip), is available on the https://github.com/westphae/stratux releases page.
This release uses the "SimpleAHRS" algorithm.
In essence, it calculates the turn rate based on GPS, then applies corrections using the MPU-9250 gyro sensors.
This allows it to respond to attitude changes much more quickly than GPS alone can, and also to indicate uncoordinated maneuvers.
The algorithm doesn't use a Kalman filter.

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
