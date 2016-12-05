$(document).ready(function() {
    function adjustLeadType(type){
        switch(type){
            case "website":
                $('#description-row').hide();
                $('#attachment-row').hide()
                $('#url-row').show();
                $('#website-row').show();
                break;
            case "manual":
                $('#description-row').show();
                $('#url-row').hide();
                $('#website-row').hide();
                $('#attachment-row').hide()
                break;
            case "attachment":
                $('#attachment-row').show()
                $('#description-row').hide();
                $('#url-row').hide();
                $('#website-row').hide();
                break;
        }
    }
    // jquery date plugin
    //$( "#published-at" ).datepicker({ dateFormat: 'dd-mm-yy' });

    // automatically fill website when url gets pasted on
    $('input[name="url"]').on('paste', function(e){
        var url = e.originalEvent.clipboardData.getData('text');
        console.log(url);
        var domain;
        //find & remove protocol (http, ftp, etc.) and get domain
        if (url.indexOf("://") > -1) {
            domain = url.split('/')[2];
        }
        else {
            domain = url.split('/')[0];
        }
        //find & remove port number
        domain = domain.split(':')[0];
        $('input[name="website"]').val(domain);
    });

    $("input[name='lead-type']:radio").change(function () {
        adjustLeadType($("input[name='lead-type']:checked").val());
    });

    adjustLeadType($("input[name='lead-type']:checked").val());

    $('#source').selectize();
    $('#content-format').selectize();
    $('#confidentiality').selectize();
    $('#assigned-to').selectize();
});
