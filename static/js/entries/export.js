var heirarchy;
$(document).ready(function(){
    $( "#sortable" ).sortable({
        stop: function(event, ui){
            heirarchy = $( "#sortable" ).sortable("toArray");
            //console.log(heirarchy);
        }
    });
    $( "#sortable" ).disableSelection();

    heirarchy = $( "#sortable" ).sortable("toArray");


    $('#export-doc').submit(function () {
        $("<input>").attr({
            'type': 'hidden',
            'name': 'order',
        }).val(heirarchy).appendTo($('#export-doc'));
    });


});
