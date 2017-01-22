+++
date = "2017-01-19T14:41:29-05:00"
draft = false
title = "A Stratux AHRS image for beta testers"
weight = 1
+++

I am excited to finally offer a Stratux image for anyone who would like to help beta test my initial AHRS solution!


## Requirements

To use this image, in addition to the normal Stratux requriements, you'll need to connect an MPU-9250 sensor to your Stratux.
The OpenFlightSolutions AHRS board is a great choice.
You can also use a RY836AI (tested), a SparkFun MPU-9250 breakout board (tested), or your own home brew.

The code also has a driver for the BMP280, which also exists on both the OpenFlightSolutions AHRS board and the RY836AI.
If you have one of these boards or a separate dev board, the pressure altitude and rate of climb will be used in the algorithm.

{{< note title="Note" >}} I intended to support the MPU-9150 also (which is the sensor chip on the RY835AI).
However, the driver for this sensor was removed from the main Stratux code.
It was pretty ugly anyway--it was a thin Go wrapper around the original C driver.
I may write a pure Go driver if there is sufficient interest.
The MPU-9250 performs better anyway.
The same is true of the BMP-180 (RY835AI) vs the BMP-280 (RY836AI).
{{< /note >}}


## Download

You can download the image from the [Releases](https://github.com/westphae/stratux/releases) area of the GitHub page.
Just burn it like any other Stratux image.


## Sensor Pinout

Pinouts for the MPU-9250 are as follows:

| MPU-9250 Pin | Raspberry Pi Pin |
|--------------|------------------|
| VDD          | Pin 02 (or 04)   |
| GND          | Pin 06           |
| FSYNC        | Pin 09           |
| SDA1         | Pin 03           |
| SCL1         | Pin 05           |

The Raspberry Pi also has ground on pins 14, 20, 25, 30, and 39 that you can connect GND or FSYNC to.

If you use the RY836AI, you can also connect its GPS:

| GPS Pin      | Raspberry Pi Pin |
|--------------|------------------|
| TXD          | Pin 10 (RXD0)    |
| RXD          | Pin 08 (TXD0)    |

![Raspberry Pi Pins](/img/raspi_pins.png "Raspberry Pi Pins")

Be sure to affix the sensor firmly to the Stratux box.
The sensor must not be able to move around in flight or the AHRS will give false indications.


## Changes to Stratux

Once you've connected the board and burned the image to your SDCard, you're ready to go.

There are just a few changes to cyoung/stratux.
First is a new Attitude Indicator in place of the old "paper airplane."
Tilting the sensor should result in some motion of the AI, though possibly not in a way that makes sense -- because we haven't calibrated it yet.

![StratuxAI](/img/AHRS_Screenshot.png "Stratux Horizon Indicator")

There is also a "Calibrate AHRS Sensors" button on the "Settings" page.

I also added a "CPU Load" area to the "Status" page.


## Sensor Orientation

As noted earlier, it is crucial that the Stratux remain in one position in your aircraft--if it slides around, it will lose orientation.
OpenFlightSolutions has a really nice base with a grippy bottom surface for their OpenFlightBox that works great for me.

In this initial release, the Stratux will need to be oriented roughly at "right angles" to the pitch, yaw and roll axes of the airplane, so give some thought to how it will be situated in your aircraft.
It can sit in any orientation as long as one of the sensor's X, Y, or Z axes (positive or negative) points forward, one toward the left wing, and one up.
I put mine on my glareshield with the antennae at the rear--see the picture.

![Stratux Placement](/img/stratux_glareshield.jpg "Stratux placement on the glareshield")

It will need to be oriented to within say 5° of the airplane's axes to provide good data to the algorithm.
Eventually I may write a more sophisticated self-calibration routine that will orient itself automatically from any which angle, but for now we need to tell it precisely which direction is which.


## Sensor Calibration

Now we will perform a "calibration."
This is not a full sensor calibration, it is just a means to tell the AHRS algorithm the orientation of the Stratux box in the airplane, i.e. which sensor axis corresponds to which aircraft axis.
It needs to know which end of the sensor will point forward (along the roll axis), which end will point up (along the yaw axis), and which toward the left wing (along the pitch axis).
This only has to be done once, as long as you don't change this gross orientation of the sensor to your airplane.
The setting will be stored with your other settings on your SDCard.
It goes without saying that this is best done on the ground, with the engine off...

The calibration routine uses gravity to tell the algorithm which way is which.
On the settings page, if you click on "Calibrate AHRS Sensors", it will guide you through this process.
You will first orient the sensor so that the end that will be pointing forward in flight is instead pointing straight up.
"Straight" just means that it is pointing up more than the other two axes, say a pitch angle of 70° or more.

![Stratux Forward Orientation](/img/stratux_orientation_1.jpg "Stratux orientation for forward direction")

Then the axis which feels the most gravity will be considered "forward."  
Once you are holding the sensor in this attitude, "nose-up," then click the "Set Forward Direction" button.

Now you just place the sensor in the orientation it will ultimately rest in the airplane.

![Stratux Up Orientation](/img/stratux_orientation_2.jpg "Stratux orientation for up direction")

Then click the "Set Up Direction" button and gravity will tell the algorithm which direction will be Up.
From this, we know which direction will be toward the left wing.

You're now ready to fly!

## GPS-Only Attitude

There is already a "GPS-only" attitude system recently integrated into Stratux.
This was developed by @AvSquirrel.
It is considered a "pseudo-attitude" system because it does not use independent sensors to determine attitude--it bases its attitude calculations only on GPS data.

It is excellent code and works quite well.
However, because it doesn't have sensors, it has several deficiencies.
Most notably, its attitude lags the aircraft's actual attitude by a second or so; and it cannot correctly sense uncoordinated maneuvers.

I retained this excellent code for users who do not have attitude sensors, which presumably will be the majority.
My fork will use the GPS-only attitude if there is no sensor present, or if the "Sensors" switch in the Hardware section of the Settings page is "off."
Otherwise, it uses my AHRS calculations.


## Disclaimer

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
