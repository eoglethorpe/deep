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
var overviewData = null;
var documentReady = false;
var reportReady = false;
var countries = {};
var colorBy=null;
var layer;

var mapColors = ['#FFFFFF','#ccdbdb','#99b7b7','#669494','#337070','#004D4D'];
var mapColors2 = ['#1a9850','#91cf60','#d9ef8b','#fee08b','#fc8d59','#d73027'];

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

function getLastNumberByCountry(countrycode){
    let num = 0;
    data.forEach(function(d){
        if(d.country_code == countrycode){
            num = d.reports[0][colorBy];
        }
    });
    return num;
}

function styleMapFeature(feature) {
    if(colorBy==null){
        var color_temp = mapColors[0];
        if(overviewData.countries_monitored.indexOf(feature.properties.iso_a3) >-1){
            color_temp = mapColors[1];
        }
        if(overviewData.active_countries.indexOf(feature.properties.iso_a3) >-1){
            color_temp = mapColors[2];
        }
        if(overviewData.situation_of_concern.indexOf(feature.properties.iso_a3) >-1){
            color_temp = mapColors[3];
        }
        if(overviewData.humanitarian_crises.indexOf(feature.properties.iso_a3) >-1){
            color_temp = mapColors[4];
        }
        if(overviewData.severe.indexOf(feature.properties.iso_a3) >-1){
            color_temp = mapColors[5];
        }
        return {
            fillColor: color_temp,
            weight: 0.5,
            opacity: 1,
            color: '#37373b',
            fillOpacity: 0.9,
            className:'geom geom'+feature.properties.iso_a3
        };
    } else {

        let colors = mapColors2;
        let num = getLastNumberByCountry(feature.properties.iso_a3,colorBy);
        let grade = getColorGrade(colorBy,num);
        color = colors[grade];
        return {
            fillColor: color,
            weight: 0.5,
            opacity: 1,
            color: '#37373b',
            fillOpacity: 0.9,
            className:'geom geom'+feature.properties.iso_a3
        };
    }
}

function onEachMapFeature(feature, layer) {
    var all_countries = [].concat(overviewData.countries_monitored,overviewData.active_countries,overviewData.situation_of_concern,overviewData.severe,overviewData.humanitarian_crises);
    var active = all_countries.indexOf(feature.properties.iso_a3)>-1;
    if (active) {
        layer.bindTooltip(feature.properties.name, { sticky: true });
    }

    layer.on('click', function() {
        loadTimetable(feature.properties.iso_a3);
        let countryData = getCountryData(feature.properties.iso_a3)
        let keyfiguresData = reportsToKeyFigures(countryData.reports);
        keyfigures(keyfiguresData);
        d3.selectAll('.geom').attr("stroke",'#37373b');
        d3.selectAll('.geom').attr("stroke-width",'0.5px');
        d3.selectAll('.geom'+feature.properties.iso_a3).attr("stroke",'steelblue');
        d3.selectAll('.geom'+feature.properties.iso_a3).attr("stroke-width",'3px');
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

$.getJSON("/static/api/reports.json"+ '?timestamp=' + (new Date().getTime()), function(jsonData){
    data = jsonData.data;
    reportReady = true;
    loadReports();
});

var overviewCall = $.ajax({
    type: 'GET',
    url: '/static/api/overview.json',
    dataType: 'json',
});

var geoCall = $.ajax({
    type: 'GET',
    url: '/static/files/countries.geo.json',
    dataType: 'json',
});

$.when(overviewCall).then(function(dataArgs){
    var data = dataArgs.data;
    $('#number-of-leads-span').html(data.leads);
    $('#number-of-entries-span').html(data.entries);
    $('#number-of-active-projectes-span').html(data.active_countries.length);
    $('#number-of-global-monitoring-span').html(data.countries_monitored.length);

    $('#number-of-assessment-reports').html(data.assessment_reports);
    $('#number-of-severe').html(data.severe.length);
    $('#number-of-humanitarian-crises').html(data.humanitarian_crises.length);
    $('#number-of-situation-of-concern').html(data.situation_of_concern.length);

    keyfigures(data);

});

function keyfigures(data){
    var pinLatestFig = data.pin[data.pin.length-1];
    pinLatestFig = niceFormatNumber(pinLatestFig,true);
    $('#number-of-pin-span').html(pinLatestFig);
    createSparkLine('#number-of-pin-spark',data.pin);
    $('#pinstat').on('click',function(){
        colorBy = 'pin';
        if ($(this).hasClass('active')) {
            $('.clickable').removeClass('active');
            colorBy = null;
        }
        else {
            $('.clickable').removeClass('active');
            $(this).addClass('active');
        }
        loadTimetable('all');
    });

    var pinSevereLatestFig = data.pin_severe[data.pin_severe.length-1];
    pinSevereLatestFig = niceFormatNumber(pinSevereLatestFig,true);
    $('#number-of-pin-severe-span').html(pinSevereLatestFig);
    createSparkLine('#number-of-pin-severe-spark',data.pin);
    $('#pinseverestat').on('click',function(){
        colorBy = 'pin_severe';
        if ($(this).hasClass('active')) {
            $('.clickable').removeClass('active');
            colorBy = null;
        }
        else {
            $('.clickable').removeClass('active');
            $(this).addClass('active');
        }
        loadTimetable('all');
    });

    var pinRestrictedLatestFig = data.pin_restricted[data.pin_restricted.length-1];
    pinRestrictedLatestFig = niceFormatNumber(pinRestrictedLatestFig,true);
    $('#number-of-pin-restricted-span').html(pinRestrictedLatestFig);
    createSparkLine('#number-of-pin-restricted-spark',data.pin);
    $('#pinrestrictedstat').on('click',function(){
        colorBy = 'pin_restricted';
        if ($(this).hasClass('active')) {
            $('.clickable').removeClass('active');
            colorBy = null;
        }
        else {
            $('.clickable').removeClass('active');
            $(this).addClass('active');
        }
        loadTimetable('all');
    });

    var affectedLatestFig = data.people_affected[data.people_affected.length-1];
    affectedLatestFig = niceFormatNumber(affectedLatestFig,true);
    $('#number-of-affected-span').html(affectedLatestFig);
    createSparkLine('#number-of-affected-spark',data.people_affected);
    $('#affectedstat').on('click',function(){
        colorBy = 'people_affected';
        if ($(this).hasClass('active')) {
            $('.clickable').removeClass('active');
            colorBy = null;
        }
        else {
            $('.clickable').removeClass('active');
            $(this).addClass('active');
        }
        loadTimetable('all');
    });

    var idpsLatestFig = data.idps[data.idps.length-1];
    idpsLatestFig = niceFormatNumber(idpsLatestFig,true);
    $('#number-of-idps-span').html(idpsLatestFig);
    createSparkLine('#number-of-idps-spark',data.idps);
    $('#idpsstat').on('click',function(){
        colorBy = 'idps';
        if ($(this).hasClass('active')) {
            $('.clickable').removeClass('active');
            colorBy = null;
        }
        else {
            $('.clickable').removeClass('active');
            $(this).addClass('active');
        }
        loadTimetable('all');
    });

    var refugeesLatestFig = data.refugees[data.refugees.length-1];
    refugeesLatestFig = niceFormatNumber(refugeesLatestFig,true);
    $('#number-of-refugees-span').html(refugeesLatestFig);
    createSparkLine('#number-of-refugees-spark',data.refugees);
    $('#refugeesstat').on('click',function(){
        colorBy = 'refugees';
        if ($(this).hasClass('active')) {
            $('.clickable').removeClass('active');
            colorBy = null;
        }
        else {
            $('.clickable').removeClass('active');
            $(this).addClass('active');
        }
        loadTimetable('all');
    });
}

function getCountryData(countrycode){
    let output;
    data.forEach(function(d){
        if(d.country_code == countrycode){
            output = d;
        }
    });
    return output;
}

function reportsToKeyFigures(reports){
    let output = {}
    reports.forEach(function(report,i){
        if(i==0){
            for (key in report){
                output[key] = [report[key]];
            }
        } else {
            for (key in report){
                output[key].push(report[key]);
            }
        }
    });
    return output;
}

$.when(overviewCall, geoCall).then(function(dataArgs,geoArgs){

    overviewData = dataArgs[0].data;

    // Show the map
    let map = L.map('the-map').setView([41.87, 12.6], 2);
    map.scrollWheelZoom.disable();

    // Toggle scroll-zoom by clicking on and outside map
    map.on('focus', function() { map.scrollWheelZoom.enable(); });
    map.on('blur', function() { map.scrollWheelZoom.disable(); });

    layer = L.geoJson(geoArgs[0], {
        style: styleMapFeature,
        onEachFeature: onEachMapFeature,
    }).addTo(map);


    var legend = L.control({position: 'bottomleft'});

    legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info');
        div.innerHTML = '<h4 id="legendtitle">Legend</h4><div id="legendcontent"></div>';
        return div;
    };

    legend.addTo(map);
    populateLegend(colorBy);
});

function getFullName(colorBy){
    var title = '';
    if(colorBy == 'pin'){
        title = 'People in need';
    }
    if(colorBy == 'pin_severe'){
        title = 'People in severe need';
    }
    if(colorBy == 'pin_restricted'){
        title = 'People in need with restricted humanitarian access';
    }
    if(colorBy == 'people_affected'){
        title = 'People affected';
    }
    if(colorBy == 'idps'){
        title = 'Internally displaced people';
    }
    if(colorBy == 'refugees'){
        title = 'Refugees';
    }
    return title;
}

function populateLegend(colorBy){
    if(colorBy == null){
        var title = 'Status';
        var scale = ['Not monitored','Monitored','Active countries','Situations of concern','Humanitarian crisis','Severe Humanitarian Crises'];
        var colors = mapColors;
    } else {
        var title = getFullName(colorBy);
        var scale = getScale(colorBy);
        var colors = mapColors2;
        scale = [0].concat(scale);
        scale.forEach(function(s,i){
            if(i<scale.length-1){
                scale[i] += ' - ' + (scale[i+1]-1);
            } else {
                scale[i] += '+';
            }
        });
    }
    $('#legendtitle').html(title);

    var div = '';
    for (var i = 0; i < scale.length; i++) {
        div +='<p><i style="background:' + colors[i] + '"></i> ' + scale[i]+ '</p>';
    }
    $('#legendcontent').html(div);
}

function createSparkLine(id,data){
    $(id).html('');
    var graph = d3.select(id).append("svg:svg").attr("width", 40).attr("height", 15);

    var x = d3.scale.linear().domain([0, data.length-1]).range([0, 40]);
    var y = d3.scale.linear().domain(d3.extent(data,function(d){return d})).range([15, 0]);

    var line = d3.svg.line()
        .x(function(d,i) {
            return x(i);
        })
        .y(function(d) {
            return y(d);
        });

        graph.append("svg:path").attr("d", line(data));
}

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

    $("#body").on('click', '#back-btn', function(){
        loadTimetable('all');
    });
});

function loadReports(){
    if(!documentReady || !reportReady){
        return;
    }

    data.sort(function(a, b){
        /*var ca = (a.country.name + a.event.name).toUpperCase();
        var cb = (b.country.name + b.event.name).toUpperCase();
        return (ca < cb)? -1: (ca > cb)? 1: 0;*/
        return a.country < b.country;
    });
/*
    let currentCountryCode = "";
    let currentCountryEventPk = -1;
    let currentCountry;
*/

    var currentYear = (new Date()).getFullYear();
    data.forEach(function(d){
        countries[d.country_code] = d.country;
        d.reports.forEach(function(report){
            if((new Date(report.week_date)).getWeekYear() == currentYear){
                let reportStartDate = new Date(report.week_date);
                if(reportStartDate > maxStartDate){
                    maxStartDate = reportStartDate;
                }
                if(reportStartDate < minStartDate){
                    minStartDate = reportStartDate;
                }
            }

        });
    });

    while(minStartDate <= maxStartDate){
        weeks.push(new Date(minStartDate));
        minStartDate.addDays(7);
    }
    // Load the weekly report timetable
    loadTimetable('all');
}

function getScale(colorBy){
    let scale = [];
    if(colorBy == 'pin'){
        scale = [1000,10000,100000,1000000,5000000];
    }
    if(colorBy == 'pin_severe'){
        scale = [1000,10000,100000,1000000,5000000];
    }
    if(colorBy == 'pin_restricted'){
        scale = [1000,10000,100000,1000000,5000000];
    }
    if(colorBy == 'people_affected'){
        scale = [1000,10000,100000,1000000,5000000];
    }
    if(colorBy == 'idps'){
        scale = [1000,10000,100000,1000000,5000000];
    }
    if(colorBy == 'refugees'){
        scale = [1000,10000,100000,1000000,5000000];
    }
    return scale;
}

function getColorGrade(colorBy,num){
    let scale = getScale(colorBy);
    let place = 0;
    scale.forEach(function(s){
        if(num>s){
            place++;
        }
    });
    return place;
}

var timetableFor;
function loadTimetable(tableFor) {
    timetableFor = tableFor;
    /*if(tableFor!='all'){
        $('#country-filter').val(tableFor);
    }*/
    let title = $('#timeline-table header .aside');
    if (timetableFor == 'all') {
        title.html('Countries');
        title.unbind();
    } else {
        title.html('<i class="fa fa-arrow-left"></i>' + countries[timetableFor] + '');
        title.unbind().click(function() {
            loadTimetable('all');
            d3.selectAll('.geom').attr("stroke",'#37373b');
            d3.selectAll('.geom').attr("stroke-width",'0.5px');
            keyfigures(overviewData);
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
    if (disasterFilter) {
        disasterFilter = disasterFilter.map(d => +d);
    }

    if (timetableFor == 'all') {
        // Load reports for all countries
        for(let i=0; i<data.length; i++){
            let countryCode  = data[i].country_code;
            if ((countryFilter == null || countryFilter.indexOf(countryCode) >= 0)) {
                let reportElement = reportElementTemplate.clone();
                reportElement.find('.aside').text(data[i].country);

                reportElement.find('.aside').click(function() {
                    let keyfiguresData = reportsToKeyFigures(data[i].reports);
                    keyfigures(keyfiguresData);
                    loadTimetable(countryCode);
                    d3.selectAll('.geom').attr("stroke",'#37373b');
                    d3.selectAll('.geom').attr("stroke-width",'0.5px');
                    d3.selectAll('.geom'+countryCode).attr("stroke",'steelblue');
                    d3.selectAll('.geom'+countryCode).attr("stroke-width",'3px');
                });
                reportElement.appendTo(reportContainer);
                reportElement.show();

                let weekContainer = reportElement.find('.weeks');
                let weekElementTemplate = $('<div class="week"></div>');
                for (let j=0; j<weeks.length; ++j) {

                    let weekElement = weekElementTemplate.clone();
                    let index = data[i].reports.findIndex(w => new Date(w.week_date).toLocaleDateString() == weeks[j].toLocaleDateString());
                    if (index >= 0) {
                        let reportData = data[i].reports[index];
                        if ((!disasterFilter || disasterFilter.indexOf(reportData.disaster_type) >= 0) && (!dateFilter || dateFilter(reportData.modified_date))) {
                            let cls = 'active';
                            if(colorBy!='report'){
                                let num = reportData[colorBy];
                                let grade = getColorGrade(colorBy, num);
                                cls += ' grade'+grade;
                            }
                            weekElement.addClass(cls);
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
            let countryData = data.find(d => d.country_code == countryCode);
            let events = countryData.projects;

            for(let i=0; i<events.length; i++){
                let reportElement = reportElementTemplate.clone();
                reportElement.find('.aside').text(events[i].name);
                reportElement.appendTo(reportContainer);
                reportElement.show();

                let weekContainer = reportElement.find('.weeks');
                let weekElementTemplate = $('<div class="week"></div>');
                for (let j=0; j<weeks.length; ++j) {
                    let weekElement = weekElementTemplate.clone();

                    let index = countryData.reports.findIndex(r => r.project_id == events[i].id && new Date(r.week_date).toLocaleDateString() == weeks[j].toLocaleDateString());
                    if (index >= 0) {
                        let reportData = countryData.reports[index];
                        if ((!disasterFilter || disasterFilter.indexOf(reportData.disaster_type) >= 0) && (!dateFilter || dateFilter(reportData.created_at))) {
                            let cls = 'active';
                            if (colorBy != 'report') {
                                let num = reportData[colorBy];
                                let grade = getColorGrade(colorBy, num);
                                cls += ' grade' + grade;
                            }
                            weekElement.addClass(cls);
                        }
                    }
                    weekElement.appendTo(weekContainer);
                }
            }
        }
    }
    //console.log($('#timeline-table header .weeks .week').outerWidth()*weekly_reports.length);
    if (layer) {
        layer.eachLayer(function(layer){
            layer.setStyle(styleMapFeature(layer.feature));
        });
    }
    populateLegend(colorBy);
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

function niceFormatNumber(num,round){
    if(isNaN(parseFloat(num))){
        return num;
    } else {
        if(!round){
            var format = d3.format("0,000");
            return format(parseFloat(num));
        } else {
            var output = d3.format(".3s")(parseFloat(num));
            if(output.slice(-1)=='k'){
                output = output.slice(0, -1) + 'K';
            } else if(output.slice(-1)=='M'){
                output = d3.format(".1f")(output.slice(0, -1))+'M';
            } else if (output.slice(-1) == 'G') {
                output = output.slice(0, -1) + 'B';
            } else {
                output = ''+d3.format(".3s")(parseFloat(num));
            }
            return output;
        }
    }
}
