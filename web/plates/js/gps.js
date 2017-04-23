angular.module('appControllers').controller('GPSCtrl', GPSCtrl); // get the main module contollers set
GPSCtrl.$inject = ['$rootScope', '$scope', '$state', '$http', '$interval']; // Inject my dependencies

// create our controller function with all necessary logic
function GPSCtrl($rootScope, $scope, $state, $http, $interval) {
    $scope.$parent.helppage = 'plates/gps-help.html';
    $scope.data_list = [];
    $scope.isHidden = false;

    function connect($scope) {
        if (($scope === undefined) || ($scope === null))
            return; // we are getting called once after clicking away from the gps page

        if (($scope.socket === undefined) || ($scope.socket === null)) {
            socket = new WebSocket(URL_GPS_WS);
            $scope.socket = socket; // store socket in scope for enter/exit usage
        }

        $scope.ConnectState = "Disconnected";

        socket.onopen = function (msg) {
            // $scope.ConnectStyle = "label-success";
            $scope.ConnectState = "Connected";
        };

        socket.onclose = function (msg) {
            // $scope.ConnectStyle = "label-danger";
            $scope.ConnectState = "Disconnected";
            $scope.$apply();
            delete $scope.socket;
            setTimeout(function() {connect($scope);}, 1000);
        };

        socket.onerror = function (msg) {
            // $scope.ConnectStyle = "label-danger";
            $scope.ConnectState = "Error";
            resetSituation();
            $scope.$apply();
        };

        socket.onmessage = function (msg) {
            loadSituation(msg.data);
            $scope.$apply(); // trigger any needed refreshing of data
        };
    }

    var situation = {};
    var display_area_size = -1;

    var statusGPS = document.getElementById("status-gps"),
        statusIMU = document.getElementById("status-imu"),
        statusBMP = document.getElementById("status-bmp"),
        statusLog = document.getElementById("status-logging"),
        statusCal = document.getElementById("status-calibrating");

    function sizeMap() {
        var width = 0;
        var el = document.getElementById("map_display").parentElement;
        width = el.offsetWidth; // was  (- (2 * el.offsetLeft))
        if (width !== display_area_size) {
            display_area_size = width;
            $scope.map_width = width;
            $scope.map_height = width;
        }
        return width;
    }

    function setGeoReferenceMap(la, lo) {
        // Mercator projection
        // var map = "img/world.png";
        var map_width = 2530;
        var map_height = 1603;
        var map_zero_x = 1192;
        var map_zero_y = 1124;
        var font_size = 18; // size of font used for marker

        sizeMap();
        var div_width = $scope.map_width;
        var div_height = $scope.map_height;

		
        // longitude: just scale and shift
        var x = (map_width * (180 + lo) / 360) - (map_width/2 - map_zero_x); // longitude_shift;

        // latitude: using the Mercator projection
        la_rad = la * Math.PI / 180; // convert from degrees to radians
        merc_n = Math.log(Math.tan((la_rad / 2) + (Math.PI / 4))); // do the Mercator projection (w/ equator of 2pi units)
        var y = (map_height / 2) - (map_width * merc_n / (2 * Math.PI)) - (map_height/2 - map_zero_y); // fit it to our map

        // dot = '<div style="position:absolute; width:' + dot_size + 'px; height:' + dot_size + 'px; top:' + y + 'px; left:' + x + 'px; background:#ff7f00;"></div>';
        // <img src="map-world-medium.png" style="position:absolute;top:0px;left:0px">
        $scope.map_pos_x = map_width - Math.round(x - (div_width / 2));
        $scope.map_pos_y = map_height - Math.round(y - (div_height / 2));

        $scope.map_mark_x = Math.round((div_width - (font_size * 0.85)) / 2);
        $scope.map_mark_y = Math.round((div_height - font_size) / 2);
    }

    function loadSituation(data) { // mySituation
        situation = angular.fromJson(data);
        // consider using angular.extend()
        $scope.raw_data = angular.toJson(data, true); // makes it pretty

        $scope.Satellites = situation.GPSSatellites;
        $scope.GPS_satellites_tracked = situation.GPSSatellitesTracked;
        $scope.GPS_satellites_seen = situation.GPSSatellitesSeen;
        $scope.Quality = situation.GPSFixQuality;

        var solutionText = "No Fix";
        if (situation.GPSFixQuality === 2) {
            solutionText = "GPS + SBAS (WAAS / EGNOS)";
        } else if (situation.GPSFixQuality === 1) {
            solutionText = "3D GPS"
        }
        $scope.SolutionText = solutionText;

        $scope.gps_horizontal_accuracy = situation.GPSHorizontalAccuracy.toFixed(1);
        $scope.gps_vertical_accuracy = (situation.GPSVerticalAccuracy*3.2808).toFixed(1); // accuracy is in meters, need to display in ft


        // NACp should be an integer value in the range of 0 .. 11
        // var accuracies = ["≥ 10 NM", "< 10 NM", "< 4 NM", "< 2 NM", "< 1 NM", "< 0.5 NM", "< 0.3 NM", "< 0.1 NM", "< 100 m", "< 30 m", "< 10 m", "< 3 m"];
        // $scope.gps_horizontal_accuracy = accuracies[status.NACp];
        // "LastFixLocalTime":"2015-10-11T16:47:03.523085162Z"

        $scope.gps_lat = situation.GPSLatitude.toFixed(5); // result is string
        $scope.gps_lon = situation.GPSLongitude.toFixed(5); // result is string
        $scope.gps_alt = situation.GPSAltitudeMSL.toFixed(1);
        $scope.gps_track = situation.GPSTrueCourse.toFixed(1);
        $scope.gps_speed = situation.GPSGroundSpeed.toFixed(1);
        $scope.gps_vert_speed = situation.GPSVerticalSpeed.toFixed(1);

        // "LastGroundTrackTime":"0001-01-01T00:00:00Z"

        /* not currently used
            $scope.ahrs_temp = status.Temp;
        */
        $scope.press_time = Date.parse(situation.BaroLastMeasurementTime);
        $scope.gps_time = Date.parse(situation.GPSLastGPSTimeStratuxTime);
        if ($scope.gps_time - $scope.press_time < 1000) {
            $scope.ahrs_alt = Math.round(situation.BaroPressureAltitude.toFixed(0));
        } else {
            $scope.ahrs_alt = "---";
        }

        $scope.ahrs_heading = Math.round(situation.AHRSGyroHeading.toFixed(0));
        // pitch and roll are in degrees
        $scope.ahrs_pitch = situation.AHRSPitch.toFixed(1);
        $scope.ahrs_roll = situation.AHRSRoll.toFixed(1);
        $scope.ahrs_slip_skid = situation.AHRSSlipSkid.toFixed(1);
        ahrs.update(situation.AHRSPitch, situation.AHRSRoll, situation.AHRSGyroHeading, situation.AHRSSlipSkid);

        $scope.ahrs_heading_mag = situation.AHRSMagHeading.toFixed(0);
        $scope.ahrs_gload = situation.AHRSGLoad.toFixed(2);
        gMeter.update(situation.AHRSGLoad);

        if (situation.AHRSTurnRate> 0.6031) {
            $scope.ahrs_turn_rate = (6/situation.AHRSTurnRate).toFixed(1); // minutes/turn
        } else {
            $scope.ahrs_turn_rate = '\u221e';
        }
        if (situation.AHRSStatus & 0x01) {
            statusGPS.classList.remove("off");
            statusGPS.classList.add("on");
        } else {
            statusGPS.classList.add("off");
            statusGPS.classList.remove("on");
        }
        if (situation.AHRSStatus & 0x02) {
            if (statusIMU.classList.contains("off")) {
                setTimeout(gMeter.reset(), 1000);
            }
            statusIMU.classList.remove("off");
            statusIMU.classList.add("on");
        } else {
            statusIMU.classList.add("off");
            statusIMU.classList.remove("on");
        }
        if (situation.AHRSStatus & 0x04) {
            statusBMP.classList.remove("off");
            statusBMP.classList.add("on");
        } else {
            statusBMP.classList.add("off");
            statusBMP.classList.remove("on");
        }
        if (situation.AHRSStatus & 0x10) {
            statusLog.classList.remove("off");
            statusLog.classList.add("on");
        } else {
            statusLog.classList.add("off");
            statusLog.classList.remove("on");
        }
        if (situation.AHRSStatus & 0x08) {
            statusCal.classList.add("blink");
            statusCal.classList.remove("on");
            statusCal.innerText = "Caging";
        } else {
            statusCal.classList.remove("blink");
            statusCal.classList.add("on");
            statusCal.innerText = "Ready";
        }
        // "LastAttitudeTime":"2015-10-11T16:47:03.534615187Z"

        setGeoReferenceMap(situation.GPSLatitude, situation.GPSLongitude);
    }

    function resetSituation() { // mySituation
        $scope.raw_data = "error getting gps / ahrs status";
        $scope.ahrs_heading = "---";
        $scope.ahrs_pitch = "--";
        $scope.ahrs_roll = "--";
        $scope.ahrs_slip_skid = "--";
        $scope.ahrs_heading_mag = "---";
        $scope.ahrs_turn_rate = "--";
        $scope.ahrs_gload = "--";
        statusGPS.classList.add("off");
        statusGPS.classList.remove("on");
        statusIMU.classList.add("off");
        statusIMU.classList.remove("on");
        statusBMP.classList.add("off");
        statusBMP.classList.remove("on");
        statusLog.classList.add("off");
        statusLog.classList.remove("on");
        statusCal.classList.add("off");
        statusCal.classList.remove("on");
        statusCal.innerText = "Error";
    }

    function getSatellites() {
        // Simple GET request example (note: response is asynchronous)
        $http.get(URL_SATELLITES_GET).
        then(function (response) {
            loadSatellites(response.data);
        }, function (response) {
            $scope.raw_data = "error getting satellite data";
        });
    }

    function setSatellite(obj, new_satellite) {
        new_satellite.SatelliteNMEA = obj.SatelliteNMEA;
        new_satellite.SatelliteID = obj.SatelliteID;     // Formatted code indicating source and PRN code. e.g. S138==WAAS satellite 138, G2==GPS satellites 2
        new_satellite.Elevation = obj.Elevation;        // Angle above local horizon, -xx to +90
        new_satellite.Azimuth = obj.Azimuth;         // Bearing (degrees true), 0-359
        new_satellite.Signal = obj.Signal;          // Signal strength, 0 - 99; -99 indicates no reception
        new_satellite.InSolution = obj.InSolution;   // is this satellite in the position solution
    }

    function loadSatellites(satellites) {
        if (($scope === undefined) || ($scope === null))
            return; // we are getting called once after clicking away from the status page

        $scope.raw_data = angular.toJson(satellites, true);

        $scope.data_list.length = 0; // clear array
        // we need to use an array so AngularJS can perform sorting; it also means we need to loop to find a tower in the towers set
        for (var key in satellites) {
            //if (satellites[key].Messages_last_minute > 0) {
            var new_satellite = {};
            setSatellite(satellites[key], new_satellite);
            $scope.data_list.push(new_satellite); // add to start of array
            //}
        }
        // $scope.$apply();
    }

    // refresh satellite info once each second (aka polling)
    var updateSatellites = $interval(getSatellites, 1000, 0, false);

    $state.get('gps').onEnter = function () {
        // everything gets handled correctly by the controller
    };

    $state.get('gps').onExit = function () {
        if (($scope.socket !== undefined) && ($scope.socket !== null)) {
            $scope.socket.close();
            $scope.socket = null;
        }
        // stop polling for gps/ahrs status
        $interval.cancel(updateSatellites);
    };

    // GPS/AHRS Controller tasks go here
    var ahrs = new AHRSRenderer("ahrs_display");

    $scope.hideClick = function() {
        $scope.isHidden = !$scope.isHidden;
        var disp = "block";
        if ($scope.isHidden) {
            disp = "none";
        }
        var hiders = document.querySelectorAll(".hider");

        for (var i=0; i < hiders.length; i++) {
            hiders[i].style.display = disp;
        }
    };

    $scope.AHRSCage = function() {
        if (!$scope.IsCaging()) {
            $http.post(URL_AHRS_CAGE).then(function (response) {
                // do nothing
            }, function (response) {
                // do nothing
            });
        }
    };

    $scope.IsCaging = function() {
        var caging = statusCal.innerText === "Caging";
        if (caging) {
            ahrs.turn_off("Calibrating. Fly straight and do not move sensor.");
        } else {
            ahrs.turn_on();
        }
        return caging;
    };

    var gMeter = new GMeterRenderer("gMeter_display", 4.4, -1.76);

    // GPS Controller tasks
    connect($scope); // connect - opens a socket and listens for messages
}
