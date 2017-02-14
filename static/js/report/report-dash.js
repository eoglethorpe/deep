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
                        el.text(Math.round(num)+'%');
                    }
                }
                // returns the number of affected people from current report
                function getAffectedNumber(index){
                    var sum = 0;
                    for(var i=0; i<affectedFieldIds.length; i++){
                        var affected = parseInt(current.weeklyReports[index].data.human.number[affectedFieldIds[i]]);
                        sum += isNaN(affected)? 0: affected;
                    }
                    return sum;
                }
                // returns the number of displaced people in need from current report
                function getDisplacedNumber(index){
                    var sum = 0;
                    for(var i=0; i<displacedFieldIds.length; i++){
                        var inNeed = parseInt(current.weeklyReports[index].data.human.number[displacedFieldIds[i]]);
                        sum += isNaN(inNeed)? 0: inNeed;
                    }
                    return sum;
                }
                // returns the number of people in need from current report
                function getInNeedNumber(index){
                    var sum = 0;
                    for(var i=0; i<inNeedFieldIds.length; i++){
                        var inNeed = parseInt(current.weeklyReports[index].data.people.total[inNeedFieldIds[i]]);
                        sum += isNaN(inNeed)? 0: inNeed;
                    }
                    return sum;
                }
                // returns the number of people with access constraints from current report
                function getAccessConstraintsNumber(index){
                    var sum = 0;
                    for(var i=0; i<accessConstraintsFieldIds.length; i++){
                        var constraint = parseInt(current.weeklyReports[index].data['access-pin'].number[accessConstraintsFieldIds[i]]);
                        sum += isNaN(constraint)? 0: constraint;
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
                var decayPalette = ['#1a9850', '#66bd63', '#a6d96a', '#d9ef8b', '#fee08b', '#fdae61', '#f46d43','#d73027'];
                function calculateRecency(decays){
                    var scores = {};
                    for(var i=0; i<decays.length; i++){
                        if(decays[i]){
                            var keys = Object.keys(decays[i]);
                            for(var j=0; j<keys.length; j++){
                                var currentIndex = decayPalette.indexOf(decays[i][keys[j]]);
                                if(scores[currentIndex]){
                                    scores[currentIndex] = scores[currentIndex]+1;
                                } else{
                                    scores[currentIndex] = 1;
                                }
                            }
                        }
                    }
                    var scoreKeys = Object.keys(scores);
                    var scoreSum = 0;
                    var scoreTotal = 0;
                    for(var i=0; i<scoreKeys.length; i++){
                        scoreSum += (parseInt(scores[scoreKeys[i]])*(1 - parseFloat(scoreKeys[i])/decayPalette.length));
                        scoreTotal += parseInt(scores[scoreKeys[i]]);
                    }
                    if(scoreTotal == 0) {return -1};
                    return scoreSum/scoreTotal;
                }
                function getHumanRecency(index){
                    var humanDecays = [current.weeklyReports[index].data.human.numberDecay, current.weeklyReports[index].data.human.commentDecay, current.weeklyReports[index].data.human.sourceDecay];
                    return 100*calculateRecency(humanDecays);
                }
                function getPinRecency(index){
                    var pin = current.weeklyReports[index].data.people;
                    var pinDecay = [pin.atRiskDecay, pin.atRiskSourceDecay, pin.atRiskCommentDecay,
                        pin.moderateDecay, pin.moderateSourceDecay, pin.moderateCommentDecay,
                        pin.plannedDecay, pin.plannedSourceDecay, pin.plannedCommentDecay,
                        pin.severeDecay, pin.severeSourceDecay, pin.severeCommentDecay,
                        pin.totalDecay, pin.totalSourceDecay, pin.totalCommentDecay
                    ];
                    return 100*calculateRecency(pinDecay);
                }
                function getAccessRecency(index){
                    var accessDecays = [current.weeklyReports[index].data.accessDecay, current.weeklyReports[index].data['access-pin'].commentDecay, current.weeklyReports[index].data['access-pin'].numberDecay, current.weeklyReports[index].data['access-pin'].sourceDecay];
                    return 100*calculateRecency(accessDecays);
                }
                function getHealthBar(health, tooltip){
                    if(health < 0){
                        return $('<div class="health-bar-invalid"></div>');
                    } else{
                        var healthBar = $('<div class="health-bar" data-toggle="tooltip" title="'+tooltip+' ('+Math.round(health)+'%)'+'"></div>');
                        var healthIndicator = $('<div class="health-indicator"></div>');
                        healthIndicator.appendTo(healthBar);
                        healthIndicator.css('width', health+'%');
                        return healthBar;
                    }

                }

                // affected number
                fillNumber(country.find('.affected .number'), getAffectedNumber(0));

                // displaced number
                fillNumber(country.find('.displaced .number'), getDisplacedNumber(0));

                // in need
                fillNumber(country.find('.in-need .number'), getInNeedNumber(0));

                // access constraints
                fillNumber(country.find('.access-constraints .number'), getAccessConstraintsNumber(0));

                // geo score
                fillNumber(country.find('.geo-ranking .number'), getGeoScore(0));

                var affectedAvailabilityPercent0 = getHumanAvailability(0);
                var pinAvailabilityPercent0 = getPinAvailability(0);
                var humanAccessAvailability0 = getHumanAccessAvailability(0);

                getHealthBar(affectedAvailabilityPercent0, 'Affected availability').appendTo(country.find('.availability .viz'));
                getHealthBar(pinAvailabilityPercent0, 'In need availability').appendTo(country.find('.availability .viz'));
                getHealthBar(humanAccessAvailability0, 'Access constraints availability').appendTo(country.find('.availability .viz'));

                fillPercent(country.find('.availability .percent'), (affectedAvailabilityPercent0+pinAvailabilityPercent0+humanAccessAvailability0)/3);

                var affectedRecencyPercent0 = getHumanRecency(0);
                var pinRecencyPercent0 = getPinRecency(0);
                var accessRecencyPercent0 = getAccessRecency(0);

                getHealthBar(affectedRecencyPercent0, 'Affected recency').appendTo(country.find('.recency .viz'));
                getHealthBar(pinRecencyPercent0, 'In need recency').appendTo(country.find('.recency .viz'));
                getHealthBar(accessRecencyPercent0, 'Access constraints recency').appendTo(country.find('.recency .viz'));

                function getAveragePercent(p1, p2, p3){
                    var sum = 0;
                    if(p1 && p1 > 0) sum+=p1;
                    if(p2 && p2 > 0) sum+=p2;
                    if(p3 && p3 > 0) sum+=p3;
                    return sum/3;
                }

                fillPercent(country.find('.recency .percent'), getAveragePercent(affectedRecencyPercent0,pinRecencyPercent0,accessRecencyPercent0));

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

                    // displaced number change
                    country.find('.displaced .fa').addClass(getChangeFa(getDisplacedNumber(0) - getDisplacedNumber(1)));

                    // in need number change
                    country.find('.in-need .fa').addClass(getChangeFa(getInNeedNumber(0) - getInNeedNumber(1)));

                    // access constraints number change
                    country.find('.access-constraints .fa').addClass(getChangeFa(getAccessConstraintsNumber(0) - getAccessConstraintsNumber(1)));

                    // geo ranking change
                    country.find('.geo-ranking .fa').addClass(getChangeFa(getGeoScore(0) - getGeoScore(1)));

                    // availability change
                    country.find('.availability .fa').addClass(getChangeFa(getAveragePercent(affectedAvailabilityPercent0,pinAvailabilityPercent0,humanAccessAvailability0) - getAveragePercent(getHumanAvailability(1),getPinAvailability(1),getHumanAccessAvailability(1)) ));

                    country.find('.recency .fa').addClass(getChangeFa(getAveragePercent(affectedRecencyPercent0+pinRecencyPercent0+accessRecencyPercent0) - getAveragePercent(getHumanRecency(1),getPinAvailability(1),getAccessRecency(1)) ));

                    function getReportChangePercentage(){
                        function getFields(index){
                            let report = current.weeklyReports[index].data;
                            let accessPin = report['access-pin'];
                            let human = report.human;
                            let people = report.people;
                            return [report.access, accessPin.number, accessPin.source, accessPin.comment, human.number, human.source, human.comment, report.ipc, people['at-risk'], people['at-risk-source'], people['at-risk-comment'], people['moderate'], people['moderate-source'], people['moderate-comment'], people['planned'], people['planned-source'], people['planned-comment'], people['severe'], people['severe-source'], people['severe-comment'], people['total'], people['total-source'], people['total-comment'], report['final-severity-score']];
                        }

                        let fieldsWeek0 = getFields(0);
                        let fieldsWeek1 = getFields(1);
                        let total = 0;
                        let change = 0;

                        for(let i=0; i<fieldsWeek0.length; i++){
                            if(fieldsWeek0[i]){
                                let keys = Object.keys(fieldsWeek0[i]);
                                for(let j=0; j<keys.length; j++){
                                    if(fieldsWeek0[i][keys[j]] != fieldsWeek1[i][keys[j]]){
                                        ++change;
                                    }
                                    ++total;
                                }
                            }
                        }
                        if(total != 0){
                            return 100*change/total;
                        }
                        return -1;
                    }

                    var reportChange = getReportChangePercentage();
                    fillPercent(country.find('.change .percent'), reportChange);

                    if(reportChange < 0){

                    } else if(reportChange == 0){
                        country.find('.change .viz svg').remove();
                        $('<div class="no-change-block" data-toggle="tooltip" title="No change"></div>').appendTo(country.find('.change .viz'));
                    } else{
                        function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
                            var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

                            return {
                                x: centerX + (radius * Math.cos(angleInRadians)),
                                y: centerY + (radius * Math.sin(angleInRadians))
                            };
                        }

                        function describeArc(x, y, radius, startAngle, endAngle){
                            var start = polarToCartesian(x, y, radius, endAngle);
                            var end = polarToCartesian(x, y, radius, startAngle);

                            var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

                            var d = [
                                "M", start.x, start.y,
                                "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
                            ].join(" ");

                            return d;
                        }
                        var path = country.find('.change .viz svg path');
                        path.attr('d', describeArc(24, 24, 16, 0, reportChange*360/100));
                        $('<div class="change-block" data-toggle="tooltip" title="'+Math.round(reportChange)+'% changed"></div>').appendTo(country.find('.change .viz'));
                    }
                }

                var affectedList = [];
                var displacedList = [];
                var pinList = [];
                var accessConstraintsList = [];
                var geoRankList = [];
                for(var index=0; index<current.weeklyReports.length; index++){
                    var affected = getAffectedNumber(index);
                    var displaced = getDisplacedNumber(index);
                    var pin = getInNeedNumber(index);
                    var access = getAccessConstraintsNumber(index);
                    var geo = getGeoScore(index);
                    affectedList.push(isNaN(affected)? 0: affected);
                    displacedList.push(isNaN(displaced)? 0: displaced);
                    pinList.push(isNaN(pin)? 0: pin);
                    accessConstraintsList.push(isNaN(access)? 0: access);
                    geoRankList.push(isNaN(geo)? 0: geo);
                }

                var sparkLineYMax = Math.max(...[
                    Math.max(...affectedList),
                    Math.max(...displacedList),
                    Math.max(...pinList),
                    Math.max(...accessConstraintsList)
                ]);

                country.find('.affected .viz').sparkline(affectedList.reverse(), {type: 'line', width: '100% ', height: '48px ', lineColor: '#2980b9', fillColor: 'rgba(0, 50, 255, 0.1)', chartRangeMinX: 0, chartRangeMaxX: 5, chartRangeMin: 0, chartRangeMax: sparkLineYMax});
                country.find('.displaced .viz').sparkline(displacedList.reverse(), {type: 'line', width: '100% ', height: '48px ', lineColor: '#f00000', fillColor: 'rgba(255, 80, 0, 0.4)', chartRangeMinX: 0, chartRangeMaxX: 5, chartRangeMin: 0, chartRangeMax: sparkLineYMax});
                country.find('.in-need .viz').sparkline(pinList.reverse(), {type: 'line', width: '100% ', height: '48px ', lineColor: '#c0392b', fillColor: 'rgba(255, 0, 0, 0.1)', chartRangeMinX: 0, chartRangeMaxX: 5, chartRangeMin: 0, chartRangeMax: sparkLineYMax});
                country.find('.access-constraints .viz').sparkline(accessConstraintsList.reverse(), {type: 'line', width: '100% ', height: '48px ', lineColor: '#212121', fillColor: 'rgba(0,0,0,0.3)', chartRangeMinX: 0, chartRangeMaxX: 5, chartRangeMin: 0, chartRangeMax: sparkLineYMax});
                country.find('.geo-ranking .viz').sparkline(geoRankList.reverse(), {type: 'bar', height: '48px ', chartRangeMin: 0, chartRangeMax: 3, width: '100%', barWidth: 12, barSpacing: 4, barColor: '#cc2d06'});
            }
        }
    }


    // scroll to active country
    $('#countries').scrollTop($('#countries .active').position().top - $('#countries .active').height()*2);

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

    $('label[data-sort]').on('click', function(){
        var sortQuery = $(this).data('sort');
        var sortAsc = true;
        if( $(this).data('sort-asc')){
            sortAsc = false;
        }

        var countryList = $('#countries');
        var countryListItems = countryList.children('.country').get();
        countryListItems.sort(function(a, b){
            var textA = $(a).find(sortQuery).text().replace(/\s/g, '');
            var textB = $(b).find(sortQuery).text().replace(/\s/g, '');
            if( isNaN(parseFloat(textA)) ){
                return sortAsc? ((textA > textB)? 1: (textB > textA)? -1: 0) : ((textB > textA)? 1: (textA > textB)? -1: 0);
            }
            else{
                return sortAsc? parseFloat(textA) - parseFloat(textB) : parseFloat(textB) - parseFloat(textA);
            }
        });
        $.each(countryListItems, function(index, item){ countryList.append(item) });

        //var countryList = $('#countries .country');
        //var sortedCountries = $(countryList.toArray().sort());

        //let countries = $('#countries');

        // countryList.each(function(i){
        //     $(this).after(sortedCountries.eq(i));
        // });


        var asc = $('.asc');
        asc.data('sort-asc', null);
        asc.removeClass('asc');

        var dsc = $('.dsc');
        dsc.data('sort-asc', null);
        dsc.removeClass('dsc');

        $(this).data('sort-asc', sortAsc);
        $(this).addClass(sortAsc? 'asc' : 'dsc');
    });
});
