
$(document).ready(function(){

    $('#date-created-filter').selectize();
    $('#areas-filter').selectize();
    $('#sectors-filter').selectize();
    $('#affected-groups-filter').selectize();
    $('#vulnerable-groups-filter').selectize();
    $('#specific-needs-groups-filter').selectize();

    $.getJSON("/api/v1/entries/?event="+eventId, function(data){
        refreshList(data);
    });
});

function refreshList(data) {
    console.log(data);
}