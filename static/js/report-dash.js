$(document).ready(function(){
    $('#select-event').selectize();
});

function addWeeklyReport() {
    var event_pk = $("#select-event").val();
    location.href = weekly_report_url.replace("XX", selection_pk).replace("99", event_pk)
}
