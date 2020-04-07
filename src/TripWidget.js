L.tripgoRouting.tripWidget = (function () {

    function span(text, className){
        let span = L.DomUtil.create("span");
        span.className = className;
        span.innerHTML = text;
        return span;
    }

    function div(className){
        let div =  L.DomUtil.create("div");
        div.className = className;
        return div;
    }

    function img(src, className){
        let img =  L.DomUtil.create("img");
        img.className = className;
        img.src = src;
        return img;
    }

    function createTripLine (trip, id) {
        let tripline = div("tripLine");
        tripline.id = id;

        L.DomEvent.on(tripline, "mouseover", function () {
                tripline.style.backgroundColor = '#f8f7f7';
                if (L.tripgoRouting.mapLayer.getTripDisplaying() !== undefined)
                    L.tripgoRouting.mapLayer.getTripDisplaying().removeFromMap(L.tripgoRouting.mapLayer.getMap());

                trip.drawTrip(L.tripgoRouting.mapLayer.getMap());
                L.tripgoRouting.mapLayer.setTripDisplaying(trip);
            }
        );

        L.DomEvent.on(tripline, "mouseout", function () {
                tripline.style.backgroundColor = '';
            }
        );

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

    function tripDetailsWidget(trip){
        let tripDetails = div("tripDetails");
        for(let i=0; i<trip.segments.length; i++){
            let segment = trip.segments[i];
            if(segment.modeInfo.identifier !== undefined){
                tripDetails.appendChild(segmentDetailsWidget(segment));
            }
        }
        return tripDetails;
    }

    function segmentDetailsWidget(segment){
        let segmentDetails = div('inline');
        let htmlIcon;

        if(L.tripgoRouting.has(segment.modeInfo, "remoteIcon")){
         htmlIcon = img(L.tripgoRouting.util.getTransportIconSVG(segment.modeInfo.remoteIcon, true), "icon");
         segmentDetails.appendChild(htmlIcon);
        }else{
            let path = L.tripgoRouting.util.getTransportIconSVG(segment.modeInfo.localIcon, false);
            if (path !== undefined){
                htmlIcon = img(path, "icon");
                segmentDetails.appendChild(htmlIcon);
            }
        }



        if(segment.modeIdentifier !== undefined){
            let  text = div("iconText");
            if(segment.modeIdentifier === "pt_pub")
                text.innerHTML = "<span style='color:black;'>" + segment.serviceNumber + "</span>" + "<br>" + L.tripgoRouting.util.getTime(segment.startTime);
            else{
                if(segment.getDistanceString !== undefined)
                    text.innerHTML = segment.getDistanceString;
            }

            segmentDetails.appendChild(text);
        }
        return segmentDetails;
    }

     function moreDataWidget(trip){
        let moreData = div("more");

        let moneyCost = "";
        if(trip.moneyCost !== undefined && trip.moneyCost !== 0)
            moneyCost = trip.currencySymbol + trip.moneyCost + " - ";
        else
            if(trip.moneyCost === 0)
                moneyCost = "Free - ";

        let carbonCost;
        if(trip.carbonCost !== undefined)
            carbonCost = trip.carbonCost + "kg CO<SUB>2</SUB> - ";
        else
            carbonCost = "NO CO<SUB>2</SUB> - ";

        let caloriesCost;
        if(trip.caloriesCost !== undefined)
            caloriesCost = trip.caloriesCost + " calories";
        else
            caloriesCost = "NO calories";

        moreData.innerHTML = moneyCost  + carbonCost +  caloriesCost;
        return moreData;
    }

    function clearBtn() {
        let btn = div('addressSelector clearBtn');
        btn.innerHTML = "Clear Map";
        L.DomEvent.on(btn, "click", function() {
            L.tripgoRouting.mapLayer.clearMap();
        });

        let box = div("");
        box.style.width = "inherit";
        box.style.marginBottom = "12%";
        box.appendChild(btn);
        return box;

    }

    return {
        initialize : function(){
            if(! this.isVisible()) {
                this.getWidget().style.display = "block";
                this.getWidget().style.height = window.innerHeight;
                this.getWidget().appendChild(clearBtn());

                L.tripgoRouting.mapLayer.mapResize(window.innerWidth - this.getWidth(), L.tripgoRouting.mapLayer.height);
            }
        },

        addTrip : function(trip, id){
            let tripLine = createTripLine(trip,id);
            let times = timesWidget(trip);
            tripLine.appendChild(times);
            tripLine.appendChild(tripDetailsWidget(trip));
            tripLine.appendChild(moreDataWidget(trip));

            this.getWidget().appendChild(tripLine);
        },


        getWidget : function(){
            return L.DomUtil.get("selectorPanel");
        },

        getWidth : function () {
            if(this.isVisible() && !L.tripgoRouting.mapLayer.selectorPanelIsFloat()) return  400;
            else return 0;
        },

        isVisible: function () {
            return this.getWidget().style.display  === "block";
        }
    }
})();