var heirarchy;
var dateRangeInputModal;

$(document).ready(function(){
    dateRangeInputModal = new Modal('#date-range-input');

    $('#export-entries-doc-form button').attr('disabled', true);
    initEntryFilters();

    $( "#sortable" ).sortable({
        stop: function(event, ui){
            heirarchy = $( "#sortable" ).sortable("toArray");
            //console.log(heirarchy);
        }
    });
    $( "#sortable" ).disableSelection();

    heirarchy = $( "#sortable" ).sortable("toArray");


    $('#export-entries-doc-form').submit(function () {
        filterEntries();

        $("<input>").attr({
            'type': 'hidden',
            'name': 'order',
        }).val(heirarchy).appendTo($(this));

        var informationList = [];
        for (var i=0; i<entries.length; i++) {
            for (var j=0; j<entries[i].informations.length; j++) {
                informationList.push(entries[i].informations[j].id);
            }
        }
        $("<input>").attr({
            'type': 'hidden',
            'name': 'informations',
        }).val(JSON.stringify(informationList)).appendTo($(this));
    });

    $('.export-filter-submit').click(function(event){
        $('#new-format').remove();
        $('#is-pdf').remove();
        let type = $(this).data('type'),
            formatNode = $('<input>'),
            isPdf = $(this).data('pdf');

        formatNode.attr('id', 'new-format')
            .attr('type', 'hidden').val('true');

        if (isPdf == true){
            let isPdfInput = $('<input>');
            isPdfInput.attr('id', 'is-pdf')
                .attr('type', 'hidden')
                .attr('name', 'is-pdf').val(true);
            $('#export-entries-doc-form').append(isPdfInput);
        }
        if (type != 'generic-export') {
            if( type == 'geo-export'){
                formatNode.attr('name', 'export-geo-format');
            }else if(type == 'briefing-export'){
                formatNode.attr('name', 'new-format');
            }
            $('#export-entries-doc-form').append(formatNode);
        }

        console.log($('#new-format')[0].outerHTML);
        console.log(isPdf);
    });
});


// Needed by entries filter module
function renderEntries(completed) {
    if (completed) {
        $('#export-entries-doc-form button').attr('disabled', false);
    }
}
