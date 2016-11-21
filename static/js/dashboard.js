function styleMapFeature(feature) {
    var active = feature.properties.name in active_countries;

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
    var active = feature.properties.name in active_countries;

    if (active) {
        layer.bindLabel(feature.properties.name);
    }
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
            var country = crisis.countries[j].name;
            if (!active_countries[country])
                active_countries[country] = []
            active_countries[country].push(crisis) ;
        }
    }

    // Show the map
    var map = L.map('the-map').setView([41.87, 12.6], 2);
    // Load countries geojson in the map
    $.getJSON('/static/files/countries.geo.json', function(data) {
        var layer = L.geoJson(data, {
            style: styleMapFeature,
            onEachFeature: onEachMapFeature
        }).addTo(map);
    });

    // Load the weekly report timetable
    loadTimetable();
});

function loadTimetable() {
    var table = $("#timeline-table");
    table.find('thead').find('tr').empty();
    table.find('tbody').empty();

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

        // Country reports
        for (var i=0; i<weekly_reports.length; ++i) {
            var td = $("<td class='weekly-report'></td>");
            td.appendTo(tr);

            if (weekly_reports[i].countries.indexOf(countryCode) >= 0)
                td.addClass('active');
        }
    }
}


// TODO: Send these to utils.js
function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [day, month, year].join('-');
}

function formatTime(time) {
    var d = new Date(time),
        hr = '' + (d.getHours() + 1),
        min = '' + d.getMinutes(),
        sec = d.getSeconds();

    if (hr.length < 2) hr = '0' + hr;
    if (min.length < 2) min = '0' + min;
    if (sec.length < 2) sec = '0' + sec;

    return [hr, min].join(':') + "<span hidden>"+sec+"</span>";
}
