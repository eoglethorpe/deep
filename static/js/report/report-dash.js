$(document).ready(function(){

    $('.assigned-to').each(function(){
        var alreadyThere = {};
        $(this).find('span').each(function(){
            if(alreadyThere[$(this).text()]){
                $(this).remove();
            } else{
                alreadyThere[$(this).text()] = true;
            }
        });
    });

    $('#select-event').selectize();
    fillCountryDetails();

    function fillCountryDetails(){
        // sort report according to countries
        reports.sort(function(a, b){
            var ca = a.country.toUpperCase();
            var cb = b.country.toUpperCase();
            return (ca < cb)? -1: (ca > cb)? 1: 0;
        });
        var reportGrouped = [];
        var currentCountry = "";
        var currentReport = null;
        for(var i=0; i<reports.length; i++){
            var report = reports[i];
            if(currentCountry != report.country){
                currentCountry = report.country;
                currentReport = {'country': report.country, 'weeklyReports': []};
                reportGrouped.push(currentReport);
            }
            currentReport.weeklyReports.push({'startDate': report.startDate, 'data': report.data});
        }

        for(var i=0; i<reportGrouped.length; i++){
            var current = reportGrouped[i];
            var country = $('#countries .country[data-pk="'+current.country+'"]');
            current.weeklyReports.sort(function(a, b){
                return (new Date(a.startDate)) < (new Date(b.startDate));
            });

            if(current.weeklyReports.length > 0){
                // fills number to element
                function fillNumber(el, num){
                    if(!isNaN(num)){
                        el.text(getFormattedNumber(num));
                    }
                }
                // fills percent to element
                function fillPercent(el, num){
                    if(!isNaN(num)){
                        el.text(num.toFixed(2)+'%');
                    }
                }
                // returns the number of affected people from current report
                function getAffectedNumber(index){
                    var sum = 0;
                    for(var i=0; i<affectedFieldIds.length; i++){
                        sum += parseInt(current.weeklyReports[index].data.human.number[affectedFieldIds[i]]);
                    }
                    return sum;
                }
                // returns the number of people in need from current report
                function getInNeedNumber(index){
                    var sum = 0;
                    for(var i=0; i<inNeedFieldIds.length; i++){
                        sum += parseInt(current.weeklyReports[index].data.people.total[inNeedFieldIds[i]]);
                    }
                    return sum;
                }
                // returns the number of people with access constraints from current report
                function getAccessConstraintsNumber(index){
                    var sum = 0;
                    for(var i=0; i<accessConstraintsFieldIds.length; i++){
                        sum += parseInt(current.weeklyReports[index].data['access-pin'].number[accessConstraintsFieldIds[i]]);
                    }
                    return sum;
                }
                function getGeoScore(index){
                    if(current.weeklyReports[index].data["final-severity-score"]){
                        var finalSeverityScore = parseInt(current.weeklyReports[index].data["final-severity-score"].score)
                        if(!isNaN(finalSeverityScore)){
                            return finalSeverityScore;
                        }
                    }
                    if(current.weeklyReports[index].data["calculated-severity-score"]){
                        var calculatedSeverityScore = parseInt(current.weeklyReports[index].data["calculated-severity-score"]);
                        if(!isNaN(calculatedSeverityScore)){
                            return calculatedSeverityScore;
                        }
                    }
                }
                function getHumanAvailability(index){
                    var available = 0;
                    for(var i=0; i<humanAvailabilityFieldIds.length; i++){
                        var currentField = current.weeklyReports[index].data.human.number[humanAvailabilityFieldIds[i]];
                        if(typeof currentField != 'undefined' && currentField.length != 0){
                            ++available;
                        }
                    }
                    if(humanAvailabilityFieldIds.length != 0){
                        return 100*available/humanAvailabilityFieldIds.length;
                    }
                    return -1;
                }
                function getPinAvailability(index){
                    var available = 0;
                    var moderateKeys = Object.keys(current.weeklyReports[index].data.people.moderate);
                    var severeKeys = Object.keys(current.weeklyReports[index].data.people.severe);
                    var totalKeys = Object.keys(current.weeklyReports[index].data.people.total);
                    var total = moderateKeys.length + severeKeys.length + totalKeys.length;

                    for(var i=0; i<moderateKeys.length; i++){
                        if(current.weeklyReports[index].data.people.moderate[moderateKeys[i]]){
                            ++available;
                        }
                    }
                    for(var i=0; i<severeKeys.length; i++){
                        if(current.weeklyReports[index].data.people.severe[severeKeys[i]]){
                            ++available;
                        }
                    }
                    for(var i=0; i<totalKeys.length; i++){
                        if(current.weeklyReports[index].data.people.total[totalKeys[i]]){
                            ++available;
                        }
                    }
                    if(total == 0){
                        return -1;
                    }
                    return 100*available/total;
                }
                function getHumanAccessAvailability(index){
                    var available = 0;
                    var total = 12; // 9 access + 3 access-pin
                    for(var i=0; i<9; i++){
                        if(current.weeklyReports[index].data.access[i]){
                            ++available;
                        }
                    }
                    var pinKeys = Object.keys(current.weeklyReports[index].data['access-pin'].number);
                    for(var i=0; i<pinKeys.length; i++){
                        if(current.weeklyReports[index].data['access-pin'].number[i]){
                            ++available;
                        }
                    }
                    return 100*available/total;
                }
                function getHealthBar(health, tooltip){
                    if(health < 0){
                        return $('<div class="health-bar-invalid"></div>');
                    } else{
                        var healthBar = $('<div class="health-bar" data-toggle="tooltip" title="'+tooltip+' ('+health.toFixed(2)+'%)'+'"></div>');
                        var healthIndicator = $('<div class="health-indicator"></div>');
                        healthIndicator.appendTo(healthBar);
                        healthIndicator.css('width', health+'%');
                        return healthBar;
                    }

                }


                // affected number
                fillNumber(country.find('.affected .number'), getAffectedNumber(0));

                // in need
                fillNumber(country.find('.in-need .number'), getInNeedNumber(0));

                // access constraints
                fillNumber(country.find('.access-constraints .number'), getAccessConstraintsNumber(0));

                // geo score
                fillNumber(country.find('.geo-ranking .number'), getGeoScore(0));

                var availabilityPercent0 = getHumanAvailability(0);
                var pinAvailabilityPercent0 = getPinAvailability(0);
                var humanAccessAvailability0 = getHumanAccessAvailability(0);

                getHealthBar(availabilityPercent0, 'Availability').appendTo(country.find('.availability .viz'));
                getHealthBar(pinAvailabilityPercent0, 'In need').appendTo(country.find('.availability .viz'));
                getHealthBar(humanAccessAvailability0, 'Access constraints').appendTo(country.find('.availability .viz'));

                fillPercent(country.find('.availability .percent'), (availabilityPercent0+pinAvailabilityPercent0+humanAccessAvailability0)/3);


                if(typeof current.weeklyReports[1] != 'undefined'){
                    // returns appropriate icon according to change
                    function getChangeFa(num){
                        if(num > 0){
                            return 'fa-arrow-up';
                        } else if(num < 0){
                            return 'fa-arrow-down';
                        } else if(!isNaN(num)){
                            return 'fa-arrow-right';
                        }
                    }

                    // affected number change
                    country.find('.affected .fa').addClass(getChangeFa(getAffectedNumber(0) - getAffectedNumber(1)));

                    // in need number change
                    country.find('.in-need .fa').addClass(getChangeFa(getInNeedNumber(0) - getInNeedNumber(1)));

                    // access constraints number change
                    country.find('.access-constraints .fa').addClass(getChangeFa(getAccessConstraintsNumber(0) - getAccessConstraintsNumber(1)));

                    // geo ranking change
                    country.find('.geo-ranking .fa').addClass(getChangeFa(getGeoScore(0) - getGeoScore(1)));

                    // availability change
                    country.find('.availability .fa').addClass(getChangeFa((availabilityPercent0+pinAvailabilityPercent0+humanAccessAvailability0)/3 - (getHumanAvailability(1)+getPinAvailability(1)+getHumanAccessAvailability(1))/3 ));

                }
            }
        }
    }


    // scroll to active country
    $('#countries').scrollTop($('#countries .active').position().top - $('#countries .active').height());

    // change event
    $('#select-event').change(function() {
        var event = $(this).val();
        window.location.href = window.location.pathname+"?"+$.param({event:event})+"&country="+$(this).data('country-pk');
    });

    // change country
    $('.country').on('click', function(){
        window.location.href = $(this).data('href');
    });

    // format number to 1 000 format
    function getFormattedNumber(num){
        num = (num+'').replace(/\s/g, '').split('').reverse().join('')
        var newVal = '';
        for(var i=0; i<num.length; i++){
            newVal += num.substr(i, 1);
            if(i%3 == 2){
                newVal += ' ';
            }
        }
        return newVal.split('').reverse().join('');
    }

    function filterCountries(){
        var crisisStatus = $('input[type=radio][name=crisis-status]:checked').val();
        var searchText = $('#country-search').val().trim().toLowerCase();
        $('.country').each(function(){
            if ((crisisStatus == '2' || $(this).data('crisis-status') == crisisStatus)
                && (searchText.length == 0 || $(this).text().trim().toLowerCase().indexOf(searchText) != -1))
            {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    }

    // Search country
    $('#country-search').on('cut input paste drop keyup', function() {
        filterCountries();
    });
    $('input[type=radio][name=crisis-status]').change(function(){
        $('#crisis-status label').removeClass('active');
        $(this).closest('label').addClass('active');
        filterCountries();
    });

});
