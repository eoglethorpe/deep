var locations = {};

var adminLevels = {};
var adminLevelNames = {};
var adminLevelPropNames = {};
var adminLevelPropPcodes = {};
var nameLayerMapping = {};
var currentLevel = 0;
var selectedCountry = "";
var layer;
var mapColors = ['#008080','#80d0d0','#FFEB3B'];

var map;
var selectingAllMapItems = false;
var unselectingAllMapItems = false;

$(document).ready(function(){
    map = L.map('the-map');
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
});

// $('#map-modal').on('shown.bs.modal', function() {
//     //console.log("shown");
//     map.invalidateSize();
//     refreshMap();
// });


function selectAllMapFeatures() {
    if (layer) {
        selectingAllMapItems = true;
        layer.getLayers().forEach(e => {
            e.fireEvent('click');
        });
        selectingAllMapItems = false;
        updateLocationSelections();

        $('#the-map').click();
    }
}

function unselectAllMapFeatures() {
    if (layer) {
        unselectingAllMapItems = true;
        layer.getLayers().forEach(e => {
            e.fireEvent('click');
        });
        unselectingAllMapItems = false;
        updateLocationSelections();
    }
}


function getAdminLevels(countryCode) {
    $.getJSON("/api/v1/countries/"+countryCode, function(data) {
        levels = Object.keys(data["admin_levels"]);
        levels.sort();

        locations = Object.assign({}, locations, data.locations);
        refreshLocations();

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

function updateLayer(selectionName) {

    var color1 = mapColors[0];  // default color
    // var color2 = getColor(30, 70);  // mouse-hover color
    var color3 = mapColors[2];   // selection-color;

    var layer = nameLayerMapping[selectionName];
    if(layer){
        layer.setStyle({
            fillColor: (mapSelections.indexOf(selectionName) == -1)?color1:color3,
            fillOpacity:'0.55'
        });
    }

    var level = (selectionName.split(':')[1]) << 0;
    if (level != currentLevel) {
        currentLevel = level;
        refreshMap();
    }
    updateLocationSelections();
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

    layer.setStyle({
        fillColor: (mapSelections.indexOf(selectionName) == -1)?color1:color3,
        fillOpacity:'0.55',
        opacity: 1,
    });

    layer.on('mouseover', function() {
        this.setStyle({
            fillOpacity:'0.15'
        });
    });
    layer.on('mouseout', function() {
        this.setStyle({
            fillOpacity:'0.55'
        });
    });

    layer.on('click', function() {
        var index = mapSelections.indexOf(selectionName);
        if (index == -1 && !unselectingAllMapItems) {
            mapSelections.push(selectionName);
            this.setStyle({
                fillColor: color3,
            });
        }
        else if (!selectingAllMapItems) {
            mapSelections.splice(index, 1);
            this.setStyle({
                fillColor: color1,
            });
        }

        if (!selectingAllMapItems && !unselectingAllMapItems) {
            updateLocationSelections();
        }
    });

    layer.bindTooltip(name, { sticky: true });
}


function refreshMap() {
    if (layer) {
        layer.clearLayers();
    }

    if (!(selectedCountry in adminLevels) || (adminLevels[selectedCountry][currentLevel] == null)) {
        return;
    }

    layer = L.geoJson(adminLevels[selectedCountry][currentLevel], {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {});
        },
        onEachFeature: onEachMapFeature
    }).addTo(map);

    $("#admin-level-buttons button").removeClass("active");
    $("#btn-lvl-"+currentLevel).addClass("active");

    map.fitBounds(layer.getBounds());
    refreshLocations();
}


function refreshAdminLevels() {
    $("#admin-level-buttons").empty();

    if (selectedCountry in adminLevels) {
        for (var i=0; i<adminLevelNames[selectedCountry].length; ++i) {
            var btn = $("<button id='btn-lvl-" + i + "'>" + adminLevelNames[selectedCountry][i] + "</button>");
            btn.on('click', function(level) { return function() {   // closure shit
                currentLevel = level;
                refreshMap();
            }}(i));
            $("#admin-level-buttons").append(btn);
        }
    }

    for (var k in adminLevels) {
        for (var i in adminLevels[k]) {
            if (adminLevels[k][i] != null) {
                var features = adminLevels[k][i]["features"];
                for (var j in features) {
                    if ("properties" in features[j]) {
                        var properties = features[j]["properties"];
                        var propName = adminLevelPropNames[k][i];
                        var propPcode = adminLevelPropPcodes[k][i];

                        var name = properties[propName];
                        var selectionName = k +":"+ i +":"+ name;

                        if (propPcode != "" && properties[propPcode] != "")
                            selectionName += ":" + properties[propPcode]

                        locations[selectionName] = name;
                    }
                }
            }
        }
    }

    refreshMap();
}
