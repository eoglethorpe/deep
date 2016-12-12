
function resetSeverities(attrs) {
    for(var i=0; i<attrs.length; i++){
        for(var j=0; j<attrs[i].severities.length; j++){
            attrs[i].severities[j].value = 0;
        }
    }
}
function recalculateSeverity(information, info_attrs, attrs) {
    var asdfg = $.grep(attrs, function(n, i) {
        var x = $.grep(info_attrs, function(n1, i1) {
            return n1.id == n.id;
        });
        return x.length > 0;
    });
    if (asdfg) {
        for (var k=0; k<asdfg.length; ++k) {
            var a = asdfg[k];
            $.grep(a.severities, function(n, i) {
                return n.id == information.severity.level;
            })[0].value++;
        }
    }
}
function recalculateSeverity2(information, attrId, attrs) {
    var asdfg = $.grep(attrs, function(n, i) {
        return n.id == attrId;
    })[0];
    if (asdfg) {
        $.grep(asdfg.severities, function(n, i) {
            return n.id == information.severity.level;
        })[0].value++;
    }
}

function renderVisualizations() {
    // Reset values
    resetSeverities(sectors);
    resetSeverities(vulnerable_groups);
    resetSeverities(specific_needs_groups);
    resetSeverities(sources);
    resetSeverities(affected_groups);

    for (var i=0; i<severities.length; i++) {
        severities[i].value = 0;
    }

    // Recalculate values]
    var infomrationCount = 0

    for(var i=0; i<entries.length; i++){
        var entry = entries[i];
        for(var j=0; j<entry.informations.length; j++){
            var information = entry.informations[j];
            var attributes = information.attributes;

            // Sector-severity
            for(var n=0; n<attributes.length; n++){
                var attribute = attributes[n];
                if(attribute.sector != null){
                    recalculateSeverity2(information, attribute.sector.id, sectors);
                }
            }

            // Vulnerable group-severity
            if (information.vulnerable_groups.length > 0) {
                recalculateSeverity(information, information.vulnerable_groups, vulnerable_groups);
            }

            // Specific needs group-severity
            if (information.specific_needs_groups.length > 0) {
                recalculateSeverity(information, information.specific_needs_groups, specific_needs_groups);
            }

            // Source-severity
            if (information.lead_source) {
                recalculateSeverity2(information, information.lead_source, sources);
            }

            // Affected group-severity
            if (information.affected_groups.length > 0) {
                recalculateSeverity(information, information.affected_groups, affected_groups);
            }

            // Total severity
            $.grep(severities, function(n, i) {
                return n.id == information.severity.level;
            })[0].value++;

            ++infomrationCount;
        }
    }

    $('#entry-count').text('Number of entries: ' + infomrationCount);

    renderSectors();
    renderAttrs("vulnerable-groups-visualization", vulnerable_groups);
    renderAttrs("specific-needs-groups-visualization", specific_needs_groups);
    renderAttrs("sources-visualization", sources);
    renderAttrs("affected-groups-visualization", affected_groups);
    drawPieChart();
    reloadMap();
    processTimeline();
}

function renderSectors(){

    var sectorList = $('#sectors-visualization').find('.attr');
    var totalSeverity = [];
    for(var i=0; i<sectors.length; i++){
        totalSeverity.push(0)
        for(var j=0; j<sectors[i].severities.length; j++){
            totalSeverity[i] += sectors[i].severities[j].value;
        }
    }
    var maxSeverity = Math.max(...totalSeverity);

    sectorList.each(function(){
        var severitiesContainer = $(this).find('.severities');
        severitiesContainer.empty();
        var that = $(this);
        var sector = $.grep(sectors, function(n, i){
            return n.id == that.data('id');
        })[0];
        if (sector) {
            for(var i=0; i<sector.severities.length; i++){
                severity = sector.severities[i];
                $('<span class="severity severity-'+severity.id+'" style=width:'+((severity.value/maxSeverity)*240)+'px;" data-toggle="tooltip" onmouseover="$(this).tooltip(\'show\')" title="'+severity.name+' - '+severity.value+'"></span>').appendTo(severitiesContainer);
            }
        }
    })
}

function renderAttrs(id, attrs) {
    var attrList = $('#'+id).find('.attr');
    var totalSeverity = [];
    for(var i=0; i<attrs.length; i++){
        totalSeverity.push(0)
        for(var j=0; j<attrs[i].severities.length; j++){
            totalSeverity[i] += attrs[i].severities[j].value;
        }
    }
    var maxSeverity = Math.max(...totalSeverity);

    attrList.each(function(){
        var severitiesContainer = $(this).find('.severities');
        severitiesContainer.empty();
        var that = $(this);
        var attr = $.grep(attrs, function(n, i){
            return n.id == that.data('id');
        })[0];
        if (attr) {
            for(var i=0; i<attr.severities.length; i++){
                severity = attr.severities[i];
                $('<span class="severity severity-'+severity.id+'" style=width:'+((severity.value/maxSeverity)*192)+'px;" data-toggle="tooltip" onmouseover="$(this).tooltip(\'show\')" title="'+severity.name+' - '+severity.value+'"></span>').appendTo(severitiesContainer);
            }
        }
    })
}

function drawPieChart(){
    var totalSeverity = 0;
    for (var i=0; i<severities.length; i++) {
        totalSeverity += severities[i].value;
    }

    $("#pies-container").empty();

    if (totalSeverity == 0)
        return;

    var startAngle = 0;
    for (var i=0; i<severities.length; i++){
        var endAngle = startAngle + severities[i].value/totalSeverity*360;
        if (endAngle - startAngle >= 360)
            endAngle -= 1;

        var percentage = (severities[i].value/totalSeverity*100);
        var arc = $('<path data-toggle="tooltip" title="' + severities[i].name + ' - ' + Math.round(percentage) + '%" onmouseover="showTooltip(this);"/>');
        arc.addClass('severity-'+(i+1));
        arc.attr("d", describeArc(104, 104, 64, startAngle, endAngle));

        // $('<title>' + severities[i].name + ' - ' + Math.round(percentage) + '%</title>').appendTo(arc);

        arc.mouseover(function() {
        });

        arc.appendTo($('#pies-container'));
        startAngle = endAngle;
    }
    $("#pie-wrapper").html($("#pie-wrapper").html());
}

function showTooltip(me) {
    $(me).tooltip({
        'container': 'body',
        'placement': 'bottom'
    });
}

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}

function describeArc(x, y, radius, startAngle, endAngle){
    var start = polarToCartesian(x, y, radius, endAngle);
    var end = polarToCartesian(x, y, radius, startAngle);

    var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    var d = [
        "M", start.x, start.y,
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");

    return d;
}

function isSameDay(d1, d2){
    return d1.getYear() == d2.getYear() && d1.getMonth() == d2.getMonth() && d1.getDate() == d2.getDate();
}

var isSelected = false;
var selectStart = null;
var selectEnd = null;
var startPosition = null;
var endPosition = null;
var timelineCanvas = null;
var canvasTracking = false;
var timeGap = 0;
var minDate = new Date();
var maxDate = new Date(0);

var entryDates = [];
var xs = [], ys = [];
var maxEntries = 0;

function processTimeline(){
    entryDates = [];
    minDate = new Date();
    maxDate = new Date(0);

    for(var i=0; i<entriesTimeline.length; i++){
        var information = entriesTimeline[i].informations;
        for(var j=0; j<information.length; j++){
            var entryDate;
            if (entriesTimeline[i].informations[j].date)
                entryDate = new Date(entriesTimeline[i].informations[j].date);
            else
                entryDate = new Date(entriesTimeline[i].informations[j].modified_at);

            var dateExists = false;
            if(entryDate < minDate){
                minDate = entryDate;
            }
            if(entryDate > maxDate){
                maxDate = entryDate;
            }
            for(var n=0; n<entryDates.length; n++){
                if(isSameDay(entryDates[n].date, entryDate)){
                    ++entryDates[n].severities[information[j].severity.level];
                    ++entryDates[n].entriesCount;
                    dateExists = true;
                    break;
                }
            }
            if(!dateExists){
                entryDates.push({date: entryDate, severities: $.extend(true, {}, dateSeveritiesTemplate), entriesCount: 1});
                ++entryDates[n].severities[information[j].severity.level];
            }
        }
    }

    timeGap = maxDate.getTime() - minDate.getTime();
    if (timeGap/1000/3600/24 < 10) {
        maxDate = new Date(minDate.getTime() + 10*24*3600*1000);
        timeGap = maxDate.getTime() - minDate.getTime();
    }

    entryDates.sort(function(a, b){
        return a.date.getTime()-b.date.getTime();
    });

    maxEntries = 10;
    for(var i=0; i<entryDates.length; i++){
        if(maxEntries < entryDates[i].entriesCount){
            maxEntries = entryDates[i].entriesCount;
        }
    }
    maxEntries += 5;
    renderTimeline();
}



function renderTimeline(){
    var context = timelineCanvas.getContext("2d");
    context.clearRect(0, 0, timelineCanvas.width, timelineCanvas.height);

    if (entryDates.length == 0)
        return;

    context.lineWidth = 1;
    context.imageSmoothingEnabled = true;

    var severityColors = {
        1: '#fbd4d4', 2: '#f7a5a5', 3: '#f47575', 4: '#f04646', 5: '#ec1717', 6: '#c01010'
    };

    context.moveTo(0, 0);
    var timelineWidth = Math.max(3, Math.min(20, 1024*(1/(timeGap/1000/3600/24))));


    for(var i=0; i<entryDates.length; i++){
        var x = timelineCanvas.width*((entryDates[i].date.getTime()-minDate.getTime())/timeGap)*0.9+timelineCanvas.width*0.05;
        var y = timelineCanvas.height*0.9;
        for(var j=0; j<severities.length; j++){
            var currentHeight = (timelineCanvas.height*entryDates[i].severities[severities[j].id]/maxEntries);
            context.fillStyle = severityColors[severities[j].id];
            context.fillRect(x-timelineWidth/2, y-currentHeight, timelineWidth, currentHeight);
            y -= currentHeight;
        }
    }
    //context.stroke();
    var yOffset = timelineCanvas.height*0.9+1
    context.beginPath();
    context.fillStyle = '#414141';
    context.lineWidth = 0.1;
    context.moveTo(0, yOffset);
    context.lineTo(timelineCanvas.width, yOffset);

    context.stroke();
    context.beginPath();
    for(var j=0; j<=10; j++){
        var date = new Date(minDate.getTime()+j*(timeGap/9));
        var x = (j*timelineCanvas.width/9)*0.9+timelineCanvas.width*0.05;
        var labelWidth = context.measureText(formatDate(date)).width;
        context.moveTo(x, yOffset);
        //context.lineTo(x, yOffset+10);
        context.fillText(formatDate(date), x-labelWidth/2, timelineCanvas.height-3);
    }
    context.stroke();

    if(isSelected || canvasTracking){
        //context.globalAlpha = 0.5;
        context.fillStyle = "rgba(0, 128, 128, 0.5)";
        context.fillRect(startPosition.x, 0, endPosition.x-startPosition.x, timelineCanvas.height*0.9);
        //context.stroke();
    }
    //context.transform(1, 0, 0, -1, 0, timelineCanvas.height)
}

function resizeCanvas() {
    timelineCanvas.width = $("#entry-timeline-container").innerWidth();
    timelineCanvas.height = $("#entry-timeline-container").innerHeight();
    isSelected = false;
    renderTimeline();
}

$(document).ready(function() {
    timelineCanvas = document.getElementById("entry-timeline");

    window.addEventListener('resize', resizeCanvas, false);
    resizeCanvas();



    function getMousePos(evt) {
        var rect = timelineCanvas.getBoundingClientRect();
        return {
            x: (evt.clientX - rect.left) / (rect.right - rect.left) * timelineCanvas.width,
            y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * timelineCanvas.height
        };
    }

    timelineCanvas.onmousedown = function(e){
        isSelected = false;
        var mousePos = getMousePos(e);
        startPosition = {x: mousePos.x, y: mousePos.y};
        endPosition = {x: mousePos.x, y: mousePos.y};
        canvasTracking = true;
    }
    timelineCanvas.onmouseup = function(e){
        var mousePos = getMousePos(e);
        endPosition = {x: mousePos.x, y: mousePos.y};
        canvasTracking = false;

        isSelected = (startPosition.x != endPosition.x);

        filterByTimeline();
        renderTimeline();
    }
    timelineCanvas.onmousemove = function(e){
        if(canvasTracking){
            var mousePos = getMousePos(e);
            endPosition = {x: mousePos.x, y: mousePos.y};
            renderTimeline();
        }
    }
});
