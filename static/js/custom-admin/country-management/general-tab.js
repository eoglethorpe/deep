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
        $('#country-detail-inputs h1').text('Edit country details');
        $('#country-name').val(country.name);
        $('#country-code').val(code);
        $('#country-code').attr('readonly', true);

        // Admin levels
        $('#admin-levels-container').empty();
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

        loadCountryInMap(code);
    },

    loadEmpty: function() {
        this.adminLevelId++;
        $('#country-detail-inputs h1').text('Add new country');
        $('#country-code').val(null);
        $('#country-name').val(null);
        $('#country-code').attr('readonly', false);

        $('#admin-levels-container').empty();
        this.addNewAdminLevel();
    },

    onSubmit: function() {
        return this.validateAdminLevels();
    },

    validateAdminLevels: function() {
        let adminLevels = {};
        let duplicates = [];

        $('.admin-level-details').each(function(index, elem){
            // Skip for Delete
            if ($(elem).find('.delete-admin-level').is(':checked')) {
                return;
            }
            
            let adminLevelInput = $(elem).find("input.admin-level");
            if(adminLevels.hasOwnProperty(adminLevelInput.val())){
                duplicates.push(adminLevelInput);
            };
            adminLevels[adminLevelInput.val()] = true;
        });

        if(duplicates.length){
            $(duplicates).each(function(index, dup){
                //show error in input field
                $(dup).fadeToggle().fadeToggle();
            });
            //show error message
            showToast('Duplicate Admin Level');
            return false;
        };
        return true;
    },

    addNewAdminLevel: function() {
        var adminLevelView = $('.admin-level-details-template').clone();
        adminLevelView.appendTo($('#admin-levels-container'));
        adminLevelView.removeClass('admin-level-details-template');
        adminLevelView.addClass('admin-level-details');
        adminLevelView.show();

        adminLevelView.find('.geojson').change(function() {
            adminLevelView.find('.geojson-selected').val($(this).val() != null && $(this).val() != '');
            adminLevelView.find('.geojson-current').text($(this).val());
        });

        adminLevelView.find('.geojson').attr('id', 'geojson-file-input-'+this.adminLevelId);
        adminLevelView.find('.geojson-label').attr('for', 'geojson-file-input-'+this.adminLevelId);

        this.adminLevelId++;
        return adminLevelView;
    }
};
