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
        this.serviceDirection =jsonSegment.serviceDirection;
        this.platform = jsonSegment.platform;
        this.serviceName = jsonSegment.serviceName;
        this.serviceTripID = jsonSegment.serviceTripID;
        this.serviceNumber = jsonSegment.serviceNumber;

        let template = L.tripgoRouting.routeService.getTemplate(this.hashCode);
        if(template.shapes !== undefined){
            this.waypoints = this.decodeWaypoints(template.shapes);
        }
        if(template.streets !== undefined){
            this.waypoints = this.decodeWaypoints(template.streets);
        }
        this.from = template.from;
        this.to = template.to;

        if(jsonSegment.serviceColor !== null && jsonSegment.serviceColor !== undefined){
            this.color = jsonSegment.serviceColor;
        } else {
            this.color = template.modeInfo.color;
        }

        this.meters = template.metres;
        this.modeIdentifier = template.modeIdentifier;
        this.modeInfo = template.modeInfo;
        this.wheelchairAccessible = jsonSegment.wheelchairAccessible;
    }


     decodeWaypoints(encodeWaypoints){
        let waypointsList = [];
        for(let i=0; i<encodeWaypoints.length; i++){
            if(encodeWaypoints[i].travelled !== undefined){
                if(encodeWaypoints[i].travelled === true){
                    let waypoints = encodeWaypoints[i].encodedWaypoints;
                    let pol = L.Polyline.fromEncoded(waypoints);
                    waypointsList[waypointsList.length] = pol;
                }
            }else{
                let waypoints = encodeWaypoints[i].encodedWaypoints;
                let pol = L.Polyline.fromEncoded(waypoints);
                waypointsList[waypointsList.length] = pol;
            }
        }
        return waypointsList;
    }

    get getDurationMinutes(){
        return Math.floor((this.endTime - this.startTime) / 60);
    }

    get getDistanceString(){
        if(this.meters !== undefined){
            if(this.meters < 1000)
                return this.meters + " m";
            else
                return (this.meters / 1000).toFixed(1) + " km";
        }else
            return "";

    }

}



