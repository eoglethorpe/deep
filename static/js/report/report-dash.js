$(document).ready(function(){
    $('#select-event').selectize();

    $('#countries').scrollTop($('#countries .active').position().top - $('#countries .active').height());

    $('#select-event').change(function() {
        var event = $(this).val();
        window.location.href = window.location.pathname+"?"+$.param({event:event})+"&country="+$(this).data('country-pk');
    });

    $('.country').on('click', function(){
        window.location.href = $(this).data('href');
    });

}


    $('#country-list').scrollTop($('#country-list .active').position().top - 100);


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
