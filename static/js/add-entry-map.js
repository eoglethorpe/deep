var adminLevels = {};
var adminLevelNames = {};
var adminLevelPropNames = {};
var currentLevel = 0;
var selectedCountry = "";
var layer;

var map = L.map('the-map').setView([27.7, 85.3], 6);

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


function getAdminLevels(countryCode) {
    $.getJSON("/api/v1/countries/"+countryCode, function(data) {
        levels = Object.keys(data["admin_levels"]);
        levels.sort();

        // Fill the admin level data in the appropriate arrays.
        adminLevels[countryCode] = [];
        adminLevelNames[countryCode] = [];
        adminLevelPropNames[countryCode] = [];

        for (var i=0; i<levels.length; ++i) {
            var level = data["admin_levels"][levels[i]];
            adminLevelNames[countryCode].push(level[0]);
            adminLevelPropNames[countryCode].push(level[1]);
            adminLevels[countryCode].push(JSON.parse(level[2]));
        }

        refreshAdminLevels();
    });
}


function onEachMapFeature(feature, layer) {
    var isSelected = false;

    layer.setStyle({
        color: 'blue'
    });
    layer.on('mouseover', function() {
        layer.setStyle({
            color: (isSelected)?'orange':'red'
        })
    });
    layer.on('mouseout', function() {
        layer.setStyle({
            color: (isSelected)?'green':'blue'
        })
    });
}


function refreshMap() {
    if (layer) {
        layer.clearLayers();
    }

    if (!(selectedCountry in adminLevels)) {
        return;
    }

    layer = L.geoJson(adminLevels[selectedCountry][currentLevel], {
        onEachFeature: onEachMapFeature
    }).addTo(map);

    $("#admin-level-buttons button").removeClass("btn-primary");
    $("#admin-level-buttons button").addClass("btn-default");
    $("#btn-lvl-"+currentLevel).removeClass("btn-default");
    $("#btn-lvl-"+currentLevel).addClass("btn-primary");
}


function refreshAdminLevels() {
    $("#admin-level-buttons").empty();

    if (selectedCountry in adminLevels) {
        for (var i=0; i<adminLevels[selectedCountry].length; ++i) {
            var btn = $("<button id='btn-lvl-" + i + "' class='btn btn-default'>" + adminLevelNames[selectedCountry][i] + "</button>");
            btn.on('click', function(level) { return function() {   // closure shit
                currentLevel = level;
                refreshMap();
            }}(i));
            $("#admin-level-buttons").append(btn);
        }
    }
    refreshMap();
}
