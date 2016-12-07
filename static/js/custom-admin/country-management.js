$(document).ready(function() {
    loadMap();

    $('#country-list .country').click(function() {
        $('#country-detail-inputs h2').text('Edit country details');

        // Get the country
        var code = $(this).data('country-code');
        var country = countries[code];

        // Set country data to the form
        $('#country-name').val(country.name);
        $('#country-code').val(code);

        // Admin levels
        $('#admin-levels-container').empty();
        for (var i=0; i<country.admin_levels.length; ++i) {
            var adminLevel = country.admin_levels[i];

            var adminLevelView = addNewAdminLevel();

            adminLevelView.find('.admin-level-pk').val(adminLevel.id);
            adminLevelView.find('.admin-level').val(adminLevel.level);
            adminLevelView.find('.admin-level-name').val(adminLevel.name);
            adminLevelView.find('.property-name').val(adminLevel.property_name);
            adminLevelView.find('.property-pcode').val(adminLevel.property_pcode);

            if (adminLevel.geojson) {
                adminLevelView.find('.geojson-old').html('<b>Current: </b><a href="' + adminLevel.geojson + '">' + adminLevel.geojson + '</a>');
            }
        }

        // Set active state
        $('.active').removeClass('active');
        $(this).addClass('active');

        loadCountryInMap(code);
    });

    $('#add-new-admin-level').click(function() {
        addNewAdminLevel();
    });

    if ($('.country.active').length > 0)
        $('.country.active').click();
    else
        addNewCountry();
});

function addNewCountry() {
    $('#country-detail-inputs h2').text('Add new country');
    $('.active').removeClass('active');
    $('#country-code').val(null);
    $('#country-name').val(null);

    $('#admin-levels-container').empty();
    addNewAdminLevel();
}

function addNewAdminLevel() {
    var adminLevelView = $('.admin-level-details-template').clone();
    adminLevelView.appendTo($('#admin-levels-container'));
    adminLevelView.removeClass('admin-level-details-template');
    adminLevelView.addClass('admin-level-details');
    adminLevelView.show();

    adminLevelView.find('.geojson').change(function() {
        adminLevelView.find('.geojson-selected').val($(this).val() != null && $(this).val() != '');
        adminLevelView.find('.geojson-current').text($(this).val());
    });

    return adminLevelView;
}
