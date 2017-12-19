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
        if(this.drawMarkers.length === 0 && this.drawSegments.length === 0) {
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
                        if (this.bounds === null)
                            this.bounds = polyline.getBounds();
                        else
                            this.bounds.extend(polyline.getBounds());

                        let segment = this.segments[i];
                        this.drawIcon(map, segment.from.lat, segment.from.lng, mode);
                    }
                }
            }
        }else{
            for(let i=0; i<this.drawSegments.length; i++) {
                let polyline = this.drawSegments[i];
                polyline.addTo(map);
            }
            for(let i=0; i<this.drawMarkers.length; i++) {
                this.drawMarkers[i].addTo(map);
            }
        }
        if (this.bounds.isValid())
            map.fitBounds(this.bounds);

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
        let myIcon = L.divIcon({className: 'map-iconStyle', html: htmlIcon.innerHTML, iconAnchor: [18, 76], iconSize: [36, 80]});
        let marker = L.marker([lat, lng], {icon: myIcon});
        this.drawMarkers.push(marker);
        marker.addTo(map);
        return marker;
    }

    get arriveTime(){
        return L.tripgoRouting.util.getTime(this.arrive);
    }

    get departTime(){
        return L.tripgoRouting.util.getTime(this.depart);
    }

    get getDurationMinutes(){
        return Math.floor((this.arrive - this.depart) / 60);
    }


    static getModeColor(modeColor){
        return "rgb(" + modeColor.red + "," + modeColor.green + "," + modeColor.blue + ")";
    }

}

