var map = L.map('map').setView([41, -95], 4);

// set a tile layer to be CartoDB tiles 
var CartoDBTiles = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',{
  attribution: 'Map Data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> Contributors, Map Tiles &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
});

// add these tiles to our map
map.addLayer(CartoDBTiles);

// set data layer as global variable so we can use it in the layer control below
var stateGeoJSON;


// use jQuery get geoJSON to grab geoJson layer, parse it, then plot it on the map using the plotDataset function
$.getJSON( "data/state.geo.json", function( data ) {
    var dataset = data;
    // draw the dataset on the map
    plotDataset(dataset);
    //create the sidebar with links to fire polygons on the map
    // createListForClick(dataset);
    $.getJSON('data/specialties.json', function(data){
        var dataset = data;
        createListForClick(dataset);
    });
});

// function to plot the dataset passed to it
function plotDataset(dataset) {
    // var ordinalScale = setUpD3Scale(dataset);

    stateGeoJSON = L.geoJson(dataset, {
        style: stateStyle,
        onEachFeature: onEachFeature
    }).addTo(map);

    // create layer controls
    // createLayerControls(); 
}

// function that sets the style of the geojson layer
var stateStyle = function (feature, latlng) {

    // var calc = calculatePercentage(feature);

    var style = {
        weight: 1,
        opacity: .25,
        color: 'grey',
        fillOpacity: 0.7,
        fillColor: fillColorBreaks(feature.properties.ALAND10)
        // fillColor: fillColorPercentage(calc.percentage)
    };

    return style;

}

// function that fills polygons with color based on the data
function fillColorBreaks(d) {
    return d > 276961878670 ? '#2c7fb8' :
           d > 176961878670 ? '#7fcdbb' :
           // d > 5 ? '#74c476' :
           // d > 3 ? '#a1d99b' :
           // d > 1 ? '#c7e9c0' :
                   '#edf8b1';
}

// empty L.popup so we can fire it outside of the map
var popup = new L.Popup();

var onEachFeature = function(feature,layer){
    // var calc = calculatePercentage(feature);
    // console.log(feature);
    $.getJSON("data/xwalk.json", function(data){

        // let's bind some feature properties to a pop up with an .on("click", ...) command. We do this so we can fire it both on and off the map
        layer.on("click", function (e) {
            // console.log(feature);
            var state = data[feature.properties.STATEFP10][0]['STATE'];
            // console.log(state);
            // lets add data from the API now
            // set a global variable to use in the D3 scale below
            // use jQuery geoJSON to grab data from API
            var url = "https://npiregistry.cms.hhs.gov/api?number=&enumeration_type=NPI-1&limit=1&taxonomy_description="+specialtySelect+"&state="+state;
            // console.log(url);
            
            $.getJSON( url, function( data ) {
            // $.getJSON("https://npiregistry.cms.hhs.gov/api?city=baltimore", function( data ) {
            // $.getJSON( "https://data.cityofnewyork.us/resource/erm2-nwe9.json?$$app_token=rQIMJbYqnCnhVM9XNPHE9tj0g&borough=BROOKLYN&complaint_type=Noise&status=Open", function( data ) {
                var dataset = data;
                // draw the dataset on the map
                // console.log(dataset.results['0']);
                var fname = dataset.results['0'].basic.first_name;
                var lname = dataset.results['0'].basic.last_name;
                var credentials = dataset.results['0'].basic.credential;
                var doc = fname + ' ' + lname + ', ' +credentials;
                var fullSpecialty = dataset.results['0'].taxonomies['0'].desc;
                console.log(state + ': ' + doc);
                console.log(fullSpecialty);
                console.log("LET'S DO ANOTHER");
                var bounds = layer.getBounds();
                var popupContent = state + '<br/>' + doc + '<br/>' + fullSpecialty;
                popup.setLatLng(bounds.getCenter());
                popup.setContent(popupContent);
                map.openPopup(popup);
            });
        });

        // we'll now add an ID to each layer so we can fire the popup outside of the map
        // layer._leaflet_id = 'acsLayerID' + count;
        // count++;
    });

}

var specialtySelect = 'primary care';

// function to create a list in the right hand column with links that will launch the pop-ups on the map
function createListForClick(dataset) {
    // use d3 to select the div and then iterate over the dataset appending a list element with a link for clicking and firing
    // first we'll create an unordered list ul elelemnt inside the <div id='list'></div>. The result will be <div id='list'><ul></ul></div>

    //d3.select("#list").append('h1').text('List of Census Tracts in Brooklyn');

    // console.log(dataset);
    var ULs = d3.select("#list")
                .append("ul");


    // now that we have a selection and something appended to the selection, let's create all of the list elements (li) with the dataset we have 
    
    ULs.selectAll("li")
        .data(dataset)
        .enter()
        .append("li")
        .html(function(d) { 
            return '<a href="#">' + d.specialty + '</a>'; 
        })
        .on('click', function(d, i) {
            console.log(d.specialty+" selected");
            // console.log(i);
            // var leafletId = 'acsLayerID' + i;
            // map._layers[leafletId].fire('click');
            specialtySelect = d.specialty;
            myDiv.innerHTML = "current selection: "+specialtySelect;
        });

}

var myDiv = document.getElementById('selection');

myDiv.innerHTML += "current selection: "+specialtySelect;

// function setUpD3Scale(dataset) {
//     //console.log(dataset);
//     // create unique list of descriptors
//     // first we need to create an array of descriptors
//     var areas = [];

//     // loop through descriptors and add to descriptor array
//     $.each(dataset, function( index, value ) {
//         // descriptors.push(value.descriptor);
//         areas.push(value.properties.ALAND10)
//     });

//     // use underscore to create a unique array
//     var areasUnique = _.uniq(areas);

//     // create a D3 ordinal scale based on that unique array as a domain
//     var ordinalScale = d3.scale.category20()
//         .domain(areasUnique);

//     return ordinalScale;

// }