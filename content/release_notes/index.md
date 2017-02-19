+++
date = "2017-02-18T21:19:59-05:00"
title = "Release Notes"
draft = false

+++

## ahrs0.1
The initial beta release, [ahrs0.1](https://github.com/westphae/stratux/releases/download/ahrs0.1/stratux-ahrs0.1-2ba3f136bb.img.zip), is available on the https://github.com/westphae/stratux releases page.
This release uses the "SimpleAHRS" algorithm.
In essence, it calculates the turn rate based on GPS, then applies corrections using the MPU-9250 gyro sensors.
This allows it to respond to attitude changes much more quickly than GPS alone can, and also to indicate uncoordinated maneuvers.
The algorithm doesn't use a Kalman filter.

{{< note title="Go Compilation Problem" >}}
There is an issue with this initial release: I compiled it with Go 1.7.
I had discovered that the goroutines in main/network.go sometimes panic when concurrently reading and writing to a particular map when compiled with Go versions 1.6 or higher (other projects have the same issue), so had put a mutex on the map that had issues.
However, on my latest flight I noticed that I am still getting panics from other maps in main/network.go, so I am going to have to issue a new release compiled with Go 1.5.4.
I expect to issue this new release shortly, after I return from vacation.
{{< /note >}}
