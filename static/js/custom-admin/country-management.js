$(document).ready(function() {
    loadMap();
    $('.number').on('change input paste drop', function(){
        formatNumber($(this));
    });

    $('#country-list .country').click(function() {
        $('#country-detail-inputs h2').text('Edit country details');

        // Get the country
        var code = $(this).data('country-code');
        var country = countries[code];

        // Set country data to the form
        $('#country-name').val(country.name);
        $('#country-code').val(code);
        $('#country-code').attr('readonly', true);

        // Key figures
        $('#hdi-index').val(country.hdi_index);
        $('#hdi-rank').val(country.hdi_rank);
        $('#u5m').val(country.u5m);
        $('#number-of-refugees').val(country.number_of_refugees);
        $('#number-of-idps').val(country.number_of_idps);
        $('#number-of-returned-refugees').val(country.number_of_returned_refugees);
        $('#inform-score').val(country.inform_score);
        $('#inform-risk-index').val(country.inform_risk_index);
        $('#inform-vulnerability').val(country.inform_vulnerability);
        $('#inform-hazard-and-exposure').val(country.inform_hazard_and_exposure);
        $('#inform-lack-of-coping-capacity').val(country.inform_lack_of_coping_capacity);
        $('#total-population').val(country.total_population);
        $('#population-source').val(country.population_source);
        $('#last-modified').show();
        $('#last-modified').find('span').text(country.last_modified);

        $('.number').each(function(){
            formatNumber($(this));
        });

        calculateHdiScore();
        calculateU5mScore();
        calculateUprootedScore();

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

    // Search country
    $('#search-country').on('cut input paste drop keyup', function() {
        var query = $(this).val().trim().toLowerCase();
        if (query == '')
            $('#country-list .country').show();
        else {
            $('#country-list .country').each(function() {
                if ($(this).text().trim().toLowerCase().indexOf(query) >= 0) {
                    $(this).show();
                } else {
                    $(this).hide();
                }
            });
        }
    });

    // Uprooted people percentage auto calculation & uprooted geoscore
    $('#number-of-refugees, #number-of-idps, #number-of-returned-refugees, #total-population').unbind().on('input paste change', function(){
        calculateUprootedScore();
        formatNumber($(this));
    });

    // HDI rank and geoscore
    $('#hdi-index').on('change', function(){
        calculateHdiScore();
    });

    //Under five mortality geoscore
    $('#u5m').on('change', function(){
        calculateU5mScore();
    });


    // prevent enter key from pressing buttons
    $(window).keypress(function(e) {
        if(e.which == 13) {
            e.preventDefault();
        }
    });

    // Reformat number inputs before submitting
    $('#country-form').submit(function() {
        $('.number').each(function() {
            $(this).val(getNumberValue($(this)));
        });
        return true;
    });
});

var adminLevelId = 0;

function addNewCountry() {
    adminLevelId++;
    $('#country-detail-inputs h2').text('Add new country');
    $('.active').removeClass('active');
    $('#country-code').val(null);
    $('#country-name').val(null);
    $('#country-code').attr('readonly', false);

    // Key figures
    $('#hdi-index').val(null);
    $('#hdi-rank').val(null);
    $('#u5m').val(null);
    $('#number-of-refugees').val(null);
    $('#number-of-idps').val(null);
    $('#number-of-returned-refugees').val(null);
    $('#inform-score').val(null);
    $('#inform-risk-index').val(null);
    $('#inform-vulnerability').val(null);
    $('#inform-hazard-and-exposure').val(null);
    $('#inform-lack-of-coping-capacity').val(null);
    $('#total-population').val(null);
    $('#population-source').val(null);
    $('#last-modified').hide();
    $('#last-modified').val(null);

    $('#admin-levels-container').empty();
    addNewAdminLevel();

    calculateHdiScore();
    calculateU5mScore();
    calculateUprootedScore();
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

function calculateHdiScore() {
    var hdi = parseFloat($('#hdi-index').val());
    var hdiRank = "Low";
    var hdiScore = 3;
    if (hdi >= 0.55) {
        hdiScore = 2;
        hdiRank = "Medium";
    }
    if (hdi >= 0.625) {
        hdiScore = 1;
        hdiRank = "High";
    }

    // changed from 0.801 to 0.8
    if (hdi >= 0.7) {
        hdiScore = 0;
        hdiRank = "Very High";
    }
    $('#hdi-geo-rank').val(hdiRank+'');
    $('#hdi-geo-score').val(hdiScore+'')
}

function calculateU5mScore() {
    var under5MortalityRate = parseFloat($('#u5m').val());
    var mortalityScore = 0;
    if (under5MortalityRate >= 19)
        mortalityScore = 1;
    if (under5MortalityRate >= 55)
        mortalityScore = 2;
    if (under5MortalityRate >= 90)
        mortalityScore = 3;
    $('#u5m-geo-score').val(mortalityScore+'')
}

function calculateUprootedScore() {
    var numberOfRefugees = parseInt(getNumberValue($('#number-of-refugees')));
    var numberOfIDPs = parseInt(getNumberValue($('#number-of-idps')));
    var numberOfReturnedRefugees = parseInt(getNumberValue($('#number-of-returned-refugees')));
    var totalPopulation = parseInt(getNumberValue($('#total-population')));

    if(isNaN(numberOfRefugees) || isNaN(numberOfIDPs) || isNaN(numberOfReturnedRefugees) || isNaN(totalPopulation) || totalPopulation <= 0){
        $('#uprooted-percentage').val('');
        return;
    }

    var uprootedPercentage = 100*(numberOfRefugees+numberOfIDPs+numberOfReturnedRefugees)/totalPopulation;
    $('#uprooted-percentage').val(''+uprootedPercentage);

    var uprootedScore = 0;
    if (uprootedPercentage >= 1)
        uprootedScore = 1;
    if (uprootedPercentage >= 3)
        uprootedScore = 2;
    if (uprootedPercentage >= 10)
        uprootedScore = 3;

    $('#uprooted-geo-score').val(uprootedScore);
}
