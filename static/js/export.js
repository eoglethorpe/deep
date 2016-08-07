$(document).ready(function(){
    $( "#sortable" ).sortable({
        change: function(event, ui){
            heirarchy = $( "#sortable" ).sortable("toArray");
        }
    });
    $( "#sortable" ).disableSelection();

    heirarchy = $( "#sortable" ).sortable("toArray");
});
