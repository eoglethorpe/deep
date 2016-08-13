$(document).ready(function(){
    $( "#sortable" ).sortable({
        stop: function(event, ui){
            heirarchy = $( "#sortable" ).sortable("toArray");
            //console.log(heirarchy);
        }
    });
    $( "#sortable" ).disableSelection();

    heirarchy = $( "#sortable" ).sortable("toArray");
});
