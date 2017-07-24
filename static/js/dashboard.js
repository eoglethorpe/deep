var reportsGrouped = [];
var dateRangeInputModal = null;

var minStartDate = new Date();
var maxStartDate = new Date(0);
var weeks = [];

var active_countries = {};
var filtered_reports = {};
var active_projects_number = 0;
var global_monitoring_number = 0;

var dateFilterSelectize;
var dateFilter = null;
var dateFilterSelection;

var data = null;
var documentReady = false;
var reportReady = false;

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
        if (feature.properties.iso_a2 in projects_per_country)
            loadTimetable(feature.properties.iso_a2);
        else if (feature.properties.iso_a3 in projects_per_country)
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

$.getJSON("/static/api/dashboard-reports.json", function(jsonData){
    data = jsonData;
    reportReady = true;
    loadReports();
});

$(document).ready(function(){
    documentReady = true;
    loadReports();

    $('#horizontal-scroll .weeks').scroll(function(){
        $('#reports .weeks').scrollLeft($(this).scrollLeft());
        $('#timeline-table header .weeks').scrollLeft($(this).scrollLeft());

    });

    // initialize date input modal
    dateRangeInputModal = new Modal('#date-range-input');

    buildFilters();

    // Selectize
    $("#country-filter").selectize();
    dateFilterSelectize = $("#date-created-filter").selectize();
    $("#disaster-type-filter").selectize();

    // Get active countries list from active projects list
    for (var i=0; i<active_projects.length; ++i) {
        var project = active_projects[i];
        for (var j=0; j<project.countries.length; ++j) {
            var country = project.countries[j].code;
            if (!active_countries[country])
                active_countries[country] = []
            active_countries[country].push(project) ;
            if(project.status == '0'){
                global_monitoring_number+=1;
            }
            else{
                active_projects_number+=1;
            }
        }
    }

    $("#number-of-active-projectes span").text(active_projects_number);
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
            onEachFeature: onEachMapFeature,
        }).addTo(map);
    });

    $("#body").on('click', '#back-btn', function(){
        loadTimetable('all');
    });
});

function loadReports(){
    if(!documentReady || !reportReady){
        return;
    }

    let reports = data;

    reports.sort(function(a, b){
        var ca = (a.country.name + a.event.name).toUpperCase();
        var cb = (b.country.name + b.event.name).toUpperCase();
        return (ca < cb)? -1: (ca > cb)? 1: 0;
    });

    let currentCountryCode = "";
    let currentCountryEventPk = -1;
    let currentCountry;

    for(let i=0; i<reports.length; i++){
        let report = reports[i];

        if(currentCountryCode != report.country.code){
            currentCountryCode = report.country.code;
            currentCountry = {'country': report.country, 'events': [], 'weeklyReports': []};
            reportsGrouped.push(currentCountry);
            currentCountryEventPk = -1;
        }

        if(currentCountryEventPk != report.event.pk){
            currentCountryEventPk = report.event.pk
            let currentCountryEventGroupedReport = {'event': report.event, 'weeklyReports': []};
            currentCountry.events.push(currentCountryEventGroupedReport);
        }

        // include this year's report only
        if((new Date(report.start_date)).getWeekYear() == (new Date()).getFullYear()){
            currentCountry.events[currentCountry.events.findIndex(x => x.event.pk == report.event.pk)].weeklyReports.push({'startDate': report.start_date, 'data': report.data});
            currentCountry.weeklyReports.push({'startDate': report.start_date, 'data': report.data});
            report.data['created_at'] = report.last_edited_at;

            let reportStartDate = new Date(report.start_date);
            if(reportStartDate > maxStartDate){
                maxStartDate = reportStartDate;
                // console.log(report);
            }
            if(reportStartDate < minStartDate){
                minStartDate = reportStartDate;
            }
        }
    }
    while(minStartDate <= maxStartDate){
        weeks.push(new Date(minStartDate));
        minStartDate.addDays(7);
    }

    // Load the weekly report timetable
    loadTimetable('all');
}

var timetableFor;
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
    for (let i=0; i<weeks.length; ++i) {
        let weekLabel = 'W'+weeks[i].getWeek();
        let range = formatDate(weeks[i]) + " to " + formatDate(new Date(weeks[i]).addDays(6));
        let week = $("<div class='week' title='" + range + "'>" + weekLabel + "</div>");
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
        for(let i=0; i<reportsGrouped.length; i++){
            let countryCode  = reportsGrouped[i].country.code;
            if ((countryFilter == null || countryFilter.indexOf(countryCode) >= 0)) {
                let reportElement = reportElementTemplate.clone();
                reportElement.find('.aside').text(reportsGrouped[i].country.name);

                reportElement.find('.aside').click(function() {
                    loadTimetable(countryCode);
                });
                reportElement.appendTo(reportContainer);
                reportElement.show();

                let weekContainer = reportElement.find('.weeks');
                let weekElementTemplate = $('<div class="week"></div>');
                for (let j=0; j<weeks.length; ++j) {

                    let weekElement = weekElementTemplate.clone();
                    let index = reportsGrouped[i].weeklyReports.findIndex(w => new Date(w.startDate).toLocaleDateString() == weeks[j].toLocaleDateString());
                    if (index >= 0) {
                        let reportData = reportsGrouped[i].weeklyReports[index].data;
                        if ((disasterFilter == null || disasterFilter.indexOf(reportData.disaster_type) >= 0) && (dateFilter == null || dateFilter(reportData.created_at))) {
                            weekElement.addClass('active');
                        }
                    }
                    weekElement.appendTo(weekContainer);
                }
            }
        }
    } else {
        // Load reports for specified countries only
        let countryCode = timetableFor;
        if (countryFilter == null || countryFilter.indexOf(countryCode) >= 0) {
            let events = reportsGrouped.find(r => r.country.code == countryCode).events;
            for(let i=0; i<events.length; i++){
                let reportElement = reportElementTemplate.clone();
                reportElement.find('.aside').text(events[i].event.name);
                reportElement.appendTo(reportContainer);
                reportElement.show();

                let weekContainer = reportElement.find('.weeks');
                let weekElementTemplate = $('<div class="week"></div>');
                for (let j=0; j<weeks.length; ++j) {
                    let weekElement = weekElementTemplate.clone();

                    let index = events[i].weeklyReports.findIndex(w => new Date(w.startDate).toLocaleDateString() == weeks[j].toLocaleDateString());
                    if (index >= 0) {
                        let reportData = events[i].weeklyReports[index].data;
                        if ((disasterFilter == null || disasterFilter.indexOf(reportData.disaster_type) >= 0) && (dateFilter == null || dateFilter(reportData.created_at))) {
                            weekElement.addClass('active');
                        }
                    }
                    weekElement.appendTo(weekContainer);
                }
            }
        }
    }
    //console.log($('#timeline-table header .weeks .week').outerWidth()*weekly_reports.length);
    $('#horizontal-scroll .weeks #scrollbar').width($('#timeline-table header .weeks .week').outerWidth()*weeks.length + 10);
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
