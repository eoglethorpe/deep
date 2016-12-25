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

        // Key figures
        $('#hdi-index').val(country.hdi_index);
        $('#hdi-rank').val(country.hdi_rank);
        $('#hdi-geo-score').val(country.hdi_geo_score);
        $('#u5m').val(country.u5m);
        $('#u5m-geo-score').val(country.u5m_geo_score);
        $('#uprooted-percentage').val(country.uprooted_percentage);
        $('#uprooted-geo-score').val(country.uprooted_geo_score);
        $('#inform-final-score').val(country.inform_final_score);

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

    // Tab navigation
    $('#navigator').on('click', 'a', function(){
        var that = $('#navigator .nav-active');
        $(that.data('target')).hide();
        that.removeClass('nav-active');

        $($(this).data('target')).show();
        $(this).addClass('nav-active');
    });

    $('#add-new-admin-level').click(function() {
        addNewAdminLevel();
    });

    if ($('.country.active').length > 0)
        $('.country.active').click();
    else
        addNewCountry();
});

var adminLevelId = 0;

function addNewCountry() {
    adminLevelId++;
    $('#country-detail-inputs h2').text('Add new country');
    $('.active').removeClass('active');
    $('#country-code').val(null);
    $('#country-name').val(null);

    // Key figures
    $('#hdi-index').val(null);
    $('#hdi-rank').val(null);
    $('#hdi-geo-score').val(null);
    $('#u5m').val(null);
    $('#u5m-geo-score').val(null);
    $('#uprooted-percentage').val(null);
    $('#uprooted-geo-score').val(null);
    $('#inform-final-score').val(null);

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

    adminLevelView.find('.geojson').attr('id', 'geojson-file-input-'+adminLevelId);
    adminLevelView.find('.geojson-label').attr('for', 'geojson-file-input-'+adminLevelId);

    adminLevelId++;
    return adminLevelView;
}
