/*
* routeService provides functions to hit SkedGo server and get data from cache.
*
* */

L.tripgoRouting.routeService = (function () {

    let templatesCache = [];
    const transportModes = ["pt_pub", "ps_tax", "me_car", "me_mot", "cy_bic", "wa_wal", "ps_tax_MYDRIVER", "ps_tnc_UBER",
        "me_car-r_SwiftFleet", "me_car-p_BlaBlaCar", "cy_bic-s"];
    const baseURL = "https://api.tripgo.com/v1/routing.json?v=11&locale=en";

    function getUrl(from, to, mode){
        let url = baseURL +  mode;
        let routeUrl = url +"&from=("+from.lat+","+from.lng+")&to=("+to.lat+","+to.lng+")";
        return routeUrl;
    }

    var requirements = transportModes.length + 1;
    function getRoutes(url, apiKey) {
        // make the request to SkedGo backend
        $.ajax({
            url         : url,
            dataType    : "json",
            beforeSend: function(xhr){
                xhr.setRequestHeader('X-TripGo-Key', apiKey);
            },
            success     : function(result) {
                if(requirements <= 1)
                    L.tripgoRouting.mapLayer.getMessenger().hideMessage();

                requirements --;
                if (L.tripgoRouting.has(result, 'groups')) {
                    templatesCache = L.tripgoRouting.util.parseTemplates(result.segmentTemplates);
                    let trips = L.tripgoRouting.util.parseTrips(result.groups);
                    L.tripgoRouting.tripWidget.initialize();
                    success(trips);
                }else{
                    // check if server gets results
                    if (requirements === 0 && !L.tripgoRouting.tripWidget.isVisible()) {
                        L.tripgoRouting.mapLayer.clearMarkers();
                        L.tripgoRouting.mapLayer.getMessenger().error("No routes found");
                    }
                }
            },

            error       : function(data){
                requirements --;
                // if server returns an error, will inform the user about that
                if (requirements === 0){
                    L.tripgoRouting.mapLayer.clearMarkers();
                }
                L.tripgoRouting.mapLayer.getMessenger().hideMessage();
                L.tripgoRouting.mapLayer.getMessenger().error("service-not-available, The routing service is currently not available, <br> please check your API key or try again later" );


            }
        });
    }

    function success(result) {
        let i=0;
        result.forEach(function(element) {
            L.tripgoRouting.tripWidget.addTrip(element, "trip" + i);
            i++;
        });
        if(!L.tripgoRouting.mapLayer.showingTrip())
            result[0].drawTrip(L.tripgoRouting.mapLayer.getMap());
    };

    return {
        /*
        * Param: hashCode, value which is provided from server. It identifies a template.
        * Return: trip template.
        * */
        getTemplate : function(hashCode) {
            return templatesCache[hashCode];
        },

        /*
        * Params:
        *       tripgoApiKey: key provided by SkedGo server
        *       from: leaflet latlng
        *       to: leaflet latlng
        * */
        route : function(tripgoApiKey, from, to){
            if(L.tripgoRouting.validLatLng(from) && L.tripgoRouting.validLatLng(to)){
                L.tripgoRouting.mapLayer.getMessenger().info("getting routes form SkedGo server ...");
                let multimodal =  "";
                transportModes.forEach(function (mode) {
                    let url = getUrl(from, to, "&modes="+mode);

                    multimodal = multimodal + "&modes=" + mode;
                    getRoutes(url, tripgoApiKey);
                });
                getRoutes(getUrl(from, to, multimodal), tripgoApiKey);
            }else{
                console.error("Malformed coordinates");
            }
        },
    }
})();