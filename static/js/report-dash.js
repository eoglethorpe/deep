$(document).ready(function(){
});

function addWeeklyReport() {
    var event_pk = $("#event-select").val();
    location.href = weekly_report_url.replace("XX", selection_pk).replace("99", event_pk)
}
