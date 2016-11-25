function renderSectors(){
    // reset all sector severity values
    for(var i=0; i<sectors.length; i++){
        for(var j=0; j<sectors[i].severities.length; j++){
            sectors[i].severities[j].value = 0;
        }
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
            $('<span class="severity severity-'+severity.id+'" style=width:'+((severity.value/maxSeverity)*200)+'px;" data-toggle="tooltip" title="'+severity.value+'"></span>').appendTo(severitiesContainer);
        }
    })
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
