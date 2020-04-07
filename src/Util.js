L.tripgoRouting.util =  (function () {

     const remoteIconUrl = "https://tripgo.skedgo.com/satapp/modeicons/";

     function remoteIconString(modeCode){
         return "icon-mode-" + modeCode + ".svg";
     }

     function localIconString(modeCode){
        return "ic-"+modeCode +"-24px.svg";
     }

     return {
         parseTemplates: function (json) {
             let segmentTemplates = [];
             for (let i=0; i<json.length; i++){
                 segmentTemplates[json[i].hashCode] = json[i];
             }
             return segmentTemplates;
         },


         parseTrips : function (json) {
             let parsedTrips = [];
             for(let i = 0; i<json.length; i++){
                 parsedTrips.push(new Trip(json[i].trips[0]));
             }
             return parsedTrips;
         },

         createIcon : function(mode){
             let divImg = L.DomUtil.create('div');
             let pin =  L.DomUtil.create('img', "block center");
             pin.src = "resources/map/map-pin-base@2x.png";

             let icon = L.DomUtil.create("img", 'icon-style block');

             if(L.tripgoRouting.has(mode, "remoteIcon"))
                icon.src = this.getTransportIconSVG(mode.remoteIcon, true);
             else
                 icon.src = this.getTransportIconSVG(mode.localIcon, false);

             divImg.appendChild(icon);
             divImg.appendChild(pin);

             return divImg;
         },

         getTransportIconSVG : function (modeCode, remote) {
             if(remote)
                 return (remoteIconUrl + remoteIconString(modeCode))
             else{
                if ( modeCode !== "wait" && modeCode !== "transfer" && modeCode !== "collect" && modeCode !== "return")
                     return "resources/trip/" + localIconString(modeCode);
                else
                    return undefined;
             }

         },

         getTime : function(long){
             let date = new Date(long * 1000);
             let hs = date.getHours();
             let min = date.getMinutes();
             if(hs <= 9)
                 hs = "0" + hs;
             if(min <= 9)
                 min = "0" + min;

             return  hs + ":" + min
         }
     }

})();