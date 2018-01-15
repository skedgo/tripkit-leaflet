L.tripgoRouting.mapLayer = (function(){

    let map = null;
    let mapId = "";
    let stops = [];
    let tripDisplaying  = null;
    let messenger = null;
    let tripgoApiKey = null;
    let floatPanel = false;

    function popUpSelector (latlng) {
        return "<div>  " +
            "<div class='addressSelector' " + "onclick='L.tripgoRouting.mapLayer.createMarker(\"from\"," + latlng.lat + "," + latlng.lng + ")'>" +
            "Directions from here" +
            "</div>" +
            " <div class='addressSelector' onclick='L.tripgoRouting.mapLayer.createMarker(\"to\", " + latlng.lat + "," + latlng.lng + ")'>" +
            "Direction to here" +
            "</div> " +
            "</div>";
    };

    function setGoogleTile() {
        L.tileLayer('https://maps.googleapis.com/maps/vt?pb=!1m5!1m4!1i{z}!2i{x}!3i{y}!4i256!2m3!1e0!2sm!3i349018013!3m9!2sen-US!3sUS!5e18!12m1!1e47!12m3!1e37!2m1!1ssmartmaps!4e0',{
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
        if(options === undefined )
            options = defaultOptions;
        else{
            if(! L.tripgoRouting.has(options,"mapId") || (options.mapId === undefined))
                options.mapId = defaultOptions.mapId;
            if(! L.tripgoRouting.has(options, "googleTile") || (options.googleTile === undefined))
                options.gogoleTile = defaultOptions.googleTile;
            if(! L.tripgoRouting.has(options, "mapCenter") || (options.mapCenter === undefined))
                options.mapCenter = defaultOptions.mapCenter;
            else{
                if(!L.tripgoRouting.validLatLng(options.mapCenter)){
                    console.error("Malformed map center coord");
                    return false;
                }
            }
             if(! L.tripgoRouting.has(options, "tripgoApiKey") || (options.tripgoApiKey.includes("TripGo")))
                 options.tripgoApiKey =  defaultOptions.tripgoApiKey;

            if(!L.tripgoRouting.has(options, "floatPanel"))
                options.floatPanel = defaultOptions.floatPanel;

        }
        return options;
    }


    return {
        initialize : function(options){
            options = checkOptions(options);

            mapId = options.mapId;
            map = L.map(mapId).setView([options.mapCenter.lat,options.mapCenter.lng], 13);
            (options.googleTile === undefined || options.googleTile) ? setGoogleTile() : setOSMTile();

            this.mapResize(window.innerWidth, window.innerHeight);
            map.on('click', this.fromClick);

            tripgoApiKey = options.tripgoApiKey;
            floatPanel = options.floatPanel;

            let tripsPanel = L.DomUtil.create("div");
            tripsPanel.id = "selectorPanel";

            if(floatPanel)
                tripsPanel.className = "selectorFloatPanel";
            else
                tripsPanel.className = "selectorPanel";

            document.body.insertBefore(tripsPanel, L.DomUtil.get(mapId));

            L.DomEvent.on(window, "resize",function () {
                L.tripgoRouting.mapLayer.mapResize((window.innerWidth - L.tripgoRouting.tripWidget.getWidth()), window.innerHeight);
                L.tripgoRouting.tripWidget.getWidget().style.height = window.innerHeight + "px";
            });
        },

        getMapId : function(){
            return mapId;
        },

        getMap : function(){
            return map;
        },

        getTripDisplaying : function () {
            return tripDisplaying;
        },

        setTripDisplaying : function (displaying) {
            tripDisplaying = displaying;
        },


        mapResize : function(width, height){
            let element = L.DomUtil.get(this.getMapId());
            element.style.width = width + "px";
            element.style.height = height + "px";
            map.invalidateSize();
        },

        getMessenger : function(){
            if(messenger == null)
                messenger = new Messenger();

            return messenger;
        },

        fromClick : function(e){
            if(!L.tripgoRouting.mapLayer.showingTrip()) {
                let latlng = L.latLng(e.latlng.lat, e.latlng.lng);
                L.popup()
                    .setLatLng(latlng)
                    .setContent(popUpSelector(e.latlng))
                    .openOn(L.tripgoRouting.mapLayer.getMap());
            }
        },

        createMarker : function(where, lat, lng){
            map.closePopup();
            let latlng = L.latLng(lat, lng);
            if(stops[where] !== undefined) {
                map.removeLayer(stops[where]);
            }

            let iconUrl = "resources/map/map-pin-"+where+".svg" ;
            let icon = L.icon({iconUrl: iconUrl, iconSize: [33, 37], iconAnchor: [16, 37]});
            let marker = L.marker();
            marker
                .setLatLng(latlng)
                .setIcon(icon)
                .addTo(map);
            marker.dragging.enable();

            stops[where] = marker;

            if(stops.from !== undefined && stops.to !== undefined){
                let from = stops.from.getLatLng();
                let to = stops.to.getLatLng();

                L.tripgoRouting.routeService.route(tripgoApiKey, from, to);
            }
        },

        clearMap : function () {
            location.reload();
        },

        clearMarkers : function () {
            if(stops.from !== undefined && stops.to !== undefined){
                map.removeLayer(stops.from);
                map.removeLayer(stops.to);
                stops = [];
            }

        },

        showingTrip : function () {
            return tripDisplaying  !== null;
        },

        selectorPanelIsFloat : function(){
            return floatPanel;
        }
    };
})();