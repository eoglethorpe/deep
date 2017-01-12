$(document).ready(function(){
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
            var country = $('#countries .country[data-name="'+current.country+'"]');
            current.weeklyReports.sort(function(a, b){
                return (new Date(a.startDate)) < (new Date(b.startDate));
            });

            if(current.weeklyReports.length > 0){
                // affected number
                var affectedNumber = current.weeklyReports[0].data.human.number['8'];   // TODO: fix this hack i.e. '8'
                country.find('.affected .number').text(affectedNumber);

                // in need
                var inNeedNumber = current.weeklyReports[0].data.people.total['1'];
                country.find('.in-need .number').text(inNeedNumber);

                // access constraints
                var accessConstraintsNumber = parseInt(current.weeklyReports[0].data['access-pin'].number['2']) + parseInt(current.weeklyReports[0].data['access-pin'].number['3']);
                country.find('.access-constraints .number').text(accessConstraintsNumber);

                if(typeof current.weeklyReports[1] != 'undefined'){
                    function getChangeFa(num){
                        if(num > 0){
                            return 'fa-arrow-up';
                        } else if(num < 0){
                            return 'fa-arrow-down';
                        } else{
                            return 'fa-arrow-right';
                        }
                    }

                    // affected number change
                    country.find('.affected .fa').addClass(getChangeFa(parseInt(affectedNumber) - parseInt(current.weeklyReports[1].data.human.number['8'])));

                    // in need number change
                    country.find('.in-need .fa').addClass(getChangeFa(parseInt(inNeedNumber) - parseInt(current.weeklyReports[1].data.people.total['1'])));

                    // access constraints number change
                    country.find('.access-constraints .fa').addClass(getChangeFa(accessConstraintsNumber - (parseInt(current.weeklyReports[1].data['access-pin'].number['2']) + parseInt(current.weeklyReports[1].data['access-pin'].number['3'])) ));
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

    // Search country
    $('#search-country').on('cut input paste drop keyup', function() {
        var query = $(this).val().trim().toLowerCase();
        if (query == '')
            $('#country-list .country-container').show();
        else {
            $('#country-list .country-container').each(function() {
                if ($(this).data('name').trim().toLowerCase().indexOf(query) >= 0) {
                    $(this).show();
                }
                else {
                    $(this).hide();
                }
            });
        }
    });

});
