$(document).ready(function(){
    google.charts.load('current', {packages: ['corechart', 'bar']});
    google.charts.setOnLoadCallback(drawAxisTickColors);
    console.log('FUN');

    function drawAxisTickColors() {
        var data = google.visualization.arrayToDataTable([
        ['City', '2010 Population', '2000 Population'],
        ['New York City, NY', 8175000, 8008000],
        ['Los Angeles, CA', 3792000, 3694000],
        ['Chicago, IL', 2695000, 2896000],
        ['Houston, TX', 2099000, 1953000],
        ['Philadelphia, PA', 1526000, 1517000]
        ]);

        var options = {
            title: 'Population of Largest U.S. Cities',
            chartArea: {width: '50%'},
            backgroundColor: '#fafafa',
            hAxis: {
                title: 'Total Population',
                minValue: 0,
                textStyle: {
                    bold: true,
                    fontSize: 12,
                    color: '#4d4d4d'
              },
              titleTextStyle: {
                  bold: true,
                  fontSize: 18,
                  color: '#4d4d4d'
              }
            },
            vAxis: {
                title: 'City',
                textStyle: {
                    fontSize: 14,
                    bold: true,
                    color: '#848484'
                },
              titleTextStyle: {
                  fontSize: 14,
                  bold: true,
                  color: '#848484'
              }
          }
        };
        var chart = new google.visualization.BarChart(document.getElementById('chart-div'));
        chart.draw(data, options);
    }

    google.charts.load("current", {packages:["corechart"]});
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
            backgroundColor: '#fafafa',
            title: 'My Daily Activities',
            pieHole: 0.4,
        };

        var chart = new google.visualization.PieChart(document.getElementById('donutchart'));
        chart.draw(data, options);
      }
});
