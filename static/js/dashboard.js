function styleMapFeature(feature) {
    var active = feature.properties.iso_a2 in active_countries
        || feature.properties.iso_a3 in active_countries;

    return {
        fillColor: active?'#d35400':'#ecf0f1',
        weight: 1.4,
        opacity: 1,
        color: '#2980b9',
        dashArray: '3',
        fillOpacity: 0.9
    };
}

function onEachMapFeature(feature, layer) {
    var active = feature.properties.iso_a2 in active_countries
        || feature.properties.iso_a3 in active_countries;
    if (active) {
        layer.bindLabel(feature.properties.name);
    }

    layer.on('click', function() {
        if (feature.properties.iso_a2 in crises_per_country)
            loadTimetableForCountry(feature.properties.iso_a2);
        else if (feature.properties.iso_a3 in crises_per_country)
            loadTimetableForCountry(feature.properties.iso_a3);
    });
}

var active_countries = {};

$(document).ready(function(){

    // Selectize
    $("#country-filter").selectize();
    $("#date-created-filter").selectize();
    $("#disaster-type-filter").selectize();

    // Get active countries list from active crises list
    for (var i=0; i<active_crises.length; ++i) {
        var crisis = active_crises[i];
        for (var j=0; j<crisis.countries.length; ++j) {
            var country = crisis.countries[j].code;
            if (!active_countries[country])
                active_countries[country] = []
            active_countries[country].push(crisis) ;
        }
    }

    // Show the map
    var map = L.map('the-map').setView([41.87, 12.6], 2);
    map.scrollWheelZoom.disable();

    // Toggle scroll-zoom by clicking on and outside map
    map.on('focus', function() { map.scrollWheelZoom.enable(); });
    map.on('blur', function() { map.scrollWheelZoom.disable(); });

    // Load countries geojson in the map
    
    $.getJSON('/static/files/countries.geo.json', function(data) {
        var layer = L.geoJson(data, {
            style: styleMapFeature,
            onEachFeature: onEachMapFeature
        }).addTo(map);
    });

    // Load the weekly report timetable
    loadTimetable();

    $("#back-btn").click(function() {
        loadTimetable();
    });
});

function loadTimetable() {
    var table = $("#timeline-table");
    table.find('thead').find('tr').empty();
    table.find('tbody').empty();

    $("<td class='first-td'>Countries</td>").appendTo(table.find('thead').find('tr'));
    // Week headers
    for (var i=0; i<weekly_reports.length; ++i) {
        var range = formatDate(weekly_reports[i].start_date) + " to " + formatDate(weekly_reports[i].end_date);
        var td = $("<td class='week-id' data-toggle='tooltip' title='" + range + "'>W" + (i+1) + "</td>");
        td.appendTo(table.find('thead').find('tr'));
    }

    // Country rows
    for (var countryCode in countries) {
        var tr = $("<tr class='country-data'></tr>");
        tr.appendTo(table.find('tbody'));

        var td = $("<td class='country-name'>" + countries[countryCode] + "</td>");
        td.appendTo(tr);

        td.unbind().click(function(countryCode) {
            return function() {
                loadTimetableForCountry(countryCode);
            }
        }(countryCode));

        // Country reports
        for (var i=0; i<weekly_reports.length; ++i) {
            var td = $("<td class='weekly-report'></td>");
            td.appendTo(tr);

            if (weekly_reports[i].countries.indexOf(countryCode) >= 0)
                td.addClass('active');
        }
    }

    $("#back-btn").hide();
}

function loadTimetableForCountry(countryCode) {
    var table = $("#timeline-table");
    table.find('thead').find('tr').empty();
    table.find('tbody').empty();

    $("<td class='first-td'>" + countries[countryCode] + "</td>").appendTo(table.find('thead').find('tr'));
    // Week headers
    for (var i=0; i<weekly_reports.length; ++i) {
        var range = formatDate(weekly_reports[i].start_date) + " to " + formatDate(weekly_reports[i].end_date);
        var td = $("<td class='week-id' data-toggle='tooltip' title='" + range + "'>W" + (i+1) + "</td>");
        td.appendTo(table.find('thead').find('tr'));
    }

    // Crisis headers
    var crises = crises_per_country[countryCode];
    for (var crisisPk in crises) {
        var tr = $("<tr class='country-data'></tr>");
        tr.appendTo(table.find('tbody'));

        var td = $("<td class='country-name'>" + crises[crisisPk] + "</td>");
        td.appendTo(tr);

        // Crisis reports
        for (var i=0; i<weekly_reports.length; ++i) {
            var td = $("<td class='weekly-report'></td>");
            td.appendTo(tr);

            for (var j=0; j<weekly_reports[i].countries.length; ++j) {
                if (weekly_reports[i].countries[j] == countryCode) {
                    if (weekly_reports[i].crises[j] == crisisPk) {
                        td.addClass('active');
                    }
                }
            }
        }
    }


    $("#back-btn").show();
}
