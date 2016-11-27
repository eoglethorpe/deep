
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
    $("#pie-chart-container").html($("#pie-chart-container").html());
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


$(document).ready(function(){
//     var sectorData = [];
//     sectorData.push(['Sectors', 'No problem', 'Minor problem', 'Situation of concern', 'Situation of major concern', 'Severe conditions', 'Critical situation', { role: 'annotation' } ]);
//
//     google.charts.setOnLoadCallback(drawChart);
//     function drawChart() {
//         var data = google.visualization.arrayToDataTable([
//             ['Task', 'Hours per Day'],
//             ['Work',     11],
//             ['Eat',      2],
//             ['Commute',  2],
//             ['Watch TV', 2],
//             ['Sleep',    7]


//         ]);
//
//         var options = {
//             width: 400,
//             height: 400,
//             backgroundColor: 'transparent',
//             title: 'My Daily Activities',
//             legend: { position: 'top', maxLines: 3 },
//             pieHole: 0.4,
//             slices: {
//                 0:{color:'#f2adad'},
//                 1:{color:'#ec8080'},
//                 2:{color:'#e55454'},
//                 3:{color:'#cd1f1f'},
//                 4:{color:'#cd1f1f'},
//                 5:{color:'#b71c1c'}
//             }
//         };
//         var chart = new google.visualization.PieChart(document.getElementById('donut-chart'));
//         chart.draw(data, options);
//     }
//
//     google.charts.setOnLoadCallback(timeBar);
//     function timeBar() {
//         var data = google.visualization.arrayToDataTable([
//             ['Genre', 'Fantasy & Sci Fi', 'Romance', 'Mystery/Crime', 'General',
//             'Western', 'Literature', { role: 'annotation' } ],
//             ['2010', 10, 24, 20, 32, 18, 5, ''],
//             ['2020', 16, 22, 23, 30, 16, 9, ''],
//             ['2030', 28, 19, 29, 30, 12, 13, '']
//         ]);
//
//         var options = {
//             width: 1000,
//             height: 400,
//             backgroundColor: 'transparent',
//             legend: { position: 'top', maxLines: 3 },
//             bar: { groupWidth: '2%' },
//             isStacked: true,
//             series: {
//                 0:{color:'#f2adad'},
//                 1:{color:'#ec8080'},
//                 2:{color:'#e55454'},
//                 3:{color:'#cd1f1f'},
//                 4:{color:'#cd1f1f'},
//                 5:{color:'#b71c1c'}
//             }
//         };
//         var chart = new google.visualization.ColumnChart(document.getElementById("time-bar"));
//         chart.draw(data, options);
//     }
});
