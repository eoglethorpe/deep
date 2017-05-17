

$(document).ready(function(){
    generalTab.init();

    $('#admin-boundary-list .admin-boundary').click(function() {
        if (!confirmChanges()) {
            return;
        }

        $('.admin-boundary.active').removeClass('active');
        $(this).addClass('active');

        let code = $(this).data('country-code');
        let country = countries[code];
        generalTab.loadForCountry(country.code, country);

        $('#selected-country-code').val(code);
        $('#selected-country-modified').val(country.modified?'1':'0');
        $('#selected-country-modified').change();

        $('#admin-boundary-detail form').data('changed', false);
    });

    $('#admin-boundary-detail form :input').on('change input paste drop', function() {
        if ($(this).is('#selected-country-modified')) {
            return;
        }
        $('#selected-country-modified').val('1');
        $('#selected-country-modified').change();
        $('#admin-boundary-detail form').data('changed', true);
    });

    $('#selected-country-modified').change(function() {
        let modified = $(this).val() == '1';
        $('#admin-boundary-detail h3 small').text('(' + (modified?'modified':'original') + ')');
    });

    $('#admin-boundary-list .admin-boundary:first-child').click();

    // Search geoarea
    $('#search-geoarea').on('change input drop paste', function() {
        let searchText = $('#search-geoarea').val().trim().toLowerCase();
        if (searchText.length == 0) {
            $('#admin-boundary-list .admin-boundary').show();
        } else {
            $('#admin-boundary-list .admin-boundary').each(function() {
                if ($(this).data('name').toLowerCase().indexOf(searchText) < 0) {
                    $(this).hide();
                } else {
                    $(this).show();
                }
            });
        }
    });
});


function confirmChanges() {
    if ($('#admin-boundary-detail form').data('changed')) {
        return confirm('Moving away will discard your changes');
    }
    return true;
}
