+++
date = "2017-01-18T22:36:35+00:00"
draft = false
title = "AHRS for Stratux"
type = "index"
+++

![splash](/img/intro-bg.jpg)

This project is a [fork](https://github.com/westphae/stratux) of the [Stratux](https://github.com/cyoung/stratux) project.
It is mainly intended to provide AHRS (Attitude Heading and Reference System) features.

I created this site to help beta testers to download, install, and use this fork, and to provide me feedback and/or collaborate on its further development.

AHRS support requires writing drivers for sensor hardware, Kalman filter and other approaches for determining attitude from sensor input, and software simulators for testing these algorithms.
The main code for AHRS is in a separate GitHub repository, https://github.com/westphae/goflying.

This fork incorporates minimal changes into the stratux code to integrate the AHRS code from the goflying library.
Hopefully it will eventually be merged into the main stratux project.

You can watch a video of my flight testing the AHRS in my Bonanza V35B.
My phone is on the left showing the Stratux Webpage UI AHRS indicator.
Dual Aspens are on the right.
Currently the pitch indications are not very accurate.
But the fundamental issues of AHRS are solved and the indications are close enough to reality to be useful.
*The project is definitey still in BETA!*

[![AHRS on Youtube](https://img.youtube.com/vi/hbV1bGDzHmw/0.jpg)](https://youtu.be/hbV1bGDzHmw)

{{< warning title="This AHRS will not save your life." >}}
I was partially motivated to develop this software due to losing my vacuum pump-driven attitude indicator system (including standby pump within an hour each time!) no less than three times over the course of 2700 hours of flying.
The last time, at night over the Egyptian Saharan desert, I at least had a clear sky above (there was oftentimes not a single light in the desert below).
My autopilot was also driven by the attitude indicator, so I had to both keep upright and hand-fly through the pitch black for hours.

Fortunately, this last time I also had a MidCon LifeSaver electrical backup.
Even surrounded by inky blackness above and below, with no horizon visible outside, between the stars above and the MidCon certified backup, I was able to continue without any loss of situational awareness.
However, the thought crossed my mind many times as I flew on through the dark for hours that the MidCon was my last and only backup.
If I had to do an instrument approach, I would be partial panel.
I would really have loved to have had at least one potential additional and fully independent backup system, if only to provide me some comfort and an independent check for my partial panel flying.

It goes without saying that a self-built attitude indicator system that can potentially be thrown willy nilly up on the glareshield, in a severely uncontrolled environment, and running software that has never been certified by any independent agent should not be relied upon in any but the most dire of circumstances.
Even then, you would be very wise to fly partial panel on certified instruments and use any such system as this only as a cross-reference.

If this software ever serves just to provide some comfort to a pilot in an event such as I experienced, it will have served its purpose.  Its purpose is not to save your life.
{{< /warning >}}
