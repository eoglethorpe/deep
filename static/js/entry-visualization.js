$(document).ready(function(){
    google.charts.load('current', {packages: ['corechart', 'bar']});
    google.charts.setOnLoadCallback(sectorBar);

    function sectorBar() {
            var data = google.visualization.arrayToDataTable([
                ['Genre', 'No problem', 'Minor problem', 'Situation of concern', 'Situation of major concern',
                'Severe conditions', 'Critical situation', { role: 'annotation' } ],
                ['2020', 16, 22, 23, 30, 16, 9, ''],
                ['2030', 28, 19, 29, 30, 12, 13, '']
    ]);

        var options = {
            width: 400,
            height: 1000,
            backgroundColor: 'transparent',
            legend: { position: 'top', maxLines: 3 },
            bar: { groupWidth: '10%' },
            isStacked: true,
            series: {
                0:{color:'#f2adad'},
                1:{color:'#ec8080'},
                2:{color:'#e55454'},
                3:{color:'#cd1f1f'},
                4:{color:'#cd1f1f'},
                5:{color:'#b71c1c'}
            }
        };
        var chart = new google.visualization.BarChart(document.getElementById('sector-bar'));
        chart.draw(data, options);
    }

    google.charts.setOnLoadCallback(drawChart);
    function drawChart() {
        var data = google.visualization.arrayToDataTable([
            ['Task', 'Hours per Day'],
            ['Work',     11],
            ['Eat',      2],
            ['Commute',  2],
            ['Watch TV', 2],
            ['Sleep',    7]
        ]);

        var options = {
            width: 400,
            height: 400,
            backgroundColor: 'transparent',
            title: 'My Daily Activities',
            legend: { position: 'top', maxLines: 3 },
            pieHole: 0.4,
            slices: {
                0:{color:'#f2adad'},
                1:{color:'#ec8080'},
                2:{color:'#e55454'},
                3:{color:'#cd1f1f'},
                4:{color:'#cd1f1f'},
                5:{color:'#b71c1c'}
            }
        };
        var chart = new google.visualization.PieChart(document.getElementById('donut-chart'));
        chart.draw(data, options);
    }

    google.charts.setOnLoadCallback(timeBar);
    function timeBar() {
        var data = google.visualization.arrayToDataTable([
            ['Genre', 'Fantasy & Sci Fi', 'Romance', 'Mystery/Crime', 'General',
            'Western', 'Literature', { role: 'annotation' } ],
            ['2010', 10, 24, 20, 32, 18, 5, ''],
            ['2020', 16, 22, 23, 30, 16, 9, ''],
            ['2030', 28, 19, 29, 30, 12, 13, '']
        ]);

        var options = {
            width: 1000,
            height: 400,
            backgroundColor: 'transparent',
            legend: { position: 'top', maxLines: 3 },
            bar: { groupWidth: '2%' },
            isStacked: true,
            series: {
                0:{color:'#f2adad'},
                1:{color:'#ec8080'},
                2:{color:'#e55454'},
                3:{color:'#cd1f1f'},
                4:{color:'#cd1f1f'},
                5:{color:'#b71c1c'}
            }
        };
        var chart = new google.visualization.ColumnChart(document.getElementById("time-bar"));
        chart.draw(data, options);
    }
});
