var generalTab = {
    adminLevelId: -1,

    init: function() {
        loadMap();

        var that = this;
        $('#add-new-admin-level').click(function() {
            that.addNewAdminLevel();
        });
    },

    loadForCountry: function(code, country) {
        $('#country-detail-inputs h2').text('Edit country details');
        $('#country-name').val(country.name);
        $('#country-code').val(code);
        $('#country-code').attr('readonly', true);

        let region = country['region'];
        $('#country-wb-region').val(region['WB Region']);
        $('#country-wb-income-group').val(region['WB IncomeGroup']);
        $('#country-ocha-region').val(region['UN-OCHA Region']);
        $('#country-echo-region').val(region['EC-ECHO Region']);
        $('#country-un-geographical-region').val(region['UN Geographical Region']);
        $('#country-un-geographical-sub-region').val(region['UN Geographical Sub-Region']);

        // Admin levels
        $('#admin-levels').empty();
        for (var i=0; i<country.admin_levels.length; ++i) {
            var adminLevel = country.admin_levels[i];
            var adminLevelView = this.addNewAdminLevel();

            adminLevelView.find('.admin-level-pk').val(adminLevel.id);
            adminLevelView.find('.admin-level').val(adminLevel.level);
            adminLevelView.find('.admin-level-name').val(adminLevel.name);
            adminLevelView.find('.property-name').val(adminLevel.property_name);
            adminLevelView.find('.property-pcode').val(adminLevel.property_pcode);

            if (adminLevel.geojson) {
                adminLevelView.find('.geojson-old').html('<b>Current: </b><a href="' + adminLevel.geojson + '">' + adminLevel.geojson + '</a>');
            }
        }
        this.validateAdminLevels();

        loadCountryInMap(code);
    },

    loadEmpty: function() {
        this.adminLevelId++;
        $('#country-detail-inputs h2').text('Add new country');
        $('#country-code').val(null);
        $('#country-name').val(null);
        $('#country-code').attr('readonly', false);

        $('#admin-levels').empty();
        this.addNewAdminLevel();
        this.validateAdminLevels();
    },

    onSubmit: function() {
        return this.validateAdminLevels();
    },

    addNewAdminLevel: function() {
        var that = this;

        var adminLevelView = $('.admin-level-details-template').clone();
        adminLevelView.appendTo($('#admin-levels'));
        adminLevelView.removeClass('admin-level-details-template');
        adminLevelView.addClass('admin-level-details');
        adminLevelView.show();

        adminLevelView.find('.geojson').change(function() {
            adminLevelView.find('.geojson-selected').val($(this).val() != null && $(this).val() != '');
            adminLevelView.find('.geojson-current').text($(this).val());
        });

        adminLevelView.find('.geojson').attr('id', 'geojson-file-input-'+this.adminLevelId);
        adminLevelView.find('.geojson-label').attr('for', 'geojson-file-input-'+this.adminLevelId);

        adminLevelView.find('.admin-level,.delete-admin-level').on('input change', function() {
            that.validateAdminLevels();
        });

        this.adminLevelId++;
        return adminLevelView;
    },


    validateAdminLevels: function() {
        let adminLevels = {};
        let duplicates = [];

        $('input.admin-level').each(function(index, element) {
            element.setCustomValidity('');
        });;

        $('.admin-level-details').each(function(index, elem){

            // Skip for to-be-deleted element
            if ($(elem).find('.delete-admin-level').is(':checked')) {
                return;
            }

            let adminLevelInput = $(elem).find('input.admin-level');

            if (adminLevelInput.val() == null || adminLevelInput.val() == '') {
                adminLevelInput.get(0).setCustomValidity('Please fill out this field');
                return false;
            }

            if(adminLevels.hasOwnProperty(adminLevelInput.val())){
                duplicates.push(adminLevelInput);
            };
            adminLevels[adminLevelInput.val()] = true;
        });

        if(duplicates.length){
            $(duplicates).each(function(index, dup){
                $(dup).get(0).setCustomValidity('Duplicate admin level');
            });
            return false;
        };

        return true;
    },
};
