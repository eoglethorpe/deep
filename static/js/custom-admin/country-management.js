$(document).ready(function() {
    var mymap = L.map('the-map').setView([51.505, -0.09], 13);

    $('#country-list .country').click(function() {

        // Get the country
        var code = $(this).data('country-code');
        var country = countries[code];

        // Set country data to the form
        $('#country-name').val(country.name);
        $('#country-code').val(code);

        // Admin levels
        for (var i=0; i<country.admin_levels.length; ++i) {
            var adminLevel = country.admin_levels[i];

            var adminLevelView = $('.admin-level-details-template').clone();
            adminLevelView.removeClass('admin-level-details-template');
            adminLevelView.addClass('admin-level-details');

            adminLevelView.find('.admin-level').val(adminLevel.level);
            adminLevelView.find('.admin-level-name').val(adminLevel.name);
            adminLevelView.find('.property-name').val(adminLevel.property_name);
            adminLevelView.find('.property-pcode').val(adminLevel.property_pcode);

            adminLevelView.find('.geojson-name').html('<a href="' + adminLevel.geojson + '">' + adminLevel.geojson + '</a>');

            adminLevelView.appendTo($('#admin-levels-container'));
            adminLevelView.show();
        }

        // Set active state
        $('.active').removeClass('active');
        $(this).addClass('active');
    });
});