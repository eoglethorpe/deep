var reports = null;
var documentReady = false;
var dataReady = false;


$.getJSON("/static/api/weekly-snapshot.json"+ '?timestamp=' + (new Date().getTime()), function(data){
    reports = data;
    $('header .loader').hide();
    dataReady = true;
    fillCountryDetails();
});

$(document).ready(function(){
    documentReady = true;
    fillCountryDetails();

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
    selectCountryEvent(defaultCountryPk, defaultEventPk);

    // scroll to active country
    $('#countries').scrollTop($('#countries .active').position().top - $('#countries .active').height()*2);

    // change event
    $('#select-event').change(function() {
        // var event = $(this).val();
        if ($(this).val()) {
            selectCountryEvent($(this).data('country-pk'), $(this).val());
        }
        // window.location.href = window.location.pathname+"?"+$.param({event:event})+"&country="+$(this).data('country-pk');
    });

    // change country
    $('.country').on('click', function(){
        selectCountryEvent($(this).data('pk'), null);
        // window.location.href = $(this).data('href');
    });


    function filterCountries(){
        var projectStatus = $('input[type=radio][name=project-status]:checked').val();
        var searchText = $('#country-search').val().trim().toLowerCase();
        $('.country').each(function(){
            if ((projectStatus == '2' || $(this).data('project-status') == projectStatus) &&
                (searchText.length === 0 || $(this).text().trim().toLowerCase().indexOf(searchText) != -1))
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
    $('input[type=radio][name=project-status]').change(function(){
        $('#project-status label').removeClass('active');
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
        $.each(countryListItems, function(index, item) { countryList.append(item); });

        var asc = $('.asc');
        asc.data('sort-asc', null);
        asc.removeClass('asc');

        var dsc = $('.dsc');
        dsc.data('sort-asc', null);
        dsc.removeClass('dsc');

        $(this).data('sort-asc', sortAsc);
        $(this).addClass(sortAsc? 'asc' : 'dsc');
    });


    function selectCountryEvent(countryPk, eventPk) {
        let reportsContainer = $('#weekly-reports');
        reportsContainer.find('.weekly-report').remove();

        $('.country.active').removeClass('active');
        $('.country[data-pk="' + countryPk + '"]').addClass('active');

        $('#weekly-report-panel-header h2').text(countryEvents[countryPk].name);

        if (countryEvents[countryPk]) {

            // First add all events for this country
            let eventsSelect = $('#weekly-report-panel-header select')[0].selectize;
            $('#weekly-report-panel-header select').data('country-pk', countryPk);
            eventsSelect.clearOptions();

            if (countryEvents[countryPk].events.length > 0) {
                if (!eventPk) {
                    eventPk = countryEvents[countryPk].events[0].id;
                }

                for (let i=0; i<countryEvents[countryPk].events.length; i++) {
                    let epk = countryEvents[countryPk].events[i].id;
                    eventsSelect.addOption({value: epk, text: countryEvents[countryPk].events[i].name});
                }
            }
            eventsSelect.setValue(eventPk, true);

            // Then add the add new report for this event
            let addButton = $('#add-weekly-report-btn');
            addButton.attr('href', '/report/weekly/add/' + countryPk + '/' + eventPk + '?start_date=' + addButton.data('start-date'));
            addButton.show();

            // Next add reports for this event
            let selectedReports = countryEvents[countryPk].events.find(e => e.id == eventPk).reports;

            if (selectedReports.length > 0) {
                reportsContainer.find('.empty-text')[0].style.display = 'none';

                selectedReports.sort(function(r1, r2) {
                    return new Date(r2.start_date) - new Date(r1.start_date);
                });

                for (let i=0; i<selectedReports.length; i++) {
                    let report = selectedReports[i];
                    let reportElement = $('#weekly-report-list .weekly-report-template').clone();
                    reportElement.removeClass('weekly-report-template').addClass('weekly-report');

                    reportElement.find('.number').text(new Date(report.start_date).getWeek());
                    reportElement.find('.start-date').text(formatDate(report.start_date));
                    reportElement.find('.end-date').text(formatDate(new Date(report.start_date).addDays(6)));
                    reportElement.find('a.edit-btn').attr('href', '/report/weekly/edit/' + countryPk + '/' + eventPk + '/' + report.id);
                    reportElement.find('a.delete-btn').click(function() {
                        if(confirm('Are you sure you want to delete the report?')) {
                            window.location.href = '/report/weekly/delete/' + countryPk + '/' + eventPk + '/' + report.id;
                        }
                    });

                    reportElement.appendTo(reportsContainer);
                    reportElement.show();
                }
            } else{
                reportsContainer.find('.empty-text')[0].style.display = 'flex';
            }

        }
        reportsContainer.find('.loading-text')[0].style.display = 'none';
    }

    $('#refresh-button').click(function() {
        $(this).attr('disabled', true);
        $(this).find('.fa').addClass('fa-spin');
        $.get('/report/weekly/backup/', () => {
            $(this).find('.fa').removeClass('fa-spin');
            syncUpdateTimes();
            $(this).attr('disabled', false);
        });
    });

    setInterval(syncUpdateTimes, 30000);
});


function syncUpdateTimes() {
    $.get('/report/weekly/get-update-times/', (response) => {
        if (!response.success) {
            return;
        }
        $('main .title-container .last').text(response.last_updated);
        $('main .content .next').closest('.content').find('.next').text(response.next_update);
    });
}

function fillCountryDetails(){
    if(!documentReady || !dataReady){
        return;
    }

    reports.sort(function(a, b){
        var ca = a.country.name.toUpperCase();
        var cb = b.country.name.toUpperCase();
        return (ca < cb)? -1: (ca > cb)? 1: 0;
    });

    let countries = [];
    let currentCountry = null;

    for (var i=0; i<reports.length; i++){
        let report = reports[i];

        if (!currentCountry || currentCountry.name != report.country.name){
            currentCountry = new Country(report.country.name, report.country.code);
            countries.push(currentCountry);
        }
        currentCountry.weeklyReports.push(new WeeklyReport(report.start_date, report.data));
    }
    for (let i=0; i<countries.length; i++){
        var country = countries[i];
        var countryElement = $('#countries .country[data-pk="'+country.code+'"]');

        // sort report chronologically
        country.weeklyReports.sort(function(a, b){
            return (new Date(b.startDate)) - (new Date(a.startDate));
        });

        // affected number
        fillNumber(countryElement.find('.affected .number'), country.weeklyReports[0].getAffectedNumber());

        // displaced number
        fillNumber(countryElement.find('.displaced .number'), country.weeklyReports[0].getDisplacedNumber());

        // in need
        fillNumber(countryElement.find('.in-need .number'), country.weeklyReports[0].getInNeedNumber());

        // access constraints
        fillNumber(countryElement.find('.access-constraints .number'), country.weeklyReports[0].getAccessConstraintsNumber());

        // geo score
        fillNumber(countryElement.find('.geo-ranking .number'), country.weeklyReports[0].getGeoScore());

        var affectedAvailabilityPercent0 = country.weeklyReports[0].getHumanAvailability();
        var pinAvailabilityPercent0 = country.weeklyReports[0].getPinAvailability();
        var humanAccessAvailability0 = country.weeklyReports[0].getHumanAccessAvailability();

        getHealthBar(affectedAvailabilityPercent0, 'Affected availability').appendTo(countryElement.find('.availability .viz'));
        getHealthBar(pinAvailabilityPercent0, 'In need availability').appendTo(countryElement.find('.availability .viz'));
        getHealthBar(humanAccessAvailability0, 'Access constraints availability').appendTo(countryElement.find('.availability .viz'));

        fillPercent(countryElement.find('.availability .percent'), (affectedAvailabilityPercent0+pinAvailabilityPercent0+humanAccessAvailability0)/3);

        var affectedRecencyPercent0 = country.weeklyReports[0].getHumanRecency();
        var pinRecencyPercent0 = country.weeklyReports[0].getPinRecency();
        var accessRecencyPercent0 = country.weeklyReports[0].getAccessRecency();

        getHealthBar(affectedRecencyPercent0, 'Affected recency').appendTo(countryElement.find('.recency .viz'));
        getHealthBar(pinRecencyPercent0, 'In need recency').appendTo(countryElement.find('.recency .viz'));
        getHealthBar(accessRecencyPercent0, 'Access constraints recency').appendTo(countryElement.find('.recency .viz'));

        fillPercent(countryElement.find('.recency .percent'), getAveragePercent(affectedRecencyPercent0,pinRecencyPercent0,accessRecencyPercent0));

        if(country.weeklyReports[1]) {
            // affected number change
            countryElement.find('.affected .fa').addClass(getChangeFa(country.weeklyReports[0].getAffectedNumber() - country.weeklyReports[1].getAffectedNumber()));

            // displaced number change
            countryElement.find('.displaced .fa').addClass(getChangeFa(country.weeklyReports[0].getDisplacedNumber() - country.weeklyReports[1].getDisplacedNumber()));

            // in need number change
            countryElement.find('.in-need .fa').addClass(getChangeFa(country.weeklyReports[0].getInNeedNumber() - country.weeklyReports[1].getInNeedNumber()));

            // access constraints number change
            countryElement.find('.access-constraints .fa').addClass(getChangeFa(country.weeklyReports[0].getAccessConstraintsNumber() - country.weeklyReports[1].getAccessConstraintsNumber()));

            // geo ranking change
            countryElement.find('.geo-ranking .fa').addClass(getChangeFa(country.weeklyReports[0].getGeoScore() - country.weeklyReports[1].getGeoScore()));

            // availability change
            countryElement.find('.availability .fa').addClass(getChangeFa(getAveragePercent(affectedAvailabilityPercent0,pinAvailabilityPercent0,humanAccessAvailability0) - getAveragePercent(country.weeklyReports[1].getHumanAvailability(),country.weeklyReports[1].getPinAvailability(),country.weeklyReports[1].getHumanAccessAvailability()) ));

            countryElement.find('.recency .fa').addClass(getChangeFa(getAveragePercent(affectedRecencyPercent0+pinRecencyPercent0+accessRecencyPercent0) - getAveragePercent(country.weeklyReports[1].getHumanRecency(), country.weeklyReports[1].getPinRecency(), country.weeklyReports[1].getAccessRecency()) ));

            const reportChangeObj = country.getWeeklyReportChangePercentage();
            const reportChange = reportChangeObj.percentage;
            fillPercent(countryElement.find('.change .percent'), reportChange);

            new ChangesPopup(countryElement.find('.change'), reportChangeObj.changes);

            if(reportChange < 0){
            } else if(reportChange === 0){
                countryElement.find('.change .viz svg').remove();
                $('<div class="no-change-block"></div>').appendTo(countryElement.find('.change .viz'));
            } else{
                var path = countryElement.find('.change .viz svg path');
                $('<div class="change-block"></div>').appendTo(countryElement.find('.change .viz'));
                path.attr('d', describeArc(24, 24, 16, 0, reportChange*360/100));
            }
        }

        let affectedList = [];
        let displacedList = [];
        let pinList = [];
        let accessConstraintsList = [];
        let geoRankList = [];
        for (let index=0; index<country.weeklyReports.length; index++) {
            let affected = country.weeklyReports[index].getAffectedNumber();
            let displaced = country.weeklyReports[index].getDisplacedNumber();
            let pin = country.weeklyReports[index].getInNeedNumber();
            let access = country.weeklyReports[index].getAccessConstraintsNumber();
            let geo = country.weeklyReports[index].getGeoScore();
            affectedList.push(isNaN(affected)? 0: affected);
            displacedList.push(isNaN(displaced)? 0: displaced);
            pinList.push(isNaN(pin)? 0: pin);
            accessConstraintsList.push(isNaN(access)? 0: access);
            geoRankList.push(isNaN(geo)? 0: geo);
        }

        let sparkLineYMax = Math.max(...[
            Math.max(...affectedList),
            Math.max(...displacedList),
            Math.max(...pinList),
            Math.max(...accessConstraintsList)
        ]);

        let sparkLineXMax = Math.max(affectedList.length, displacedList.length, pinList.length, accessConstraintsList.length, geoRankList.length);

        setTimeout(function(countryElement, affectedList, displacedList, pinList, accessConstraintsList, geoRankList, sparkLineYMax) {
            return function() {
                countryElement.find('.affected .viz').sparkline(affectedList.reverse(), {type: 'line', width: '100%', height: '48px', lineColor: '#2980b9', fillColor: 'rgba(0, 50, 255, 0.1)', chartRangeMinX: 0, chartRangeMaxX: sparkLineXMax, chartRangeMin: 0, chartRangeMax: sparkLineYMax});
                countryElement.find('.displaced .viz').sparkline(displacedList.reverse(), {type: 'line', width: '100%', height: '48px', lineColor: '#f00000', fillColor: 'rgba(255, 0, 0, 0.1)', chartRangeMinX: 0, chartRangeMaxX: sparkLineXMax, chartRangeMin: 0, chartRangeMax: sparkLineYMax});
                countryElement.find('.in-need .viz').sparkline(pinList.reverse(), {type: 'line', width: '100%', height: '48px', lineColor: '#c0392b', fillColor: 'rgba(255, 40 , 0, 0.4)', chartRangeMinX: 0, chartRangeMaxX: sparkLineXMax, chartRangeMin: 0, chartRangeMax: sparkLineYMax});
                countryElement.find('.access-constraints .viz').sparkline(accessConstraintsList.reverse(), {type: 'line', width: '100%', height: '48px', lineColor: '#212121', fillColor: 'rgba(0,0,0,0.3)', chartRangeMinX: 0, chartRangeMaxX: sparkLineXMax, chartRangeMin: 0, chartRangeMax: sparkLineYMax});

                let geoRankingWidth = countryElement.find('.geo-ranking .viz').innerWidth();
                let geoRankingBarWidth = geoRankingWidth/geoRankList.length*0.7;
                let geoRankingGap = geoRankingWidth/geoRankList.length*0.3;
                countryElement.find('.geo-ranking .viz').sparkline(geoRankList.reverse(), {type: 'bar', height: '48px', chartRangeMin: 0, chartRangeMax: 3, barWidth: geoRankingBarWidth, barSpacing: geoRankingGap, barColor: '#cc2d06'});
            };
        }(countryElement, affectedList, displacedList, pinList, accessConstraintsList, geoRankList, sparkLineYMax), 0);
    }
}
