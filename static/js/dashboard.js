var dateRangeInputModal = null;

var active_countries = {};
var filtered_reports = {};
var active_crises_number = 0;
var global_monitoring_number = 0;

var dateFilterSelectize;
var dateFilter = null;
var dateFilterSelection;

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
            loadTimetable(feature.properties.iso_a2);
        else if (feature.properties.iso_a3 in crises_per_country)
            loadTimetable(feature.properties.iso_a3);
    });
}

function buildFilters() {
    $('#country-filter').change(function() {
        loadTimetable(timetableFor);
    });

    $('#disaster-type-filter').change(function() {
        loadTimetable(timetableFor);
    });

    $('#date-created-filter').change(function() {
        var filterBy = $(this).val();
        if (filterBy == 'range') {
            $.when(dateRangeInputModal.show()).then(function(){
                if(dateRangeInputModal.action == 'proceed'){
                    var startDate = new Date($('#date-range-input #start-date').val());
                    var endDate = new Date($('#date-range-input #end-date').val());
                    dateFilter = function(date) {
                        return dateInRange(new Date(date), startDate, endDate);
                    };

                    loadTimetable(timetableFor);
                } else{
                    dateFilterSelectize[0].selectize.setValue(dateFilterSelection);
                }
            });
        } else if (filterBy == '' || filterBy == null) {
            dateFilter = function(date) { return true; }
        } else {
            dateFilter = function(date) {
                return filterDate(filterBy, new Date(date));
            }
            dateFilterSelection = filterBy;
        }

        loadTimetable(timetableFor);
    });
}


$(document).ready(function(){
    dateRangeInputModal = new Modal('#date-range-input');

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
    loadTimetable('all');

    $("#body").on('click', '#back-btn', function(){
        loadTimetable('all');
    });
});

let timetableFor;
function loadTimetable(tableFor) {
    timetableFor = tableFor;

    let title = $('#timeline-table header .aside');
    if (timetableFor == 'all') {
        title.html('Countries');
        title.unbind();
    } else {
        title.html('<i class="fa fa-arrow-left"></i>' + countries[timetableFor] + '');
        title.unbind().click(function() {
            loadTimetable('all');
        });
    }

    let weekHeaderContainer = $('#timeline-table').find('header').find('.weeks');
    weekHeaderContainer.empty();

    // Week headers
    for (let i=0; i<weekly_reports.length; ++i) {
        let range = formatDate(weekly_reports[i].start_date) + " to " + formatDate(weekly_reports[i].end_date);
        let week = $("<div class='week' title='" + range + "'>" + weekly_reports[i].label + "</div>");
        week.appendTo(weekHeaderContainer);
    }

    // Countries
    let reportElementTemplate = $('.report-template').clone();
    reportElementTemplate.removeClass('report-template');
    reportElementTemplate.addClass('report');
    let reportContainer = $('#reports');
    reportContainer.empty();

    var countryFilter = $('#country-filter').val();
    var disasterFilter = $('#disaster-type-filter').val();

    if (timetableFor == 'all') {
        // Load reports for all countries
        for (let countryCode in countries) {
            let reportElement = reportElementTemplate.clone();
            reportElement.find('.aside').text(countries[countryCode]);
            reportElement.find('.aside').click(function() {
                loadTimetable(countryCode);
            });
            let weekElementTemplate = $('<div class="week"></div>');
            let weekContainer = reportElement.find('.weeks');

            let hasReports = false;

            for (let i=0; i<weekly_reports.length; ++i) {
                let weekElement = weekElementTemplate.clone();
                if (countryFilter == null || countryFilter.indexOf(countryCode) >= 0) {
                    let index = weekly_reports[i].countries.indexOf(countryCode);
                    if (index >= 0) {
                        if ((disasterFilter == null || disasterFilter.indexOf(weekly_reports[i].data[index].disaster_type) >= 0)
                        && (dateFilter == null || dateFilter(weekly_reports[i].created_at[index])))
                        {
                            weekElement.addClass('active');
                            weekElement.click(function(countryCode, eventId, reportId) {
                                return function(){ window.location.href = '/report/weekly/edit/' + countryCode + '/' + eventId + '/' + reportId; }
                            }(countryCode, weekly_reports[i].crises[index], weekly_reports[i].report_ids[index]));
                            hasReports = true;
                        }
                    }
                }
                weekElement.appendTo(weekContainer);
            }

            if (hasReports) {
                reportElement.appendTo(reportContainer);
                reportElement.show();
            }
        }
    } else {
        let countryCode = timetableFor;
        // Load reports for given country
        let crises = crises_per_country[countryCode];
        for (let crisisPk in crises) {
            // Crisis header
            let reportElement = reportElementTemplate.clone();
            reportElement.find('.aside').text(crises[crisisPk]);
            let weekElementTemplate = $('<div class="week"></div>');
            let weekContainer = reportElement.find('.weeks');

            // Crisis reports
            for (let i=0; i<weekly_reports.length; i++) {
                let weekElement = weekElementTemplate.clone();

                if (countryFilter == null || countryFilter.indexOf(countryCode) >= 0) {
                    for (let j=0; j<weekly_reports[i].countries.length; j++) {
                        if (weekly_reports[i].countries[j] == countryCode && weekly_reports[i].crises[j] == crisisPk) {
                            if ((disasterFilter == null || disasterFilter.indexOf(weekly_reports[i].data[j].disaster_type) >= 0) && (dateFilter == null || dateFilter(weekly_reports[i].created_at[j]))) {
                                weekElement.addClass('active');
                                weekElement.click(function(countryCode, eventId, reportId) {
                                    return function(){
                                        window.location.href = '/report/weekly/edit/' + countryCode + '/' + eventId + '/' + reportId;
                                    }
                                }(countryCode, crisisPk, weekly_reports[i].report_ids[j]));
                            }
                        }
                    }
                }
                weekElement.appendTo(weekContainer);
            }
            reportElement.appendTo(reportContainer);
            reportElement.show();
        }
    }
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
