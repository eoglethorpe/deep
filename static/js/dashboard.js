
function hashString(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
       hash = str.charCodeAt(i) + ((hash << 4) - hash);
    }
    return hash;
}

function generateColor(str) {
    return 'hsl(' + hashString(str)%360 + ', 30%, 50%)';
}

function styleMapFeature(feature) {
    var active = feature.properties.iso_a2 in active_countries || feature.properties.iso_a3 in active_countries;
    var color_temp = '#ecfof1';

    if(active && (feature.properties.iso_a2 in active_countries)){
        if(active_countries[feature.properties.iso_a2][0].status == '0'){
            color_temp = '#3992fd';
        }
        else{
            color_temp = '#f44336';
        }
    }
    if(active && (feature.properties.iso_a3 in active_countries)){
        if(active_countries[feature.properties.iso_a3][0].status == '0'){
            color_temp = '#3992fd';
        }
        else{
            console.log(feature.properties.iso_a3);
            color_temp = '#f44336';
        }
    }

    return {
        fillColor: active?color_temp:'#ecf0f1',
        weight: 1.4,
        opacity: 1,
        color: '#37373b',
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

var dateFilterSelectize;
var dateFilter = null;
var dateFilterSelection;

function buildFilters() {
    $('#country-filter').change(function() {
        if (timetable == 'all')
            loadTimetable();
        else
            loadTimetableForCountry(timetable);
    });

    $('#disaster-type-filter').change(function() {
        if (timetable == 'all')
            loadTimetable();
        else
            loadTimetableForCountry(timetable);
    });

    $('#date-created-filter').change(function() {
        var filterBy = $(this).val();
        if (filterBy == 'range') {
            $('#date-range-input').modal();
            $('#date-range-input #ok-btn').unbind().click(function(){
                var startDate = new Date($('#date-range-input #start-date').val());
                var endDate = new Date($('#date-range-input #end-date').val());
                dateFilter = function(date) {
                    return dateInRange(new Date(date), startDate, endDate);
                };

                if (timetable == 'all')
                    loadTimetable();
                else
                    loadTimetableForCountry(timetable);
            });
            $('#date-range-input #cancel-btn').unbind().click(function(){
                dateFilterSelectize[0].selectize.setValue(dateFilterSelection);
            });
        } else if (filterBy == '' || filterBy == null) {
            dateFilter = function(date) { return true; }
        } else {
            dateFilter = function(date) {
                return filterDate(filterBy, new Date(date));
            }
            dateFilterSelection = filterBy;
        }

        if (timetable == 'all')
            loadTimetable();
        else
            loadTimetableForCountry(timetable);
    });
}

var active_countries = {};
var filtered_reports = {};
var active_crises_number = 0;
var global_monitoring_number = 0;

$(document).ready(function(){
    $('#timeline-table-container').on('scroll' ,function(){
        $('#timeline-table-col0-container').scrollTop($(this).scrollTop());
    });

    buildFilters();

    // Selectize
    $("#country-filter").selectize();
    dateFilterSelectize = $("#date-created-filter").selectize();
    $("#disaster-type-filter").selectize();

    // Get active countries list from active crises list
    for (var i=0; i<active_crises.length; ++i) {
        var crisis = active_crises[i];
        for (var j=0; j<crisis.countries.length; ++j) {
            var country = crisis.countries[j].code;
            if (!active_countries[country])
                active_countries[country] = []
            active_countries[country].push(crisis) ;
            if(crisis.status == '0'){
                global_monitoring_number+=1;
            }
            else{
                active_crises_number+=1;
            }
        }
    }

    $("#number-of-active-crisises span").text(active_crises_number);
    $("#number-of-global-monitoring span").text(global_monitoring_number);

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

    $("#body").on('click', '#back-btn', function(){
        loadTimetable();
    });
});

var timetable;
function loadTimetable() {
    timetable = 'all';

    $('#timeline-table-container, #timeline-table-col0-container').slideUp('fast', function(){
        var table = $("#timeline-table");
        var tableCol0 = $("#timeline-table-col0");
        table.removeClass('country-details');
        tableCol0.removeClass('country-details');
        table.find('thead').find('tr').empty();
        tableCol0.find('thead').find('tr').empty();
        table.find('tbody').empty();
        tableCol0.find('tbody').empty();

        var hd = $("<td class='overlay-td'>Countries</td>");
        hd.appendTo(tableCol0.find('thead').find('tr'));

        // Week headers
        for (var i=0; i<weekly_reports.length; ++i) {
            var range = formatDate(weekly_reports[i].start_date) + " to " + formatDate(weekly_reports[i].end_date);
            var td = $("<td class='week-id' data-toggle='tooltip' title='" + range + "'>" + weekly_reports[i].label + "</td>");
            td.appendTo(table.find('thead').find('tr'));
        }

        var countryFilter = $('#country-filter').val();
        var disasterFilter = $('#disaster-type-filter').val();

        // Country rows
        for (var countryCode in countries) {
            var tr = $("<tr class='country-data'></tr>");
            var trCol0 = $("<tr class='country-data'></tr>");

            var td = $("<td class='overlay-td country-name'>" + countries[countryCode] + "</td>");
            td.appendTo(trCol0);

            td.unbind().click(function(countryCode) {
                return function() {
                    loadTimetableForCountry(countryCode);
                }
            }(countryCode));

            var hasReports = false;

            // Country reports
            for (var i=0; i<weekly_reports.length; ++i) {
                var td = $("<td class='weekly-report'></td>");
                td.appendTo(tr);

                if (countryFilter == null || countryFilter.indexOf(countryCode) >= 0) {
                    var index = weekly_reports[i].countries.indexOf(countryCode);
                    if (index >= 0) {
                        if ((disasterFilter == null || disasterFilter.indexOf(weekly_reports[i].data[index].disaster_type) >= 0)
                                && (dateFilter == null || dateFilter(weekly_reports[i].created_at[index])))
                        {
                            hasReports = true;
                            td.addClass('active');
                            td.click(function(countryCode, eventId, reportId) {
                                return function(){
                                   window.location.href = '/report/weekly/edit/' + countryCode + '/' + eventId + '/' + reportId;
                                }
                            }(countryCode, weekly_reports[i].crises[index], weekly_reports[i].report_ids[index]));
                        }
                    }
                }
            }

            if (hasReports) {
                tr.appendTo(table.find('tbody'));
                trCol0.appendTo(tableCol0.find('tbody'));
                tableCol0.css('width', '100%');
            }
        }

        $('#timeline-table-container, #timeline-table-col0-container').slideDown(function() {
            $('#timeline-table-container').scrollLeft($('#timeline-table').width());
        });
    });
    //$("#back-btn").hide();
}

function loadTimetableForCountry(countryCode) {
    timetable = countryCode;

    $('#timeline-table-container, #timeline-table-col0-container').slideUp('fast', function(){
        var table = $("#timeline-table");
        var tableCol0 = $("#timeline-table-col0");
        table.addClass('country-details')
        tableCol0.addClass('country-details')
        table.find('thead').find('tr').empty();
        tableCol0.find('thead').find('tr').empty();
        table.find('tbody').empty();
        tableCol0.find('tbody').empty();

        var cctd = $("<td class='overlay-td'>" + '<a id="back-btn" title="Back to countries" data-toggle="tooltip" style="float:left" class="fa fa-arrow-left"></a>'+ countries[countryCode] + "</td>");
        cctd.appendTo(tableCol0.find('thead').find('tr'));

        // Week headers
        for (var i=0; i<weekly_reports.length; ++i) {
            var range = formatDate(weekly_reports[i].start_date) + " to " + formatDate(weekly_reports[i].end_date);
            var td = $("<td class='week-id' data-toggle='tooltip' title='" + range + "'>" + weekly_reports[i].label + "</td>");
            td.appendTo(table.find('thead').find('tr'));
        }

        var countryFilter = $('#country-filter').val();
        var disasterFilter = $('#disaster-type-filter').val();

        // Crisis headers
        var crises = crises_per_country[countryCode];
        for (var crisisPk in crises) {
            var tr = $("<tr class='country-data'></tr>");
            var trCol0 = $("<tr class='country-data'></tr>");
            tr.appendTo(table.find('tbody'));
            trCol0.appendTo(tableCol0.find('tbody'));

            var td = $("<td class='country-name overlay-td'>" + crises[crisisPk] + "</td>");
            td.appendTo(trCol0);
            td.data('top', td.css('top'));

            // Crisis reports
            for (var i=0; i<weekly_reports.length; ++i) {
                var td = $("<td class='weekly-report'></td>");
                td.appendTo(tr);

                if ((countryFilter == null || countryFilter.indexOf(countryCode) >= 0)) {
                    for (var j=0; j<weekly_reports[i].countries.length; ++j) {
                        if (weekly_reports[i].countries[j] == countryCode) {
                            if (weekly_reports[i].crises[j] == crisisPk) {
                                if ((disasterFilter == null || disasterFilter.indexOf(weekly_reports[i].data[j].disaster_type) >= 0)
                                        && (dateFilter == null || dateFilter(weekly_reports[i].created_at[j])))
                                {
                                    td.addClass('active');

                                    td.click(function(countryCode, eventId, reportId) {
                                        return function(){
                                            window.location.href = '/report/weekly/edit/' + countryCode + '/' + eventId + '/' + reportId;
                                        }
                                    }(countryCode, crisisPk, weekly_reports[i].report_ids[j]));
                                }
                            }
                        }
                    }
                }
            }
        }

        $('#timeline-table-container, #timeline-table-col0-container').slideDown(function() {
            $('#timeline-table-container').scrollLeft($('#timeline-table').width());
        });
    });
    $("#back-btn").show();
}

// Checks if the date is in given range
function dateInRange(date, min, max){
    date.setHours(0, 0, 0, 0);
    min.setHours(0, 0, 0, 0);
    max.setHours(0, 0, 0, 0);
    return (date >= min && date <= max);
}

function filterDate(filter, date){
    dateStr = date.toDateString();
    switch(filter){
        case "today":
            return (new Date()).toDateString() == dateStr;
        case "yesterday":
            yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            return yesterday.toDateString() == dateStr;
        case "last-seven-days":
            min = new Date();
            min.setDate(min.getDate() - 7);
            return dateInRange(date, min, (new Date));
        case "this-week":
            min = new Date();
            min.setDate(min.getDate() - min.getDay());
            return dateInRange(date, min, (new Date));
        case "last-thirty-days":
            min = new Date();
            min.setDate(min.getDate() - 30);
            return dateInRange(date, min, (new Date));
        case "this-month":
            min = new Date();
            min.setDate(1);
            return dateInRange(date, min, (new Date));
        default:
            return true;
    }
}
