$(document).ready(function() {
    function adjustLeadType(type){
        switch(type){
            case "website":
                $('#description-row').hide();
                $('#attachment-row').hide()
                $('#url-row').show();
                $('#website-row').show();
                $('#attachment-dropzone').removeClass('dropzone');
                break;
            case "manual":
                $('#description-row').show();
                $('#url-row').hide();
                $('#website-row').hide();
                $('#attachment-row').hide()
                $('#attachment-dropzone').removeClass('dropzone');
                break;
            case "attachment":
                $('#attachment-row').show()
                $('#description-row').hide();
                $('#url-row').hide();
                $('#website-row').hide();
                $('#attachment-dropzone').addClass('dropzone');
                break;
        }

    }
    $("input[name='lead-type']:radio").change(function () {
        adjustLeadType($("input[name='lead-type']:checked").val());
    });

    adjustLeadType($("input[name='lead-type']:checked").val());

    $('#source').selectize();
    $('#content-format').selectize();
    $('#confidentiality').selectize();
    $('#assigned-to').selectize();
});
