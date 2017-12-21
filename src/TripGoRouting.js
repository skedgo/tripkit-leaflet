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
}(function (L) {
    var tripgoRouting =  {

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
}, window));









