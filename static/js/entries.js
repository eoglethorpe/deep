$(document).ready(function() {
    var entriesTable = $('#entries-table').DataTable({
        ajax: {
            type: "GET",
            dataType: "json",
            dataSrc: '',
            url: "/api/v1/entries/?event=" + currentEvent,
        },
        columns: [
            {
                data: null,
                render: function (data, type, row ) {
                    return "not yet";
                }
            },
            {data: "lead"},
            {data: "excerpt"},
        ]
    });
});
