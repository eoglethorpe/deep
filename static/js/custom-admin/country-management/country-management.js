
var tabs = [
    generalTab, keyFiguresTab, mediaSourcesTab,
];

$(document).ready(function() {

    $('.number').on('change input paste drop', function(){
        formatNumber($(this));
    });

    // Initialize all tabs
    for (var i=0; i<tabs.length; i++) {
        tabs[i].init();
    }

    $('#country-list .country').click(function() {
        // Get the country
        var code = $(this).data('country-code');
        var country = countries[code];

        // Load country data in each tab
        for (var i=0; i<tabs.length; i++) {
            tabs[i].loadForCountry(code, country);
        }

        $('.number').each(function(){
            formatNumber($(this));
        });

        // Set active state
        $('.active').removeClass('active');
        $(this).addClass('active');

    });

    // Tab navigation
    $('#navigator').on('click', 'a', function(){
        var that = $('#navigator .nav-active');
        $(that.data('target')).hide();
        that.removeClass('nav-active');

        $($(this).data('target')).show();
        $(this).addClass('nav-active');
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

        // Preprocess on each tab
        for (var i=0; i<tabs.length; i++) {
            if (!tabs[i].onSubmit())
                return false;
        }

        return true;
    });
});


function addNewCountry() {
    $('.active').removeClass('active');

    for (var i=0; i<tabs.length; i++) {
        tabs[i].loadEmpty();
    }
}
