var heirarchy;
$(document).ready(function(){

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
        // console.log(informationList);
        $("<input>").attr({
            'type': 'hidden',
            'name': 'informations',
        }).val(JSON.stringify(informationList)).appendTo($(this));
    });


});


// Needed by entries filter module
function renderEntries() {}
