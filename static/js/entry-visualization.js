
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

        $('<title>' + severities[i].name + ' - ' + severities[i].value+'</title>').appendTo(arc);

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
