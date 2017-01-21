+++
date = "2017-01-18T22:36:35+00:00"
draft = false
title = "AHRS for Stratux"
type = "index"
+++

![splash](/img/intro-bg.jpg)

This project is a [fork](https://github.com/westphae/stratux) of the [Stratux](https://github.com/cyoung/stratux) project.
It is mainly intended to provide AHRS (Attitude Heading and Reference System) features.

I created this site to help beta testers to download, install, and use this fork,
and to provide me feedback and/or collaborate on its further development.

AHRS support requires writing drivers for sensor hardware, Kalman filter and other approaches
for determining attitude from sensor input, and software simulators for testing these algorithms.
The main code for AHRS is in a separate GitHub repository of mine, https://github.com/westphae/goflying.

This fork incorporates minimal changes into the stratux code to integrate the AHRS code from the goflying library.
Hopefully it will eventually be merged into the main stratux project.
