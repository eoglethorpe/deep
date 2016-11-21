function style(feature) {
    return {
        fillColor: getColor(feature.properties.density),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

$(document).ready(function(){
    // var map = L.map('the-map').setView([41.87, 12.6], 2);
    //
    // $.getJSON('/static/files/countries.geo.json', function(data) {
    //     var layer = L.geoJson(data, {style: style}).addTo(map);
    // });


    $('.crisis').on('click', function(){
        $('.active').removeClass('active');
        $(this).addClass('active');
    });
});
