/* Take care of updating an angle with a smoothing constant such that
   wrapping around 360 is taken care of. */
function UpdateAngle(a0, a1, k) {
    let da = a1-a0;
    while (da < -180) { da += 360; }
    while (da >= 180) { da -= 360; }
    let out = a0 + (1-k)*da;
    while (out < 0) { out += 360; }
    while (out >= 360) { out -= 360; }
    return out;
}

/* Compass should return 0, not 360 */
function UpdateTextAngle(a) {
    let out = a.toFixed();
    return (out%360).toString();
}

function AHRSRenderer(locationId) {
	this.width = -1;
	this.height = -1;

    this.locationId = locationId;
	this.canvas = document.getElementById(this.locationId);
    this.resize();

    // State variables
    this.pitch = 0;
    this.roll = 0;
    this.heading = 0;
    this.slipSkid = 0;
    this.altitude = 0;

    let display = SVG(this.locationId).viewbox(-200, -200, 400, 400).group();

    this.ai = display.group().addClass('ai');

    let defs = this.ai.defs(),
        earthClip = defs.rect(2400, 1200).x(-1200).y(0),
        screenClip = defs.rect(400, 400).cx(0).cy(0);
    this.pitchClip = defs.circle(320).cx(0).cy(0);
    this.rollClip = defs.polygon('0,0 -200,-200 200,-200');

    this.ai = this.ai.clipWith(screenClip).group();

    // card is the earth+sky+pitch marks, moves with both pitch and roll.
    this.pitchScale = 0.5;
    this.card = this.ai.group();
    this.card.circle(2400).cx(0).cy(0).addClass('sky'); // Sky
    this.card.line(-1200, 0, 1200, 0).addClass('marks'); // Horizon line
    this.card.circle(2400).cx(0).cy(0).addClass('earth').clipWith(earthClip); // Earth

    let pitchMarks = this.card.group().addClass('marks').clipWith(this.pitchClip);
    let y;
    for (let i = -1050; i <= 1050; i+=50) {
        y = i * this.pitchScale;
        if (i%100 === 0) {
            pitchMarks.line(-30, y, 30, y);
            if (i !== 0) {
                pitchMarks.text(Math.abs(i) <= 900 ? Math.abs(i / 10).toString() : '80').x(-55).cy(y).addClass('markText');
                pitchMarks.text(Math.abs(i) <= 900 ? Math.abs(i / 10).toString() : '80').x(+55).cy(y).addClass('markText');
            }
        } else {
            pitchMarks.line(-15, y, 15, y);
        }
    }

    this.rollMarks = this.ai.group().addClass('marks').clipWith(this.rollClip);
    for (let i=-180; i<180; i+=10) {
        if (i === 0) {
            this.rollMarks.polygon('-10,-189 0,-175 10,-189').style('stroke-width', 0);
        }
        else if (i % 30 === 0) {
            this.rollMarks.line(0, -175, 0, -195).rotate(i, 0, 0);
        } else {
            this.rollMarks.line(0, -175, 0, -189).rotate(i, 0, 0);
        }
    }

    let rollPointer = this.ai.group().addClass('marks');
    rollPointer.polygon('-10,-160 0,-174 10,-160').style('stroke-width', 0);
    rollPointer.polygon('-10,+160 0,+174 10,+160').style('stroke-width', 0);
    this.skidBar = this.ai.rect(20, 6).cx(0).y(-158).style('stroke-width', 0).addClass('marks');

    let pointer = this.ai.group().addClass('pointer');
    pointer.polygon('-150,-3 -78,-3 -75,0 -78,3 -150,3');
    pointer.polygon('+150,-3 +78,-3 +75,0 +78,3 +150,3');
    pointer.polygon('-75,25 0,0 75,25 25,25 25,20 -25,20 -25,25').addClass('pointerBG');
    pointer.polygon('-75,25 0,0 75,25 0,10');
    pointer.line(0, 0, 0, 10);

    this.headingMarks = this.ai.group().addClass('marks');
    for (let i=-200; i<=920; i+=20) {
        if (i%60 === 0) {
            this.headingMarks.line(i, 175, i, 178);
            this.headingMarks.text(((i<0 ? (i/2+360) : i/2)%360).toString()).x(i).cy(185).addClass('markText');
            this.headingMarks.line(i, 192, i, 195);
        } else {
            this.headingMarks.line(i, 175, i, 195).style('stroke-width', 1);
        }
    }

    this.err = display.group().addClass('error').group();
    this.err.rect(400, 400).cx(0).cy(0);
    this.err.line(-200, -200, 200, +200);
    this.err.line(-200, +200, 200, -200);
    this.errText = this.err.text("").cx(0).cy(0).addClass('errText');
    let tb = this.errText.bbox();
    this.errTextBg = this.err.rect(tb.x, tb.y, tb.w, tb.h).stroke({'width': 1}).after(this.errText);
}

AHRSRenderer.prototype = {
	constructor: AHRSRenderer,

    resize: function () {
        let canvasWidth = this.canvas.parentElement.offsetWidth - 12;

        if (canvasWidth !== this.width) {
            this.width = canvasWidth;
            this.height = canvasWidth * 0.5;

            this.canvas.width = this.width;
            this.canvas.height = this.height;
        }
    },

	update: function (pitch, roll, heading, slipSkid) {
        this.pitch = pitch;
        this.roll = roll;
        this.heading = heading;
		this.slipSkid = slipSkid;
		if (this.slipSkid < -10) {
		    this.slipSkid = -10;
        } else if (this.slipSkid > 10) {
		    this.slipSkid = +10;
        }

        this.pitchClip.translate(0, -10 * this.pitch * this.pitchScale);
        this.rollClip.rotate(this.roll, 0, 0);
        this.card.rotate(0, 0, 0).translate(0, 10 * this.pitch * this.pitchScale);
        this.card.rotate(-this.roll, 0, -10 * this.pitch * this.pitchScale);
        this.rollMarks.rotate(-this.roll, 0, 0);
        this.headingMarks.translate(-2 * (this.heading % 360), 0);
        this.skidBar.translate(-2 * this.slipSkid, 0);
	},

	turn_on: function() {
	    this.err.hide();
	    this.ai.show();
	    this.errText.clear();
    },

	turn_off: function(message) {
        this.errText.text(message).center(0, 0);
        let tb = this.errText.bbox();
        this.errTextBg.attr({'x': tb.x, 'y': tb.y, 'width': tb.w, 'height': tb.h});
        this.ai.hide();
        this.err.show();
    }
};

function GMeterRenderer(locationId, nlim, plim, resetCallback) {
    if (nlim > plim) {
        this.nlim = plim;
        this.plim = nlim;
    } else {
        this.nlim = nlim;
        this.plim = plim;
    }
    this.nticks = Math.floor(this.plim+1) - Math.ceil(this.nlim-1) + 1;

    this.width = -1;
    this.height = -1;

    this.locationId = locationId;
    this.canvas = document.getElementById(this.locationId);
    this.resize();

    // State variables
    this.g = 1;
    this.min = 1;
    this.max = 1;

    // Draw the G Meter using the svg.js library
    let gMeter = SVG(this.locationId).viewbox(-200, -200, 400, 400).group().addClass('gMeter');

    let el, card = gMeter.group().addClass('card');
    card.circle(390).cx(0).cy(0);
    card.line(-150, 0, -190, 0)
        .addClass('marks one');
    for (let i=Math.ceil(this.nlim-1); i<=Math.floor(this.plim+1); i++) {
        if (i%2 === 0) {
            el = card.line(-150, 0, -190, 0).addClass('big');
            card.text(i.toString())
                .addClass('text')
                .cx(-105).cy(0)
                .transform({ rotation: (i-1)/this.nticks*360, cx: 0, cy: 0, relative: true })
                .transform({ rotation: -(i-1)/this.nticks*360, relative: true });
        } else {
            el = card.line(-165, 0, -190, 0);

        }
        el.addClass('marks')
            .rotate((i-1)/this.nticks*360, 0, 0);
    }
    card.line(-140, 0, -190, 0).addClass('marks limit').rotate((this.plim-1)/this.nticks*360, 0, 0);
    card.line(-140, 0, -190, 0).addClass('marks limit').rotate((this.nlim-1)/this.nticks*360, 0, 0);

    let ax = -Math.cos(2*Math.PI/this.nticks),
        ay = -Math.sin(2*Math.PI/this.nticks);
    card.path('M -175 0, A 175 175 0 0 1 ' + 175*ax + ' ' + 175*ay)
        .rotate(Math.floor(this.plim)/this.nticks*360, 0, 0)
        .addClass('marks')
        .style('fill-opacity', '0');
    card.path('M -180 0, A 180 180 0 0 1 ' + 180*ax + ' ' + 180*ay)
        .rotate(Math.floor(this.plim)/this.nticks*360, 0, 0)
        .addClass('marks')
        .style('fill-opacity', '0');

    this.min_el = gMeter.group().addClass('min');
    this.min_el.polygon('0,0 -170,0 -160,-5 0,-5').addClass('pointer');
    this.min_el.polygon('0,0 -170,0 -160,+5 0,+5').addClass('pointerBG');

    this.pointer_el = gMeter.group().addClass('g');
    this.pointer_el.polygon('0,0 -170,0 -150,-10 0,-10').addClass('pointer');
    this.pointer_el.polygon('0,0 -170,0 -150,+10 0,+10').addClass('pointerBG');

    this.max_el = gMeter.group().addClass('max');
    this.max_el.polygon('0,0 -170,0 -150,-5 0,-5').addClass('pointer');
    this.max_el.polygon('0,0 -170,0 -150,+5 0,+5').addClass('pointerBG');

    gMeter.circle(40).cx(0).cy(0).addClass('center');

    let reset = gMeter.group().cx(-165).cy(165).addClass('reset');
    reset.circle(60).cx(0).cy(0).addClass('reset');
    reset.text('RESET').cx(0).cy(0).addClass('text');
    reset.on('click', function() {
        reset.animate(200).rotate(20, 0, 0);
        resetCallback();
        reset.animate(200).rotate(0, 0, 0);
    }, this);
}

GMeterRenderer.prototype = {
    constructor: GMeterRenderer,

    resize: function () {
        let canvasWidth = this.canvas.parentElement.offsetWidth - 12;

        if (canvasWidth !== this.width) {
            this.width = canvasWidth;
            this.height = canvasWidth * 0.5;

            this.canvas.width = this.width;
            this.canvas.height = this.height;
        }
    },

    update: function (g, gmin, gmax) {
        this.g = g;
        this.min = gmin;
        this.max = gmax;

        this.pointer_el.rotate((g-1)/this.nticks*360, 0, 0);
        this.max_el.rotate((this.max-1)/this.nticks*360, 0, 0);
        this.min_el.rotate((this.min-1)/this.nticks*360, 0, 0);
    }
};

function CompassRenderer(locationId) {
    this.width = -1;
    this.height = -1;

    this.locationId = locationId;
    this.canvas = document.getElementById(this.locationId);
    this.resize();

    // State variables
    this.heading = 0;
    this.track = 0;
    this.bug = 0;

    // Draw the Compass using the svg.js library
    let compass = SVG(this.locationId).viewbox(-200, -200, 400, 400).group().addClass('compass');

    // Add a square background
    let bg = compass.group().addClass('bg');
    bg.rect(400, 400).cx(0).cy(0);

    // Add some triangles every 45° to the background
    let el = bg.group().addClass('marks');
    for (let i=45; i<360; i+=45) {
        el.polygon('0,-176 -8,-188 8,-188').rotate(i, 0, 0);
    }

    // Add 10° marks between -30° and +30° to the background
    for (let i=-30; i<=30; i+=10) {
        if (i%30 === 0 & i !== 0) {
            el.line(0, -176, 0, -195).addClass('big').rotate(i, 0, 0);
        } else if (i !== 0) {
            el.line(0, -176, 0, -190).addClass('big').rotate(i, 0, 0);
        }
    }

    // Make the card, the part that rotates
    this.card = compass.group().addClass('card');
    this.card.circle(350).cx(0).cy(0);

    // Draw an airplane shape in the middle
    let airplane = compass.group().addClass('airplane');
    airplane.polygon('0,20 -1,18 -2,0 -1,-7 1,-7 2,0 1,18'); // Fuselage
    airplane.polygon('0,18 -6,20 -6,19 0,15 6,19 6,20'); // Tail
    airplane.polygon('0,6 -15,5 -16,2 -15,1 0,1 15,1 16,2 15,5'); // Wing

    // Add ticks to the card
    for (let i=0; i<360; i+=5) {
        if (i%10 === 0) {
            el = this.card
                .line(0, -175, 0, -150)
                .addClass('marks big')
                .rotate(i, 0, 0);
        } else {
            el = this.card
                .line(0, -175, 0, -160)
                .addClass('marks')
                .rotate(i, 0, 0);
        }
        if (i%30 === 0) {
            let txt;
            switch (i) {
                case 0:
                    txt = "N";
                    break;
                case 90:
                    txt = "E";
                    break;
                case 180:
                    txt = "S";
                    break;
                case 270:
                    txt = "W";
                    break;
                default:
                    txt = (i/10).toString();
            }
            this.card
                .text(txt)
                .addClass('text')
                .cx(145).cy(0)
                .transform({ rotation: i-90, cx: 0, cy: 0, relative: true })
                .transform({ rotation: 90, relative: true });
                //.transform({ rotation: -(i-90), relative: true });
        }
    }

    // Add a box to display the heading as text
    let heading_box = compass.group().addClass('heading');
    heading_box.polygon('0,-165 5,-175 25,-175 25,-198 -25,-198 -25,-175 -5,-175').addClass('box');
    this.hdgText = heading_box.text("0").addClass('text').translate(0,-196);

    // Add a heading bug
    this.heading_bug = compass.group().addClass('bug')
        .polygon('0,-165 5,-175 18,-175 18,-163 -18,-163 -18,-175 -5,-175')
        .addClass('indicator');

    // Add a box to display the bug as text
    let bug_box = compass.group().addClass('bug');
    bug_box.rect(50, 23).addClass('box').translate(130,-198);
    this.bugText = bug_box.text("0").addClass('text').translate(155,-196);

    // Add a box to display the track as text
    let track_box = compass.group().addClass('track');
    track_box.rect(50, 23).translate(-180,-198).addClass('box');
    this.trkText = track_box.text("0").addClass('text').translate(-155,-196);

    // Make a little diamond for indicating the GPS track
    this.track_el = compass.group().addClass('track')
        .polygon('0,-162 4,-154 0,-146 -4,-154')
        .addClass('indicator');

    // this.pointer_el = compass.group().addClass('g');
    // this.pointer_el.polygon('0,0 -170,0 -150,-10 0,-10').addClass('pointer');
    // this.pointer_el.polygon('0,0 -170,0 -150,+10 0,+10').addClass('pointerBG');
}

CompassRenderer.prototype = {
    constructor: CompassRenderer,

    resize: function () {
        let canvasWidth = this.canvas.parentElement.offsetWidth - 12;

        if (canvasWidth !== this.width) {
            this.width = canvasWidth;
            this.height = canvasWidth * 0.5;

            this.canvas.width = this.width;
            this.canvas.height = this.height;
        }
    },

    update: function (heading, track, bug) {
        const tau = 0.2;
        this.heading = UpdateAngle(this.heading, heading, tau);
        this.track = UpdateAngle(this.track, track, tau);
        if (bug !== null) {
            this.bug = UpdateAngle(this.bug, bug, 0);
        }

        this.card.transform({ rotation: -this.heading, cx: 0, cy: 0 });
        this.track_el.transform({ rotation: this.track-this.heading, cx: 0, cy: 0 });
        this.hdgText.text(UpdateTextAngle(this.heading));
        this.trkText.text(UpdateTextAngle(this.track));
        this.heading_bug.transform({ rotation: this.bug-this.heading, cx: 0, cy: 0 });
        this.bugText.text(this.bug.toFixed());
    }
};
