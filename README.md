# TripGo Routing Leaflet Plugin

## API-Key
 Get your API key [here ](https://skedgo.com/en/tripgo-api/).
 
 API documentation [here ](https://developer.tripgo.com/).

The TripGo mobility platform let’s you create apps providing seamless and personalised door-to-door trips using any public, private or commercial mode of transport. 
It’s a single API connecting you to hundreds of transport providers around the globe.

TripGo leaflet's plugin motivation is to provide an easy way to include it's functionality in an external platform. TripGo provides free and enterprise services, more details [here ](https://skedgo.com/en/tripgo-api/pricing/).   

# Features

* Map interaction to select start and destination of the trip.
* Routing from start to destination using any public, private or commercial mode of transport. 
* Description for each trip, where you can see arrival time, trip duration, cost, pollution,
 modes of transports, etc.
* Customizable map tiles (Google and OSM).
* Customizable results UI (floating over the map or docked next to it)
* Open Source released under ISC License (more or less equivalent with the MIT license).
* Available transport modes:
    - Public transport
    - Walk
    - Bike
    - Bike share
    - Car
    - SwiftFleet
    - BlaBlaCar
    - Uber
    - My Driver
    - Taxi
   
# Getting started
 ## Includes
 
        [...]
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.2.0/dist/leaflet.css" />
        <link rel="stylesheet" href="css/TripgoRouting.css" />
        <script src="https://unpkg.com/leaflet@1.2.0/dist/leaflet.js"></script>
        <script src="dist/TripgoRouting.js"></script>
        <script src="lib/jquery-3.2.1.js"></script>
        <script src="lib/Polyline-encoded.js"></script>
        [...]
    
 ## Map definition 
    
        [...]
            <div id="map"></div>
        [...]
    
 ## Plugin StartUp 
    
   ### default config

            [...]
              <script>
                    L.tripgoRouting.mapLayer.initialize();           
              </script>
            [...]
    
   ### Initialize Options
     
            [...]
                <script>                  
                     let options ={
                         "mapId" : "map",
                         "googleTile": false,
                         "marCenter" : {
                             "lat": 51.511011,
                             "lng": -0.125448
                         },
                        "floatPanel": true,
                        "tripgoApiKey": "your TripGo API key"
                     }
                     
                    L.tripgoRouting.mapLayer.initialize(options);
                </script> 
            [...]



   - options structure

        |option name  |default|comment|
        |----------- |-------  |------------|
        |mapId   |  "map" | Reference to the ***map box id*** defined in html code on map definition |
        |googleTile | true | If true the map will adopt Google Tile, if false the map will adopt OSM tile|
        |mapCenter | <pre> {"lat": -33.8650319, "lng": 151.2039176 } </pre> |Map point location. By default in Sydney, Australia.|
        |floatPanel | false |Change results panel style to float over the map|
        |tripgoApiKey| Global TripGo api key |Key provided by ***TripGo API***. If tripgoApiKey field is absent, ***TripGo*** backend responds getting a global api key for leaflet. Notice that if you don't ask for your own free api key, the plugin will work sharing the quota limit with other users in same situation.| 
    
    

# Usage & examples

***Sydney***

- Default Configuration
![TripGoRouting](images/tripgoRouting.jpg)

- Float Configuration
![TripGoRouting](images/tripgoRoutingFloatPanel.jpg)

***London***

![TripGoRouting](images/tripgoRouting2.jpg)
 
   
# DEMO

 https://skedgo.github.io/tripkit-leaflet/    
   
# Npm

 <pre> npm install tripkit-leaflet </pre>

