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

});


// Needed by entries filter module
function renderEntries(completed) {
    if (completed) {
        $('#export-entries-doc-form button').attr('disabled', false);
    }
}
