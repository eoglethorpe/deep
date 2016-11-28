
function renderSectors(){
    // reset all sector severity values
    for(var i=0; i<sectors.length; i++){
        for(var j=0; j<sectors[i].severities.length; j++){
            sectors[i].severities[j].value = 0;
        }
    }
    for (var i=0; i<severities.length; i++) {
        severities[i].value = 0;
    }

    for(var i=0; i<entries.length; i++){
        var entry = entries[i];
        for(var j=0; j<entry.informations.length; j++){
            var information = entry.informations[j];
            var attributes = information.attributes;
            for(var n=0; n<attributes.length; n++){
                var attribute = attributes[n];
                if(attribute.sector != null){
                    var sector = $.grep(sectors, function(n, i){
                        return n.id == attribute.sector.id;
                    })[0];
                    var severity = $.grep(sector.severities, function(n, i){
                        return n.id == information.severity.level;
                    })[0];
                    severity.value++;

                    $.grep(severities, function(n, i) {
                        return n.id == information.severity.level;
                    })[0].value++;
                }
            }
        }
    }

    var sectorList = $('#sector-visualization').find('.sector');
    var totalSeverity = [];
    for(var i=0; i<sectors.length; i++){
        totalSeverity.push(0)
        for(var j=0; j<sectors[i].severities.length; j++){
            totalSeverity[i] += sectors[i].severities[j].value;
        }
    }
    var maxSeverity = Math.max(...totalSeverity);
    //console.log(maxSeverity);

    sectorList.each(function(){
        var severitiesContainer = $(this).find('.severities');
        severitiesContainer.empty();
        var that = $(this);
        var sector = $.grep(sectors, function(n, i){
            return n.id == that.data('id');
        })[0];
        for(var i=0; i<sector.severities.length; i++){
            severity = sector.severities[i];
            $('<span class="severity severity-'+severity.id+'" style=width:'+((severity.value/maxSeverity)*256)+'px;" data-toggle="tooltip" title="'+severity.name+' - '+severity.value+'"></span>').appendTo(severitiesContainer);
        }
    })

    drawPieChart();
    reloadMap();
    renderTimeline();
}

function drawPieChart(){
    var totalSeverity = 0;
    for (var i=0; i<severities.length; i++) {
        totalSeverity += severities[i].value;
    }

    $("#pies-container").empty();

    var startAngle = 0;
    for (var i=0; i<severities.length; i++){
        var endAngle = startAngle + severities[i].value/totalSeverity*360;
        if (endAngle - startAngle >= 360)
            endAngle -= 1;

        var arc = $('<path/>');
        arc.addClass('severity-'+(i+1));
        arc.attr("d", describeArc(120, 120, 80, startAngle, endAngle));

        var percentage = (severities[i].value/totalSeverity*100);
        $('<title>' + severities[i].name + ' - ' + Math.round(percentage) + '%</title>').appendTo(arc);

        arc.appendTo($('#pies-container'));
        startAngle = endAngle;
    }
    $("#pie-wrapper").html($("#pie-wrapper").html());
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
    return d1.getYear() == d2.getYear() && d1.getMonth() == d2.getMonth() && d1.getDay() == d2.getDay();
}

function renderTimeline(){

    var canvas = document.getElementById("entry-timeline");
    var context = canvas.getContext("2d");

    var minDate = new Date();
    var maxDate = new Date(0);

    var entryDates = [];

    for(var i=0; i<entries.length; i++){
        for(var j=0; j<entries[i].informations.length; j++){
            var entryDate = new Date(entries[i].informations[j].modified_at);
            var dateExists = false;
            for(var n=0; n<entryDates.length; n++){
                if(entryDate < minDate){
                    minDate = entryDate;
                }
                if(entryDate > maxDate){
                    maxDate = entryDate;
                }
                if(isSameDay(entryDates[n].date, entryDate)){
                    ++entryDates[n].entriesCount;
                    dateExists = true;
                    break;
                }
            }
            if(!dateExists){
                entryDates.push({date: entryDate, entriesCount: 1});
            }
        }
    }

    context.lineWidth = 1;
    context.imageSmoothingEnabled = true;

    context.beginPath();
    context.moveTo(0, canvas.height);

    var timeGap = maxDate.getTime() - minDate.getTime();
    entryDates.sort(function(a, b){
        return a.date.getTime()-b.date.getTime();
    });

    var points = [];
    for(var i=0; i<entryDates.length; i++){
        points.push(canvas.width*((entryDates[i].date.getTime()-minDate.getTime())/timeGap));
        points.push(canvas.height*((10-entryDates[i].entriesCount)/10));
    }
    points.push(canvas.width); points.push(canvas.height);
    console.log(entryDates);
    // context.lineTo(canvas.width, canvas.height);
    if (points.length > 1) {
        context.moveTo(points[0], points[1]);
        context.curve(points);
        context.stroke();
    }

    //context.lineTo(canvas.width, canvas.height);
}
