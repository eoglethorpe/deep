var levels = [];
var adminLevels = {};
var adminLevelNames = {};
var adminLevelPropNames = {};
var adminLevelPropPcodes = {};
var nameLayerMapping = {};
var currentLevel = 0;
var selectedCountry = "";
var layer;
var mapColors = ['#008080','#80d0d0','hsl(48, 89%, 50%)', 'rgba(0,0,0,0.6)'];
var map;

var mapSelections = [];
var mapNumEntries = [];
var maxNumEntries = 0;
var totalNumEntries = 0;


function loadMap() {
    $("#country").selectize();

    map = L.map('the-map');
    L.tileLayer('https://data.humdata.org/crisis-tiles/{z}/{x}/{y}.png').addTo(map);

    map.scrollWheelZoom.disable();

    // Toggle scroll-zoom by clicking on and outside map
    map.on('focus', function() { map.scrollWheelZoom.enable(); });
    map.on('blur', function() { map.scrollWheelZoom.disable(); });

    // On country selected, fetch the admin levels data.
    $("#country").on('change', function(e) {
        var optionSelected = $("option:selected", this);
        var valueSelected = this.value;
        if (valueSelected != "") {
            selectedCountry = valueSelected;
            refreshAdminLevels();
            getAdminLevels(valueSelected);
        }
    });

    $("#country").trigger('change');
}

function reloadMap() {
    mapSelections = [];
    mapNumEntries = [];
    maxNumEntries = 1;
    totalNumEntries = 0;

    for (var i=0; i<entries.length; i++) {
        for (var j=0; j<entries[i].informations.length; j++) {
            var info = entries[i].informations[j];
            totalNumEntries++;

            for (var k=0; k<info.map_selections.length; k++) {
                var ms = info.map_selections[k];

                var index = mapSelections.indexOf(ms.keyword);
                if (index >= 0) {
                    mapNumEntries[index]++;
                    if (mapNumEntries[index] > maxNumEntries)
                        maxNumEntries = mapNumEntries[index];
                }
                else {
                    mapSelections.push(ms.keyword);
                    mapNumEntries.push(1);
                }
            }
        }
    }
    refreshMap();
}


function getAdminLevels(countryCode) {
    $.getJSON("/api/v1/countries/"+countryCode, function(data) {
        levels = Object.keys(data["admin_levels"]);
        levels.sort();

        // Fill the admin level data in the appropriate arrays.
        adminLevels[countryCode] = [];
        adminLevelNames[countryCode] = [];
        adminLevelPropNames[countryCode] = [];
        adminLevelPropPcodes[countryCode] = [];

        for (var i=0; i<levels.length; ++i) {
            var level = data["admin_levels"][levels[i]];
            adminLevelNames[countryCode].push(level[0]);
            adminLevelPropNames[countryCode].push(level[1]);
            adminLevelPropPcodes[countryCode].push(level[3]);

            adminLevels[countryCode].push(null);

            var jsonadder = function(countryCode, index) {
                return function(kdata){
                    adminLevels[countryCode][index] = kdata;
                    refreshAdminLevels();
                }
            }(countryCode, adminLevels[countryCode].length-1);

            $.getJSON(level[2], jsonadder);
        }

        refreshAdminLevels();
    });
}


function onEachMapFeature(feature, layer) {
    var isSelected = false;

    var propName = adminLevelPropNames[selectedCountry][currentLevel];
    var propPcode = adminLevelPropPcodes[selectedCountry][currentLevel];
    var name = "";
    var pcode = "";

    if (feature.properties) {
        if (feature.properties[propName])
            name = feature.properties[propName];
        if (propPcode != "" && feature.properties[propPcode])
            pcode = feature.properties[propPcode];
    }

    var selectionName = selectedCountry+":"+currentLevel+":"+name;
    if (pcode != "")
        selectionName += ":" + pcode;

    nameLayerMapping[selectionName] = layer;

    var color1 = mapColors[0];  // default color
    var color2 = mapColors[1];  // mouse-hover color
    var color3 = mapColors[2];    // selection-color;

    var index = mapSelections.indexOf(selectionName);

    if (index >= 0) {
        var areas = $('#areas-filter').val();
        if (areas && areas.indexOf(name) >= 0) {
            color3 = mapColors[3];
        }
        else {
            var l = (100-mapNumEntries[index]/maxNumEntries * 100); // (10+mapNumEntries[index])/(10+maxNumEntries);
            l = l*(85-15)/100 + 15;
            color3 = 'hsl(48, 89%, ' + l + '%)';
        }
    }

    layer.setStyle({
        fillColor: (index < 0)?color1:color3,
        fillOpacity: 0.60,
        opacity: 1,
    });

    layer.on('mouseover', function() {
        this.setStyle({
            fillOpacity: 0.25
        });
    });
    layer.on('mouseout', function() {
        this.setStyle({
            fillOpacity:0.60
        });
    });

    // Filter on selection
    if (index >= 0) {
        layer.on('click', function(name) {
            return function(){
                var areas = $('#areas-filter').val();
                if (!areas)
                    areas = [];
                if (areas.indexOf(name) >= 0) {
                    areas.splice(areas.indexOf(name), 1);
                } else {
                    areas.push(name);
                }
                areasSelectize[0].selectize.setValue(areas);
            }
        }(name));
    }

    if (index < 0)
        layer.bindTooltip(name, { sticky: true });
    else {
        var p = Math.round(mapNumEntries[index]/totalNumEntries*100);
        layer.bindTooltip(name + " - " + mapNumEntries[index] + " (" + p + "%)",
            { sticky: true });
    }
}


function refreshMap() {
    if (layer) {
        layer.clearLayers();
    }

    if (!(selectedCountry in adminLevels)) {
        return;
    }

    if (adminLevels[selectedCountry][currentLevel] == null) {
        return;
    }


    layer = L.geoJson(adminLevels[selectedCountry][currentLevel], {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {});
        },
        onEachFeature: onEachMapFeature
    }).addTo(map);

    $("#admin-level-buttons button").removeClass("active-btn");
    $("#btn-lvl-"+currentLevel).addClass("active-btn");

    if (layer) {
        try {
            map.fitBounds(layer.getBounds());
        } catch (e) {
            console.log(e);
        }
    }
}


function refreshAdminLevels() {
    $("#admin-level-buttons").empty();
    var totalWidth = 0;
    if (selectedCountry in adminLevels) {
        for (var i=0; i<adminLevelNames[selectedCountry].length; ++i) {
            var btn = $("<button id='btn-lvl-" + i + "'>" + adminLevelNames[selectedCountry][i] + "</button>");
            btn.on('click', function(level) { return function() {   // closure shit
                currentLevel = level;
                refreshMap();
            }}(i));
            $("#admin-level-buttons").append(btn);
            totalWidth += $("#btn-lvl-"+i).width();
        }
        // $("#map-controls").width(totalWidth+200);
        // $("#map-controls").css("left",($("#the-map").width()-$("#map-controls").width())/2);
    }

    refreshMap();
}
