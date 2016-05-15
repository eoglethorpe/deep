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
                    return formatDate(data.created_at)+'<br>'+data.created_by_name;
                }
            },
            {data: "lead_name"},
            {
                data: null,
                render: function (data, type, row){
                    excerpt = data.excerpt;

                    // shorten if too long
                    if( excerpt.length > 100 ){
                        excerpt = excerpt.substr(0, 50) + "...";
                    }

                    return excerpt;
                }
            },

            {data: null, render: function(data, type, row){ return data.severity?severities[data.severity]:'';}},
            {data: null, render: function(data, type, row){ return data.reliability?reliabilities[data.reliability]:'';}},
            {data: null, render: function(data, type, row){ return data.problem_timeline?problemTimelines[data.problem_timeline]:'';}},
            {data: null, render: function(data, type, row){ return data.status?statuses[data.status]:'';}}

        ]
    });
});

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}
