var heirarchy;
var dateRangeInputModal;

$(document).ready(function(){
    dateRangeInputModal = new Modal('#date-range-input');
    $('select').selectize();

    $('#date-published-filter').change(function() {
        setDateRange($(this).val(), 'date-published');
    });
    $('#date-imported-filter').change(function() {
        setDateRange($(this).val(), 'date-imported');
    });

    $('#preview-docx').click(function() {
        let url = window.location.origin + $('#export-entries-doc-form').attr('action') + '?'
            + $('#export-entries-doc-form').serialize();

        $('#preview-section').find('iframe').attr('src', 'https://docs.google.com/viewer?url=' + encodeURIComponent(url) + '&embedded=true&chrome=false&dov=1');
        $('#preview-section').find('>div').hide();
        $('#preview-section').find('iframe').show();
    });

    $('.range-filter select').change(function() {
        let parent = $(this).closest('.range-filter');
        parent.removeClass('filled');
        parent.find('select').each(function() {
            if ($(this).val()) {
                parent.addClass('filled');
            }
        });
    });

    $('.export-format input').change(function() {
        $('.export-format label.active').removeClass('active');
        $(this).closest('label').addClass('active');
    });
});


function setDateRange(filter, id){
    let startDate = $('#' + id + '-start');
    let endDate = $('#' + id + '-end');

    let previousValue = $('#' + id + '-filter').data('previous-value');
    if (filter != 'range') {
        $('#' + id + '-filter').data('previous-value', $('#' + id + '-filter').val());
    }

    switch(filter){
        case "today":
            startDate.val(formatDateReverse(new Date()));
            endDate.val(formatDateReverse(new Date().addDays(1)));
            break;

        case "yesterday":
            yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            startDate.val(formatDateReverse(yesterday));
            endDate.val(formatDateReverse(yesterday.addDays(1)));
            break;

        case "last-seven-days":
            min = new Date();
            min.setDate(min.getDate() - 7);
            startDate.val(formatDateReverse(min));
            endDate.val(formatDateReverse(new Date().addDays(1)));
            break;

        case "this-week":
            min = new Date();
            min.setDate(min.getDate() - min.getDay());
            startDate.val(formatDateReverse(min));
            endDate.val(formatDateReverse(new Date().addDays(1)));
            break;

        case "last-thirty-days":
            min = new Date();
            min.setDate(min.getDate() - 30);
            startDate.val(formatDateReverse(min));
            endDate.val(formatDateReverse(new Date().addDays(1)));
            break;

        case "this-month":
            min = new Date();
            min.setDate(1);
            startDate.val(formatDateReverse(min));
            endDate.val(formatDateReverse(new Date().addDays(1)));
            break;

        case "range":
            dateRangeInputModal.show().then(function() {
                if (dateRangeInputModal.action == 'proceed') {
                    startDate.val(formatDateReverse(new Date($('#date-range-input #start-date').val())));
                    endDate.val(formatDateReverse(new Date($('#date-range-input #end-date').val()).addDays(1)));
                } else {
                    $('#' + id + '-filter')[0].selectize.setValue(previousValue?previousValue:null, true);
                }
            });
            break;

        default:
            startDate.val(null);
            endDate.val(null);
    }
}
