(function (factory, window) {

    // define an AMD module that relies on 'leaflet'
    if (typeof define === 'function' && define.amd) {
        define(['leaflet'], factory);

        // define a Common JS module that relies on 'leaflet'
    } else if (typeof exports === 'object') {
        module.exports = factory(require('leaflet'));
    }

    // attach your plugin to the global 'L' variable
    if (typeof window !== 'undefined' && window.L) {
        window.L.tripgoRouting = factory(L);
    }
})(function (L) {
    var tripgoRouting = {

        // receives: json object and key
        // returns: true if json object has key
        has: function (obj, key) {
            return obj != null && hasOwnProperty.call(obj, key);
        },

        // is a given object a function
        isFunction: function (obj) {
            return typeof obj == 'function' || false;
        },

        //returns true if the item is presents in array.
        contains: function (array, item) {
            return array.indexOf(item) > -1;
        },

        // returns true if latLng has lat and lng defined
        validLatLng: function (latLng) {
            return latLng !== undefined && latLng.lat !== undefined && latLng.lng !== undefined;
        }

    };

    // return your plugin when you are done
    return tripgoRouting;
}, window);

L.tripgoRouting.mapLayer = function () {

    let map = null;
    let mapId = "";
    let stops = [];
    let tripDisplaying = null;
    let messenger = null;
    let tripgoApiKey = null;
    let floatPanel = false;

    function popUpSelector(latlng) {
        return "<div>  " + "<div class='addressSelector' " + "onclick='L.tripgoRouting.mapLayer.createMarker(\"from\"," + latlng.lat + "," + latlng.lng + ")'>" + "Directions from here" + "</div>" + " <div class='addressSelector' onclick='L.tripgoRouting.mapLayer.createMarker(\"to\", " + latlng.lat + "," + latlng.lng + ")'>" + "Direction to here" + "</div> " + "</div>";
    };

    function setGoogleTile() {
        L.tileLayer('https://maps.googleapis.com/maps/vt?pb=!1m5!1m4!1i{z}!2i{x}!3i{y}!4i256!2m3!1e0!2sm!3i349018013!3m9!2sen-US!3sUS!5e18!12m1!1e47!12m3!1e37!2m1!1ssmartmaps!4e0', {
            attribution: '&copy; Powered by Google'
        }).addTo(map);
    };

    function setOSMTile() {
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
    };

    let defaultApiKey = "d72e9c4da23eec14ea56f4065abd95c8";
    let defaultOptions = {
        "mapId": "map",
        "gogoleTile": true,
        "mapCenter": {
            "lat": -33.8650319,
            "lng": 151.2039176
        },
        "floatPanel": false,
        "tripgoApiKey": defaultApiKey
    };

    function checkOptions(options) {
        if (options === undefined) options = defaultOptions;else {
            if (!L.tripgoRouting.has(options, "mapId") || options.mapId === undefined) options.mapId = defaultOptions.mapId;
            if (!L.tripgoRouting.has(options, "googleTile") || options.googleTile === undefined) options.gogoleTile = defaultOptions.googleTile;
            if (!L.tripgoRouting.has(options, "mapCenter") || options.mapCenter === undefined) options.mapCenter = defaultOptions.mapCenter;else {
                if (!L.tripgoRouting.validLatLng(options.mapCenter)) {
                    console.error("Malformed map center coord");
                    return false;
                }
            }
            if (!L.tripgoRouting.has(options, "tripgoApiKey") || options.tripgoApiKey.includes("TripGo")) options.tripgoApiKey = defaultOptions.tripgoApiKey;

            if (!L.tripgoRouting.has(options, "floatPanel")) options.floatPanel = defaultOptions.floatPanel;
        }
        return options;
    }

    return {
        initialize: function (options) {
            options = checkOptions(options);

            mapId = options.mapId;
            map = L.map(mapId).setView([options.mapCenter.lat, options.mapCenter.lng], 13);
            options.googleTile === undefined || options.googleTile ? setGoogleTile() : setOSMTile();

            this.mapResize(window.innerWidth, window.innerHeight);
            map.on('click', this.fromClick);

            tripgoApiKey = options.tripgoApiKey;
            floatPanel = options.floatPanel;

            let tripsPanel = L.DomUtil.create("div");
            tripsPanel.id = "selectorPanel";

            if (floatPanel) tripsPanel.className = "selectorFloatPanel";else tripsPanel.className = "selectorPanel";

            document.body.insertBefore(tripsPanel, L.DomUtil.get(mapId));

            L.DomEvent.on(window, "resize", function () {
                L.tripgoRouting.mapLayer.mapResize(window.innerWidth - L.tripgoRouting.tripWidget.getWidth(), window.innerHeight);
                L.tripgoRouting.tripWidget.getWidget().style.height = window.innerHeight + "px";
            });
        },

        getMapId: function () {
            return mapId;
        },

        getMap: function () {
            return map;
        },

        getTripDisplaying: function () {
            return tripDisplaying;
        },

        setTripDisplaying: function (displaying) {
            tripDisplaying = displaying;
        },

        mapResize: function (width, height) {
            let element = L.DomUtil.get(this.getMapId());
            element.style.width = width + "px";
            element.style.height = height + "px";
            map.invalidateSize();
        },

        getMessenger: function () {
            if (messenger == null) messenger = new Messenger();

            return messenger;
        },

        fromClick: function (e) {
            if (!L.tripgoRouting.mapLayer.showingTrip()) {
                let latlng = L.latLng(e.latlng.lat, e.latlng.lng);
                L.popup().setLatLng(latlng).setContent(popUpSelector(e.latlng)).openOn(L.tripgoRouting.mapLayer.getMap());
            }
        },

        createMarker: function (where, lat, lng) {
            map.closePopup();
            let latlng = L.latLng(lat, lng);
            if (stops[where] !== undefined) {
                map.removeLayer(stops[where]);
            }

            let iconUrl = "resources/map/map-pin-" + where + ".svg";
            let icon = L.icon({ iconUrl: iconUrl, iconSize: [33, 37], iconAnchor: [16, 37] });
            let marker = L.marker();
            marker.setLatLng(latlng).setIcon(icon).addTo(map);
            marker.dragging.enable();

            stops[where] = marker;

            if (stops.from !== undefined && stops.to !== undefined) {
                let from = stops.from.getLatLng();
                let to = stops.to.getLatLng();

                L.tripgoRouting.routeService.route(tripgoApiKey, from, to);
            }
        },

        clearMap: function () {
            location.reload();
        },

        clearMarkers: function () {
            if (stops.from !== undefined && stops.to !== undefined) {
                map.removeLayer(stops.from);
                map.removeLayer(stops.to);
                stops = [];
            }
        },

        showingTrip: function () {
            return tripDisplaying !== null;
        },

        selectorPanelIsFloat: function () {
            return floatPanel;
        }
    };
}();

class Messenger {

    constructor() {
        this.messenger = L.DomUtil.create("div");
        this.messenger.className = "messenger";
        document.body.appendChild(this.messenger);

        this.message = null;
    }

    info(text) {
        this.createMessage(text);
        this.message.className = "message";
        this.show();
    }

    createMessage(text) {
        this.hideMessage();
        this.message = L.DomUtil.create("div");

        let span = L.DomUtil.create("span");
        span.innerHTML = text;
        this.message.appendChild(span);
        this.messenger.appendChild(this.message);
    }

    hideMessage() {
        if (this.message !== null) {
            this.message.remove();
            this.message = null;
        }
        this.messenger.style.display = "none";
    }

    show() {
        this.messenger.style.display = "block";
    }

    error(text, closeAfterMillis) {
        if (closeAfterMillis == undefined) closeAfterMillis = 3000;

        this.info(text);

        setTimeout(function () {
            L.tripgoRouting.mapLayer.getMessenger().hideMessage();
        }, closeAfterMillis);
    }
}

/*
* routeService provides functions to hit SkedGo server and get data from cache.
*
* */

L.tripgoRouting.routeService = function () {

    let templatesCache = [];
    const transportModes = ["pt_pub", "ps_tax", "me_car", "me_mot", "cy_bic", "wa_wal", "ps_tax_MYDRIVER", "ps_tnc_UBER", "me_car-r_SwiftFleet", "me_car-p_BlaBlaCar", "cy_bic-s"];
    const baseURL = "https://api.tripgo.com/v1/routing.json?v=11&locale=en";

    function getUrl(from, to, mode) {
        let url = baseURL + mode;
        let routeUrl = url + "&from=(" + from.lat + "," + from.lng + ")&to=(" + to.lat + "," + to.lng + ")";
        return routeUrl;
    }

    var requirements = transportModes.length + 1;
    function getRoutes(url, apiKey) {
        // make the request to SkedGo backend
        $.ajax({
            url: url,
            dataType: "json",
            beforeSend: function (xhr) {
                xhr.setRequestHeader('X-TripGo-Key', apiKey);
            },
            success: function (result) {
                if (requirements <= 1) L.tripgoRouting.mapLayer.getMessenger().hideMessage();

                requirements--;
                if (L.tripgoRouting.has(result, 'groups')) {
                    templatesCache = L.tripgoRouting.util.parseTemplates(result.segmentTemplates);
                    let trips = L.tripgoRouting.util.parseTrips(result.groups);
                    L.tripgoRouting.tripWidget.initialize();
                    success(trips);
                } else {
                    // check if server gets results
                    if (requirements === 0 && !L.tripgoRouting.tripWidget.isVisible()) {
                        L.tripgoRouting.mapLayer.clearMarkers();
                        L.tripgoRouting.mapLayer.getMessenger().error("No routes found");
                    }
                }
            },

            error: function (data) {
                requirements--;
                // if server returns an error, will inform the user about that
                if (requirements === 0) {
                    L.tripgoRouting.mapLayer.clearMarkers();
                }
                L.tripgoRouting.mapLayer.getMessenger().hideMessage();
                L.tripgoRouting.mapLayer.getMessenger().error("service-not-available, The routing service is currently not available, <br> please check your API key or try again later");
            }
        });
    }

    function success(result) {
        let i = 0;
        result.forEach(function (element) {
            L.tripgoRouting.tripWidget.addTrip(element, "trip" + i);
            i++;
        });
        if (!L.tripgoRouting.mapLayer.showingTrip()) result[0].drawTrip(L.tripgoRouting.mapLayer.getMap());
    };

    return {
        /*
        * Param: hashCode, value which is provided from server. It identifies a template.
        * Return: trip template.
        * */
        getTemplate: function (hashCode) {
            return templatesCache[hashCode];
        },

        /*
        * Params:
        *       tripgoApiKey: key provided by SkedGo server
        *       from: leaflet latlng
        *       to: leaflet latlng
        * */
        route: function (tripgoApiKey, from, to) {
            if (L.tripgoRouting.validLatLng(from) && L.tripgoRouting.validLatLng(to)) {
                L.tripgoRouting.mapLayer.getMessenger().info("getting routes form SkedGo server ...");
                let multimodal = "";
                transportModes.forEach(function (mode) {
                    let url = getUrl(from, to, "&modes=" + mode);

                    multimodal = multimodal + "&modes=" + mode;
                    getRoutes(url, tripgoApiKey);
                });
                getRoutes(getUrl(from, to, multimodal), tripgoApiKey);
            } else {
                console.error("Malformed coordinates");
            }
        }
    };
}();

/*
*
* Represents a SkedGo Segment
* */

class Segment {

    constructor(jsonSegment) {
        this.startTime = jsonSegment.startTime;
        this.endTime = jsonSegment.endTime;
        this.durationString = jsonSegment.durationString;
        this.hashCode = jsonSegment.segmentTemplateHashCode;
        this.serviceDirection = jsonSegment.serviceDirection;
        this.platform = jsonSegment.platform;
        this.serviceName = jsonSegment.serviceName;
        this.serviceTripID = jsonSegment.serviceTripID;
        this.serviceNumber = jsonSegment.serviceNumber;

        let template = L.tripgoRouting.routeService.getTemplate(this.hashCode);
        if (template.shapes !== undefined) {
            this.waypoints = this.decodeWaypoints(template.shapes);
        }
        if (template.streets !== undefined) {
            this.waypoints = this.decodeWaypoints(template.streets);
        }
        this.from = template.from;
        this.to = template.to;

        if (jsonSegment.serviceColor !== null && jsonSegment.serviceColor !== undefined) {
            this.color = jsonSegment.serviceColor;
        } else {
            this.color = template.modeInfo.color;
        }

        this.meters = template.metres;
        this.modeIdentifier = template.modeIdentifier;
        this.modeInfo = template.modeInfo;
        this.wheelchairAccessible = jsonSegment.wheelchairAccessible;
    }

    decodeWaypoints(encodeWaypoints) {
        let waypointsList = [];
        for (let i = 0; i < encodeWaypoints.length; i++) {
            if (encodeWaypoints[i].travelled !== undefined) {
                if (encodeWaypoints[i].travelled === true) {
                    let waypoints = encodeWaypoints[i].encodedWaypoints;
                    let pol = L.Polyline.fromEncoded(waypoints);
                    waypointsList[waypointsList.length] = pol;
                }
            } else {
                let waypoints = encodeWaypoints[i].encodedWaypoints;
                let pol = L.Polyline.fromEncoded(waypoints);
                waypointsList[waypointsList.length] = pol;
            }
        }
        return waypointsList;
    }

    get getDurationMinutes() {
        return Math.floor((this.endTime - this.startTime) / 60);
    }

    get getDistanceString() {
        if (this.meters !== undefined) {
            if (this.meters < 1000) return this.meters + " m";else return (this.meters / 1000).toFixed(1) + " km";
        } else return "";
    }

}

/*
*
* Represents a SkedGo Trip
* */

class Trip {

    constructor(jsonTrip) {

        this.depart = jsonTrip.depart;
        this.arrive = jsonTrip.arrive;
        this.mainSegmentHashCode = jsonTrip.mainSegmentHashCode;
        this.currencySymbol = jsonTrip.currencySymbol;
        this.carbonCost = jsonTrip.carbonCost;
        this.moneyCost = jsonTrip.moneyCost;
        this.caloriesCost = jsonTrip.caloriesCost;
        this.segments = [];
        for (let i = 0; i < jsonTrip.segments.length; i++) {
            this.segments[this.segments.length] = new Segment(jsonTrip.segments[i]);
        }
        // this._segmentTemplates = segmentTemplates;
        this.drawSegments = [];
        this.drawMarkers = [];
        this.bounds = null;
    }

    drawTrip(map) {
        if (this.drawMarkers.length === 0 && this.drawSegments.length === 0) {
            for (let i = 0; i < this.segments.length; i++) {
                if (this.segments[i].waypoints !== undefined) {
                    let segment2Draw = this.segments[i];
                    for (let j = 0; j < this.segments[i].waypoints.length; j++) {
                        let mode = segment2Draw.modeInfo;
                        let options = {};
                        options.weight = 7;
                        options.color = Trip.getModeColor(segment2Draw.color);
                        let polyline = this.segments[i].waypoints[j];
                        polyline.setStyle(options);
                        polyline.addTo(map);
                        this.drawSegments.push(polyline);
                        if (this.bounds === null) this.bounds = polyline.getBounds();else this.bounds.extend(polyline.getBounds());

                        let segment = this.segments[i];
                        this.drawIcon(map, segment.from.lat, segment.from.lng, mode);
                    }
                }
            }
        } else {
            for (let i = 0; i < this.drawSegments.length; i++) {
                let polyline = this.drawSegments[i];
                polyline.addTo(map);
            }
            for (let i = 0; i < this.drawMarkers.length; i++) {
                this.drawMarkers[i].addTo(map);
            }
        }
        if (this.bounds.isValid()) map.fitBounds(this.bounds);

        L.tripgoRouting.mapLayer.setTripDisplaying(this);
    }

    removeFromMap(map) {
        if (this.drawSegments !== null) {
            for (let i = 0; i < this.drawSegments.length; i++) {
                map.removeLayer(this.drawSegments[i]);
            }
        }

        if (this.drawMarkers !== null) {
            for (let i = 0; i < this.drawMarkers.length; i++) {
                map.removeLayer(this.drawMarkers[i]);
            }
        }
    }

    drawIcon(map, lat, lng, mode) {
        let htmlIcon = L.tripgoRouting.util.createIcon(mode);
        let myIcon = L.divIcon({ className: 'map-iconStyle', html: htmlIcon.innerHTML, iconAnchor: [18, 76], iconSize: [36, 80] });
        let marker = L.marker([lat, lng], { icon: myIcon });
        this.drawMarkers.push(marker);
        marker.addTo(map);
        return marker;
    }

    get arriveTime() {
        return L.tripgoRouting.util.getTime(this.arrive);
    }

    get departTime() {
        return L.tripgoRouting.util.getTime(this.depart);
    }

    get getDurationMinutes() {
        return Math.floor((this.arrive - this.depart) / 60);
    }

    static getModeColor(modeColor) {
        return "rgb(" + modeColor.red + "," + modeColor.green + "," + modeColor.blue + ")";
    }

}

L.tripgoRouting.tripWidget = function () {

    function span(text, className) {
        let span = L.DomUtil.create("span");
        span.className = className;
        span.innerHTML = text;
        return span;
    }

    function div(className) {
        let div = L.DomUtil.create("div");
        div.className = className;
        return div;
    }

    function img(src, className) {
        let img = L.DomUtil.create("img");
        img.className = className;
        img.src = src;
        return img;
    }

    function createTripLine(trip, id) {
        let tripline = div("tripLine");
        tripline.id = id;

        L.DomEvent.on(tripline, "mouseover", function () {
            tripline.style.backgroundColor = '#f8f7f7';
            if (L.tripgoRouting.mapLayer.getTripDisplaying() !== undefined) L.tripgoRouting.mapLayer.getTripDisplaying().removeFromMap(L.tripgoRouting.mapLayer.getMap());

            trip.drawTrip(L.tripgoRouting.mapLayer.getMap());
            L.tripgoRouting.mapLayer.setTripDisplaying(trip);
        });

        L.DomEvent.on(tripline, "mouseout", function () {
            tripline.style.backgroundColor = '';
        });

        return tripline;
    }

    function timesWidget(trip) {
        let times = div("");

        let duration = span(trip.getDurationMinutes + " min ", "tripDuration");
        let arrive = span(" (arrive " + trip.arriveTime + ")", "tripArrive");
        times.appendChild(duration);
        times.appendChild(arrive);
        return times;
    }

    function tripDetailsWidget(trip) {
        let tripDetails = div("tripDetails");
        for (let i = 0; i < trip.segments.length; i++) {
            let segment = trip.segments[i];
            if (segment.modeInfo.identifier !== undefined) {
                tripDetails.appendChild(segmentDetailsWidget(segment));
            }
        }
        return tripDetails;
    }

    function segmentDetailsWidget(segment) {
        let segmentDetails = div('inline');
        let htmlIcon;

        if (L.tripgoRouting.has(segment.modeInfo, "remoteIcon")) {
            htmlIcon = img(L.tripgoRouting.util.getTransportIconSVG(segment.modeInfo.remoteIcon, true), "icon");
            segmentDetails.appendChild(htmlIcon);
        } else {
            let path = L.tripgoRouting.util.getTransportIconSVG(segment.modeInfo.localIcon, false);
            if (path !== undefined) {
                htmlIcon = img(path, "icon");
                segmentDetails.appendChild(htmlIcon);
            }
        }

        if (segment.modeIdentifier !== undefined) {
            let text = div("iconText");
            if (segment.modeIdentifier === "pt_pub") text.innerHTML = "<span style='color:black;'>" + segment.serviceNumber + "</span>" + "<br>" + L.tripgoRouting.util.getTime(segment.startTime);else {
                if (segment.getDistanceString !== undefined) text.innerHTML = segment.getDistanceString;
            }

            segmentDetails.appendChild(text);
        }
        return segmentDetails;
    }

    function moreDataWidget(trip) {
        let moreData = div("more");

        let moneyCost = "";
        if (trip.moneyCost !== undefined && trip.moneyCost !== 0) moneyCost = trip.currencySymbol + trip.moneyCost + " - ";else if (trip.moneyCost === 0) moneyCost = "Free - ";

        let carbonCost;
        if (trip.carbonCost !== undefined) carbonCost = trip.carbonCost + "kg CO<SUB>2</SUB> - ";else carbonCost = "NO CO<SUB>2</SUB> - ";

        let caloriesCost;
        if (trip.caloriesCost !== undefined) caloriesCost = trip.caloriesCost + " calories";else caloriesCost = "NO calories";

        moreData.innerHTML = moneyCost + carbonCost + caloriesCost;
        return moreData;
    }

    function clearBtn() {
        let btn = div('addressSelector clearBtn');
        btn.innerHTML = "Clear Map";
        L.DomEvent.on(btn, "click", function () {
            L.tripgoRouting.mapLayer.clearMap();
        });

        let box = div("");
        box.style.width = "inherit";
        box.style.marginBottom = "12%";
        box.appendChild(btn);
        return box;
    }

    return {
        initialize: function () {
            if (!this.isVisible()) {
                this.getWidget().style.display = "block";
                this.getWidget().style.height = window.innerHeight;
                this.getWidget().appendChild(clearBtn());

                L.tripgoRouting.mapLayer.mapResize(window.innerWidth - this.getWidth(), L.tripgoRouting.mapLayer.height);
            }
        },

        addTrip: function (trip, id) {
            let tripLine = createTripLine(trip, id);
            let times = timesWidget(trip);
            tripLine.appendChild(times);
            tripLine.appendChild(tripDetailsWidget(trip));
            tripLine.appendChild(moreDataWidget(trip));

            this.getWidget().appendChild(tripLine);
        },

        getWidget: function () {
            return L.DomUtil.get("selectorPanel");
        },

        getWidth: function () {
            if (this.isVisible() && !L.tripgoRouting.mapLayer.selectorPanelIsFloat()) return 400;else return 0;
        },

        isVisible: function () {
            return this.getWidget().style.display === "block";
        }
    };
}();

L.tripgoRouting.util = function () {

    const remoteIconUrl = "https://tripgo.skedgo.com/satapp/modeicons/";

    function remoteIconString(modeCode) {
        return "icon-mode-" + modeCode + ".svg";
    }

    function localIconString(modeCode) {
        return "ic-" + modeCode + "-24px.svg";
    }

    return {
        parseTemplates: function (json) {
            let segmentTemplates = [];
            for (let i = 0; i < json.length; i++) {
                segmentTemplates[json[i].hashCode] = json[i];
            }
            return segmentTemplates;
        },

        parseTrips: function (json) {
            let parsedTrips = [];
            for (let i = 0; i < json.length; i++) {
                parsedTrips.push(new Trip(json[i].trips[0]));
            }
            return parsedTrips;
        },

        createIcon: function (mode) {
            let divImg = L.DomUtil.create('div');
            let pin = L.DomUtil.create('img', "block center");
            pin.src = "resources/map/map-pin-base@2x.png";

            let icon = L.DomUtil.create("img", 'icon-style block');

            if (L.tripgoRouting.has(mode, "remoteIcon")) icon.src = this.getTransportIconSVG(mode.remoteIcon, true);else icon.src = this.getTransportIconSVG(mode.localIcon, false);

            divImg.appendChild(icon);
            divImg.appendChild(pin);

            return divImg;
        },

        getTransportIconSVG: function (modeCode, remote) {
            if (remote) return remoteIconUrl + remoteIconString(modeCode);else {
                if (modeCode !== "wait" && modeCode !== "transfer" && modeCode !== "collect" && modeCode !== "return") return "resources/trip/" + localIconString(modeCode);else return undefined;
            }
        },

        getTime: function (long) {
            let date = new Date(long * 1000);
            let hs = date.getHours();
            let min = date.getMinutes();
            if (hs <= 9) hs = "0" + hs;
            if (min <= 9) min = "0" + min;

            return hs + ":" + min;
        }
    };
}();

