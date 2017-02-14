var keyFiguresTab = {
    init: function() {
        var that = this;
        // Uprooted people percentage auto calculation & uprooted geoscore
        $('#number-of-refugees, #number-of-idps, #number-of-returned-refugees, #total-population').unbind().on('input paste change', function(){
            that.calculateUprootedScore();
            formatNumber($(this));
        });

        // HDI rank and geoscore
        $('#hdi-index').on('input paste change', function(){
            that.calculateHdiScore();
        });

        //Under five mortality geoscore
        $('#u5m').on('input paste change', function(){
            that.calculateU5mScore();
        });
    },

    loadEmpty: function() {
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
        $('#last-modified').find('date').val(null);
        $('.last-checked-date').hide();
        $('.last-checked-date').find('date').val(null);

        this.calculateHdiScore();
        this.calculateU5mScore();
        this.calculateUprootedScore();
    },

    onSubmit: function() {
        return true;
    },

    loadForCountry: function(code, country) {
        let keyFigures = country.key_figures;

        // Key figures
        $('#hdi-index').val(keyFigures.hdi_index);
        $('#hdi-rank').val(keyFigures.hdi_rank);
        $('#u5m').val(keyFigures.u5m);
        $('#number-of-refugees').val(keyFigures.number_of_refugees);
        $('#number-of-idps').val(keyFigures.number_of_idps);
        $('#number-of-returned-refugees').val(keyFigures.number_of_returned_refugees);
        $('#inform-score').val(keyFigures.inform_score);
        $('#inform-risk-index').val(keyFigures.inform_risk_index);
        $('#inform-vulnerability').val(keyFigures.inform_vulnerability);
        $('#inform-hazard-and-exposure').val(keyFigures.inform_hazard_and_exposure);
        $('#inform-lack-of-coping-capacity').val(keyFigures.inform_lack_of_coping_capacity);
        $('#total-population').val(keyFigures.total_population);
        $('#population-source').val(keyFigures.population_source);

        $('.last-checked-date').show();
        $('.last-checked-date').find('date').text(keyFigures.last_checked);

        $('#last-modified').show();
        $('#last-modified').find('date').text(country.last_modified);

        this.calculateHdiScore();
        this.calculateU5mScore();
        this.calculateUprootedScore();
    },

    calculateHdiScore: function() {
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
    },

    calculateU5mScore: function() {
        var under5MortalityRate = parseFloat($('#u5m').val());
        var mortalityScore = 0;
        if (under5MortalityRate >= 19)
            mortalityScore = 1;
        if (under5MortalityRate >= 55)
            mortalityScore = 2;
        if (under5MortalityRate >= 90)
            mortalityScore = 3;
        $('#u5m-geo-score').val(mortalityScore+'')
    },

    calculateUprootedScore: function() {
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
    },

};
